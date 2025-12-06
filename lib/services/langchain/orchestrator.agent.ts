import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages'
import { v4 as uuidv4 } from 'uuid'
import {
	allAgentTools,
	executeSeverityAssessment,
	executeVectorStoreRetrieval,
	executeDrugInteractionCheck,
	executeFDADrugLookup,
	executeRxNormValidation,
	executePubMedSearch,
} from './tools'
import {
	ORCHESTRATOR_SYSTEM_PROMPT,
	CLINICAL_REASONER_SYSTEM_PROMPT,
} from './prompts'
import type {
	AgentContext,
	AgentStep,
	PatientContext,
	AgentExecutionResult,
	ExecutionSummary,
	MedicationRecommendation,
	SafetyCheckResult,
	SafetyIssue,
	AgentToolResult,
} from './types'
import type { AIAnalysisResponse, Medication } from '@/src/modules/treatment-plans'

const MODEL = 'gpt-4-turbo-preview'
const TEMPERATURE = 0.2

export class OrchestratorAgent {
	private llm: ChatOpenAI

	constructor() {
		this.llm = new ChatOpenAI({
			modelName: MODEL,
			temperature: TEMPERATURE,
			openAIApiKey: process.env.OPENAI_API_KEY,
		})
	}

	async analyzeTreatment(patientContext: PatientContext): Promise<AgentExecutionResult> {
		const startTime = Date.now()
		const sessionId = uuidv4()
		
		const context: AgentContext = {
			sessionId,
			patientData: patientContext,
			currentStep: this.createStep('orchestrator', 'initialize'),
			previousSteps: [],
			accumulatedEvidence: {
				clinicalGuidelines: [],
				drugInformation: [],
				interactions: [],
				contraindications: [],
				pubmedReferences: [],
			},
		}

		const toolsUsed: Set<string> = new Set()
		const agentsInvoked: Set<string> = new Set(['orchestrator'])

		try {
			console.log('Step 1: Assessing case severity...')
			const severityResult = await executeSeverityAssessment({
				chiefComplaint: patientContext.chiefComplaint,
				currentSymptoms: patientContext.currentSymptoms,
				vitalSigns: patientContext.vitalSigns,
				chronicConditions: patientContext.chronicConditions,
				allergies: patientContext.allergies,
				currentMedications: patientContext.currentMedications,
			})
			toolsUsed.add('severity_assessment')

			const isSevere = severityResult.success && (severityResult.data as Record<string, unknown>)?.isSevere
			const shouldEscalate = severityResult.success && (severityResult.data as Record<string, unknown>)?.autoEscalate

			console.log('Step 2: Retrieving RAG context...')
			const ragResult = await executeVectorStoreRetrieval({
				query: `${patientContext.chiefComplaint} ${patientContext.currentSymptoms.join(' ')} treatment guidelines`,
				maxDocuments: isSevere ? 15 : 10,
				minSimilarity: isSevere ? 0.4 : 0.5,
			})
			toolsUsed.add('vector_store_retrieval')
			agentsInvoked.add('evidence_retriever')

			console.log('Step 3: Checking existing drug interactions...')
			let interactionResult: AgentToolResult | null = null
			if (patientContext.currentMedications && patientContext.currentMedications.length >= 2) {
				interactionResult = await executeDrugInteractionCheck({
					medications: patientContext.currentMedications,
					includeSeverityFilter: 'all',
				})
				toolsUsed.add('drug_interaction_check')
			}

			console.log('Step 4: Generating clinical recommendations...')
			const clinicalPrompt = this.buildClinicalPrompt(patientContext, ragResult, severityResult, interactionResult)
			
			const response = await this.llm.invoke([
				new SystemMessage(CLINICAL_REASONER_SYSTEM_PROMPT),
				new HumanMessage(clinicalPrompt),
			])

			agentsInvoked.add('clinical_reasoner')

			const parsedResponse = await this.parseAgentResponse(
				response.content as string,
				patientContext,
				context
			)

			console.log('Step 5: Validating recommended medications...')
			const validatedMedications: Medication[] = []
			for (const med of parsedResponse.medications) {
				const fdaResult = await executeFDADrugLookup({
					drugName: med.name,
					includeLabel: true,
					includeAdverseEvents: false,
				})
				toolsUsed.add('fda_drug_lookup')
				
				if (fdaResult.success) {
					validatedMedications.push({
						...med,
						confidenceScore: Math.min((med.confidenceScore || 70) + 10, 100),
					})
				} else {
					const rxnormResult = await executeRxNormValidation({
						drugName: med.name,
						checkInteractions: false,
						getAlternatives: true,
					})
					toolsUsed.add('rxnorm_validation')
					
					if (rxnormResult.success) {
						validatedMedications.push(med)
					} else {
						validatedMedications.push({
							...med,
							confidenceScore: Math.max((med.confidenceScore || 70) - 20, 30),
						})
					}
				}
			}
			agentsInvoked.add('drug_validator')

			parsedResponse.medications = validatedMedications

			console.log('Step 6: Performing final safety check...')
			const allMedsForInteractionCheck = [
				...validatedMedications.map(m => m.name),
				...(patientContext.currentMedications || []),
			]
			
			let newInteractionResult: AgentToolResult | null = null
			if (allMedsForInteractionCheck.length >= 2) {
				newInteractionResult = await executeDrugInteractionCheck({
					medications: allMedsForInteractionCheck,
					includeSeverityFilter: 'moderate_and_above',
				})
				toolsUsed.add('drug_interaction_check')
			}

			const safetyCheck = await this.performFinalSafetyCheck(
				parsedResponse.medications,
				patientContext,
				newInteractionResult || interactionResult
			)
			agentsInvoked.add('safety_checker')

			if (!safetyCheck.isApproved || safetyCheck.blockedMedications.length > 0) {
				parsedResponse.medications = parsedResponse.medications.filter(
					med => !safetyCheck.blockedMedications.includes(med.name)
				)
				
				if (safetyCheck.riskLevel === 'CRITICAL' || safetyCheck.riskLevel === 'HIGH') {
					parsedResponse.riskLevel = 'HIGH'
				} else if (safetyCheck.riskLevel === 'MEDIUM' && parsedResponse.riskLevel === 'LOW') {
					parsedResponse.riskLevel = 'MEDIUM'
				}
				
				parsedResponse.riskFactors = [
					...parsedResponse.riskFactors,
					...safetyCheck.warnings,
				]

				parsedResponse.contraindications = safetyCheck.issues
					.filter(i => i.severity === 'blocked')
					.map(i => ({
						medication: i.medication,
						reason: i.description,
						severity: 'Absolute' as const,
					}))
			}

			if (newInteractionResult?.success && newInteractionResult.data) {
				const interactionData = newInteractionResult.data as Record<string, unknown>
				const interactions = interactionData.interactions as Array<{
					drug1: string
					drug2: string
					severity: string
					description: string
					recommendation: string
				}> || []
				
				parsedResponse.drugInteractions = interactions.map(i => ({
					medication1: i.drug1,
					medication2: i.drug2,
					severity: this.mapSeverity(i.severity),
					description: i.description,
					recommendation: i.recommendation,
				}))
			}

			const executionSummary: ExecutionSummary = {
				totalSteps: 6,
				totalDurationMs: Date.now() - startTime,
				agentsInvoked: Array.from(agentsInvoked) as AgentContext['currentStep']['agentRole'][],
				toolsUsed: Array.from(toolsUsed),
				evidenceSourcesUsed: (ragResult.data as Record<string, unknown>)?.documentsFound as number || 0,
				safetyChecksPerformed: 2,
				wasEscalated: shouldEscalate as boolean,
				escalationReason: shouldEscalate ? 'Auto-escalation triggered by severity assessment' : undefined,
			}

			console.log(`Completed in ${executionSummary.totalDurationMs}ms with ${executionSummary.toolsUsed.length} tools`)

			return {
				success: true,
				response: parsedResponse,
				context,
				executionSummary,
			}
		} catch (error) {
			console.error('Orchestrator agent error:', error)
			
			return {
				success: false,
				context,
				executionSummary: {
					totalSteps: context.previousSteps.length,
					totalDurationMs: Date.now() - startTime,
					agentsInvoked: Array.from(agentsInvoked) as AgentContext['currentStep']['agentRole'][],
					toolsUsed: Array.from(toolsUsed),
					evidenceSourcesUsed: 0,
					safetyChecksPerformed: 0,
					wasEscalated: false,
				},
				error: error instanceof Error ? error.message : 'Unknown error in orchestrator agent',
			}
		}
	}

	private buildClinicalPrompt(
		patientContext: PatientContext,
		ragResult: AgentToolResult,
		severityResult: AgentToolResult,
		interactionResult: AgentToolResult | null
	): string {
		const ragData = ragResult.data as Record<string, unknown>
		const severityData = severityResult.data as Record<string, unknown>

		let prompt = `Generate a comprehensive treatment plan for the following patient:

PATIENT INFORMATION:
- Age: ${patientContext.age} years
- Gender: ${patientContext.gender}
- Known Allergies: ${patientContext.allergies.join(', ') || 'None documented'}
- Chronic Conditions: ${patientContext.chronicConditions.join(', ') || 'None documented'}
- Current Medications: ${patientContext.currentMedications.join(', ') || 'None'}

CLINICAL PRESENTATION:
- Chief Complaint: ${patientContext.chiefComplaint}
- Current Symptoms: ${patientContext.currentSymptoms.join(', ')}
`

		if (patientContext.vitalSigns) {
			prompt += `
VITAL SIGNS:
- Blood Pressure: ${patientContext.vitalSigns.bloodPressureSystolic || 'N/A'}/${patientContext.vitalSigns.bloodPressureDiastolic || 'N/A'} mmHg
- Heart Rate: ${patientContext.vitalSigns.heartRate || 'N/A'} bpm
- Temperature: ${patientContext.vitalSigns.temperature || 'N/A'}°F
- Respiratory Rate: ${patientContext.vitalSigns.respiratoryRate || 'N/A'}/min
- O2 Saturation: ${patientContext.vitalSigns.oxygenSaturation || 'N/A'}%
`
		}

		if (severityData?.isSevere) {
			prompt += `
⚠️ SEVERITY ALERT: ${severityData.severityLevel}
${severityData.summary}
Apply heightened caution in recommendations.
`
		}

		if (ragData?.documentsFound && (ragData.documentsFound as number) > 0) {
			const documents = ragData.documents as Array<Record<string, unknown>>
			const truncatedDocs = documents.slice(0, 5).map(doc => ({
				source: doc.sourceName,
				type: doc.sourceType,
				content: (doc.content as string).slice(0, 500),
			}))
			prompt += `
RELEVANT MEDICAL KNOWLEDGE (from knowledge base):
${JSON.stringify(truncatedDocs, null, 2)}
`
		}

		if (interactionResult?.success && interactionResult.data) {
			const interactionData = interactionResult.data as Record<string, unknown>
			if ((interactionData.totalInteractions as number) > 0) {
				prompt += `
⚠️ EXISTING DRUG INTERACTIONS WITH CURRENT MEDICATIONS:
${JSON.stringify(interactionData.interactions, null, 2)}
Consider these when recommending new medications.
`
			}
		}

		const hasNSAIDContraindication = patientContext.chronicConditions.some(condition => {
			const lower = condition.toLowerCase()
			return lower.includes('hypertension') || 
				lower.includes('diabetes') || 
				lower.includes('kidney') || 
				lower.includes('renal') ||
				lower.includes('ckd')
		})

		if (hasNSAIDContraindication) {
			prompt += `
⚠️ NSAID CONTRAINDICATION:
Patient has conditions that contraindicate NSAID use (${patientContext.chronicConditions.filter(c => 
	c.toLowerCase().includes('hypertension') || 
	c.toLowerCase().includes('diabetes') || 
	c.toLowerCase().includes('kidney') ||
	c.toLowerCase().includes('renal') ||
	c.toLowerCase().includes('ckd')
).join(', ')}).
DO NOT recommend NSAIDs (ibuprofen, naproxen, aspirin, etc.). Use acetaminophen for pain management instead.
`
		}

		prompt += `
REQUIREMENTS:
1. Provide specific medication recommendations with dosage, frequency, duration, and route
2. Check ALL medications against patient allergies (CRITICAL - absolute priority)
3. Consider age-appropriate dosing (patient is ${patientContext.age} years old)
4. Account for interactions with current medications
5. Provide at least one alternative treatment option
6. Assign confidence scores (0-100) based on evidence strength
7. Include non-pharmacological recommendations if appropriate

Respond with a valid JSON object containing:
{
  "medications": [
    {
      "name": "Brand Name",
      "genericName": "generic name",
      "dosage": "specific dose e.g. 500mg",
      "frequency": "how often e.g. twice daily",
      "duration": "how long e.g. 7 days",
      "route": "oral/IV/topical/etc",
      "instructions": "special instructions",
      "rationale": "why this medication",
      "confidenceScore": 0-100
    }
  ],
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "riskFactors": ["list of risk factors"],
  "riskJustification": "explanation of risk assessment",
  "rationale": "overall treatment approach rationale",
  "alternatives": [
    {
      "medications": [same structure as above],
      "rationale": "why this alternative",
      "riskLevel": "LOW" | "MEDIUM" | "HIGH"
    }
  ],
  "nonPharmacological": ["list of non-drug recommendations"],
  "followUp": ["follow-up recommendations"]
}
`

		return prompt
	}

	private async parseAgentResponse(
		output: string,
		patientContext: PatientContext,
		context: AgentContext
	): Promise<AIAnalysisResponse> {
		try {
			const jsonMatch = output.match(/\{[\s\S]*\}/)
			if (!jsonMatch) {
				throw new Error('No JSON found in agent response')
			}

			const parsed = JSON.parse(jsonMatch[0])

			const medications: Medication[] = (parsed.medications || []).map((med: Record<string, unknown>) => ({
				name: med.name as string || 'Unknown',
				genericName: med.genericName as string || '',
				dosage: med.dosage as string || '',
				frequency: med.frequency as string || '',
				duration: med.duration as string || '',
				route: med.route as string || 'Oral',
				instructions: med.instructions as string || '',
				confidenceScore: typeof med.confidenceScore === 'number' ? med.confidenceScore : 70,
			}))

			return {
				medications,
				riskLevel: parsed.riskLevel || 'MEDIUM',
				riskFactors: parsed.riskFactors || [],
				riskJustification: parsed.riskJustification || '',
				drugInteractions: [],
				contraindications: [],
				alternatives: parsed.alternatives || [],
				rationale: parsed.rationale || '',
				confidenceScore: this.calculateOverallConfidence(medications),
				generatedAt: new Date().toISOString(),
			}
		} catch (error) {
			console.error('Error parsing agent response:', error)
			console.error('Raw output:', output.slice(0, 500))
			
			return {
				medications: [],
				riskLevel: 'HIGH',
				riskFactors: ['Failed to parse AI response - manual review required'],
				riskJustification: 'Error in response parsing - treatment recommendations could not be extracted',
				drugInteractions: [],
				contraindications: [],
				alternatives: [],
				rationale: 'Response parsing failed. Please review the case manually.',
				confidenceScore: 0,
				generatedAt: new Date().toISOString(),
			}
		}
	}

	private async performFinalSafetyCheck(
		medications: Medication[],
		patientContext: PatientContext,
		existingInteractions: AgentToolResult | null
	): Promise<SafetyCheckResult> {
		const issues: SafetyIssue[] = []
		const blockedMedications: string[] = []
		const warnings: string[] = []

		for (const med of medications) {
			const medNameLower = med.name.toLowerCase()
			const genericNameLower = (med.genericName || '').toLowerCase()

			for (const allergy of patientContext.allergies) {
				const allergyLower = allergy.toLowerCase()
				
				if (medNameLower.includes(allergyLower) || 
					genericNameLower.includes(allergyLower) ||
					allergyLower.includes(medNameLower) ||
					allergyLower.includes(genericNameLower)) {
					issues.push({
						type: 'allergy',
						severity: 'blocked',
						medication: med.name,
						description: `Patient has documented allergy to ${allergy}`,
						recommendation: 'Do not prescribe - select alternative medication',
					})
					blockedMedications.push(med.name)
				}

				if (allergyLower.includes('penicillin') && 
					(medNameLower.includes('amoxicillin') || 
					 medNameLower.includes('ampicillin') ||
					 genericNameLower.includes('amoxicillin') ||
					 genericNameLower.includes('ampicillin'))) {
					issues.push({
						type: 'allergy',
						severity: 'blocked',
						medication: med.name,
						description: `Cross-reactivity risk: Patient allergic to ${allergy}, ${med.name} may cause reaction`,
						recommendation: 'Avoid beta-lactam antibiotics - use alternative class',
					})
					blockedMedications.push(med.name)
				}
			}

			const NSAID_KEYWORDS = ['ibuprofen', 'naproxen', 'aspirin', 'diclofenac', 'ketorolac', 'meloxicam', 'celecoxib', 'advil', 'motrin', 'aleve']
			const isNSAID = NSAID_KEYWORDS.some(nsaid => 
				medNameLower.includes(nsaid) || genericNameLower.includes(nsaid)
			)

			if (isNSAID) {
				const contraindicatedConditions = ['hypertension', 'high blood pressure', 'diabetes', 'chronic kidney disease', 'ckd', 'renal', 'kidney']
				const matchedConditions = patientContext.chronicConditions.filter(condition =>
					contraindicatedConditions.some(contra => condition.toLowerCase().includes(contra))
				)

				if (matchedConditions.length > 0) {
					issues.push({
						type: 'contraindication',
						severity: 'blocked',
						medication: med.name,
						description: `NSAID contraindicated due to: ${matchedConditions.join(', ')}`,
						recommendation: 'Use acetaminophen as alternative for pain management',
					})
					blockedMedications.push(med.name)
				}
			}

			if (patientContext.age < 18) {
				const pediatricRestricted = ['aspirin', 'tetracycline', 'doxycycline', 'ciprofloxacin']
				if (pediatricRestricted.some(drug => medNameLower.includes(drug) || genericNameLower.includes(drug))) {
					issues.push({
						type: 'age_related',
						severity: 'blocked',
						medication: med.name,
						description: `Medication restricted or contraindicated in pediatric patients (age ${patientContext.age})`,
						recommendation: 'Select age-appropriate alternative',
					})
					blockedMedications.push(med.name)
				}
			}

			if (patientContext.age >= 65) {
				const geriatricCaution = ['benzodiazepine', 'diazepam', 'lorazepam', 'alprazolam', 'diphenhydramine', 'benadryl']
				if (geriatricCaution.some(drug => medNameLower.includes(drug) || genericNameLower.includes(drug))) {
					issues.push({
						type: 'age_related',
						severity: 'warning',
						medication: med.name,
						description: `Beers Criteria: Use with caution in patients >= 65 years`,
						recommendation: 'Consider lower dose or alternative medication',
					})
					warnings.push(`${med.name}: Use caution in geriatric patients`)
				}
			}
		}

		if (existingInteractions?.success && existingInteractions.data) {
			const interactionData = existingInteractions.data as Record<string, unknown>
			if (interactionData.hasCriticalInteraction) {
				warnings.push('CRITICAL: Contraindicated drug combination detected')
			}
			if (interactionData.hasMajorInteraction) {
				warnings.push('WARNING: Major drug interaction detected - physician review recommended')
			}
		}

		const hasBlockedMeds = blockedMedications.length > 0
		const hasCriticalIssues = issues.some(i => i.severity === 'blocked')
		
		let riskLevel: SafetyCheckResult['riskLevel'] = 'LOW'
		if (hasCriticalIssues && blockedMedications.length > 1) riskLevel = 'CRITICAL'
		else if (hasCriticalIssues) riskLevel = 'HIGH'
		else if (warnings.length > 0) riskLevel = 'MEDIUM'

		return {
			isApproved: !hasBlockedMeds,
			riskLevel,
			issues,
			blockedMedications: [...new Set(blockedMedications)],
			warnings,
			recommendations: issues.map(i => i.recommendation),
		}
	}

	private calculateOverallConfidence(medications: Medication[]): number {
		if (medications.length === 0) return 0
		const total = medications.reduce((sum, med) => sum + (med.confidenceScore || 70), 0)
		return Math.round(total / medications.length)
	}

	private mapSeverity(severity: string): 'Mild' | 'Moderate' | 'Severe' {
		const lower = severity.toLowerCase()
		if (lower.includes('contraindicated') || lower.includes('major') || lower.includes('severe')) {
			return 'Severe'
		}
		if (lower.includes('minor') || lower.includes('mild')) {
			return 'Mild'
		}
		return 'Moderate'
	}

	private createStep(agentRole: AgentContext['currentStep']['agentRole'], action: string): AgentStep {
		return {
			stepId: uuidv4(),
			agentRole,
			action,
			input: {},
			timestamp: new Date().toISOString(),
			toolsUsed: [],
		}
	}
}

export const orchestratorAgent = new OrchestratorAgent()
