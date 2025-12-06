/**
 * OpenAI Service
 * Real OpenAI integration for medical treatment plan generation
 * With external API validation and evidence-based references
 */

import OpenAI from 'openai'
import type {
	AIAnalysisRequest,
	AIAnalysisResponse,
	Medication,
	DrugInteraction,
	Contraindication,
	AlternativePlan,
	RiskLevel,
} from '@/src/modules/treatment-plans'
import { MedicalApisService } from './medical-apis.service'
import { PubMedService, type ClinicalReference } from './pubmed.service'
import { ConfidenceService, type ConfidenceResult } from './confidence.service'
import { AssistantService } from './assistant.service'

// ============================================
// Types
// ============================================

export interface EnhancedMedication extends Medication {
	rxcui?: string
	ndcCode?: string
	evidenceLevel: 'A' | 'B' | 'C' | 'D'
	references: ClinicalReference[]
	fdaValidated: boolean
	ageAdjustedDosage?: boolean
	renalAdjustment?: string
	hepaticAdjustment?: string
	confidenceDetails?: ConfidenceResult
}

export interface EnhancedAIAnalysisResponse extends Omit<AIAnalysisResponse, 'medications'> {
	medications: EnhancedMedication[]
	overallConfidence: ConfidenceResult
	disclaimer: string
	generationMetadata: {
		model: string
		temperature: number
		validationSources: string[]
		generatedAt: string
	}
}

interface OpenAITreatmentResponse {
	medications: Array<{
		name: string
		genericName: string
		dosage: string
		frequency: string
		duration: string
		route: string
		instructions: string
		rationale: string
		confidenceScore: number
	}>
	riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
	riskFactors: string[]
	riskJustification: string
	rationale: string
	alternatives: Array<{
		medications: Array<{
			name: string
			genericName: string
			dosage: string
			frequency: string
			duration: string
			route: string
			instructions: string
			rationale: string
			confidenceScore: number
		}>
		rationale: string
		riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
	}>
}

// ============================================
// OpenAI Configuration
// ============================================

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

const MODEL = 'gpt-4-turbo-preview'
const TEMPERATURE = 0.2 // Low temperature for consistency

// ============================================
// NSAID/Renal Guardrail Configuration
// ============================================

const NSAID_MEDICATIONS = [
	'ibuprofen',
	'advil',
	'motrin',
	'naproxen',
	'aleve',
	'naprosyn',
	'aspirin',
	'diclofenac',
	'voltaren',
	'indomethacin',
	'indocin',
	'ketorolac',
	'toradol',
	'meloxicam',
	'mobic',
	'piroxicam',
	'feldene',
	'celecoxib',
	'celebrex',
	'nabumetone',
	'relafen',
	'etodolac',
	'lodine',
	'sulindac',
	'clinoril',
	'ketoprofen',
	'orudis',
	'flurbiprofen',
	'ansaid',
	'oxaprozin',
	'daypro',
]

const NSAID_CONTRAINDICATED_CONDITIONS = [
	'hypertension',
	'high blood pressure',
	'htn',
	'diabetes',
	'diabetes mellitus',
	'type 1 diabetes',
	'type 2 diabetes',
	't1dm',
	't2dm',
	'dm',
	'chronic kidney disease',
	'ckd',
	'kidney disease',
	'renal disease',
	'renal insufficiency',
	'renal failure',
	'kidney failure',
	'stage 3 ckd',
	'stage 4 ckd',
	'stage 5 ckd',
	'stage 3 chronic kidney disease',
	'stage 4 chronic kidney disease',
	'stage 5 chronic kidney disease',
	'esrd',
	'end stage renal disease',
]

// ============================================
// System Prompts
// ============================================

const MEDICAL_SYSTEM_PROMPT = `You are an expert clinical decision support AI assistant helping licensed physicians create evidence-based treatment plans.

CRITICAL GUIDELINES:
1. SAFETY FIRST: Always prioritize patient safety over all other considerations
2. EVIDENCE-BASED: Recommend only medications with established efficacy for the condition
3. PATIENT-SPECIFIC: Consider age, allergies, current medications, and chronic conditions
4. CONSERVATIVE: When uncertain, recommend safer alternatives or suggest consultation
5. COMPLETE: Provide specific dosages, frequencies, durations, and routes of administration
6. TRANSPARENT: Explain your reasoning and confidence level for each recommendation

DOSING CONSIDERATIONS:
- Adjust dosages for pediatric (<18) and geriatric (>65) patients
- Consider renal and hepatic function when relevant
- Account for potential drug interactions
- Specify maximum daily doses where applicable

OUTPUT REQUIREMENTS:
- Provide specific, actionable medication recommendations
- Include dosage ranges appropriate for the condition
- Specify frequency (e.g., "twice daily", "every 8 hours")
- Indicate duration of treatment
- Note special instructions (with food, avoid sun, etc.)
- Explain rationale for each recommendation

DISCLAIMER: This is a clinical decision support tool. All recommendations require review and approval by a licensed healthcare professional before implementation.`

// ============================================
// OpenAI Service Class
// ============================================

export class OpenAIService {
	private static apiKey: string | undefined = process.env.OPENAI_API_KEY

	/**
	 * Check if OpenAI is configured
	 */
	static isConfigured(): boolean {
		return !!this.apiKey
	}

	/**
	 * Main entry point: Analyze treatment and generate recommendations
	 * Uses RAG (Retrieval-Augmented Generation) when assistant is configured
	 */
	static async analyzeTreatment(
		request: AIAnalysisRequest,
		options: { useRAG?: boolean } = {}
	): Promise<EnhancedAIAnalysisResponse> {
		// If OpenAI is not configured, fall back to enhanced mock
		if (!this.isConfigured()) {
			console.warn('OpenAI API key not configured, using mock response')
			return this.generateMockResponse(request)
		}

		try {
			// Determine whether to use RAG
			const useRAG = options.useRAG ?? AssistantService.hasAssistant()

			// Step 1: Generate AI recommendations (with or without RAG)
			let aiResponse: OpenAITreatmentResponse

			if (useRAG && AssistantService.hasAssistant()) {
				console.log('Using RAG-based analysis with Assistant API')
				aiResponse = await this.callOpenAIWithRAG(request)
			} else {
				console.log('Using standard chat completions')
				aiResponse = await this.callOpenAI(request)
			}

			// Step 2: Validate and enhance each medication
			const enhancedMedications = await this.enhanceMedications(
				aiResponse.medications,
				request
			)

			// Step 3: Check drug interactions across all medications
			const allMedications = [
				...enhancedMedications.map((m) => m.name),
				...request.currentMedications,
			]
			const interactions = await MedicalApisService.checkDrugInteractions(allMedications)

			// Step 4: Get references for the condition
			const references = await PubMedService.getReferencesForTreatment(
				request.chiefComplaint,
				enhancedMedications.map((m) => m.genericName || m.name)
			)

			// Step 5: Calculate overall confidence
			const medicationConfidences = enhancedMedications
				.map((m) => m.confidenceDetails)
				.filter((c): c is ConfidenceResult => c !== undefined)

			const overallConfidence = ConfidenceService.calculatePlanConfidence(
				medicationConfidences
			)

			// Step 6: Map drug interactions to our format
			const drugInteractions: DrugInteraction[] = interactions.map((i) => ({
				medication1: i.drug1,
				medication2: i.drug2,
				severity: this.mapInteractionSeverity(i.severity),
				description: i.description,
				recommendation: i.recommendation,
			}))

			// Step 7: Extract contraindications from medications
			const contraindications: Contraindication[] = []
			for (const med of enhancedMedications) {
				// Check patient allergies
				for (const allergy of request.patient.allergies || []) {
					if (
						med.name.toLowerCase().includes(allergy.toLowerCase()) ||
						(med.genericName && med.genericName.toLowerCase().includes(allergy.toLowerCase()))
					) {
						contraindications.push({
							medication: med.name,
							reason: `Patient has documented allergy to ${allergy}`,
							severity: 'Absolute',
						})
					}
				}
			}

			// Step 7b: NSAID/Renal Guardrail - Post-processing safety check
			const patientHasNSAIDContraindication = this.hasNSAIDContraindication(
				request.patient.chronicConditions || []
			)
			let filteredMedications = enhancedMedications
			let nsaidWarningAdded = false

			if (patientHasNSAIDContraindication) {
				const contraindicatedConditions = this.getNSAIDContraindicatedConditions(
					request.patient.chronicConditions || []
				)

				// Find any NSAID medications that slipped through
				const nsaidMedications = enhancedMedications.filter((med) =>
					this.isNSAID(med.name) || (med.genericName && this.isNSAID(med.genericName))
				)

				// Add contraindications for each NSAID found
				for (const nsaidMed of nsaidMedications) {
					contraindications.push({
						medication: nsaidMed.name,
						reason: `NSAID contraindicated due to patient conditions: ${contraindicatedConditions.join(', ')}. NSAIDs can cause acute kidney injury, worsen hypertension, and accelerate CKD progression.`,
						severity: 'Absolute',
					})
					nsaidWarningAdded = true
					console.warn(
						`NSAID Guardrail: Blocked ${nsaidMed.name} for patient with ${contraindicatedConditions.join(', ')}`
					)
				}

				// Filter out NSAID medications from the recommendation list
				filteredMedications = enhancedMedications.filter(
					(med) => !this.isNSAID(med.name) && !(med.genericName && this.isNSAID(med.genericName))
				)

				// Also filter alternatives
				for (const alt of aiResponse.alternatives) {
					alt.medications = alt.medications.filter(
						(med) => !this.isNSAID(med.name) && !(med.genericName && this.isNSAID(med.genericName))
					)
				}
			}

			// Step 8: Process alternatives
			const alternatives: AlternativePlan[] = await Promise.all(
				aiResponse.alternatives.map(async (alt) => {
					const altMeds = await this.enhanceMedications(alt.medications, request)
					return {
						medications: altMeds.map((m) => ({
							name: m.name,
							genericName: m.genericName,
							dosage: m.dosage,
							frequency: m.frequency,
							duration: m.duration,
							route: m.route,
							instructions: m.instructions,
							confidenceScore: m.confidenceScore,
						})),
						rationale: alt.rationale,
						riskLevel: alt.riskLevel,
					}
				})
			)

			// Add NSAID guardrail risk factor if NSAIDs were blocked
			const updatedRiskFactors = [...aiResponse.riskFactors]
			if (nsaidWarningAdded) {
				updatedRiskFactors.push(
					'NSAID medications were automatically blocked due to patient comorbidities (Hypertension/Diabetes/CKD)'
				)
			}

			return {
				medications: filteredMedications,
				riskLevel: aiResponse.riskLevel,
				riskFactors: updatedRiskFactors,
				riskJustification: aiResponse.riskJustification,
				drugInteractions,
				contraindications,
				alternatives,
				rationale: aiResponse.rationale,
				confidenceScore: overallConfidence.overallScore,
				generatedAt: new Date().toISOString(),
				overallConfidence,
				disclaimer:
					'AI-assisted recommendation. All treatment decisions must be reviewed and approved by a licensed healthcare professional.',
				generationMetadata: {
					model: MODEL,
					temperature: TEMPERATURE,
					validationSources: ['OpenFDA', 'RxNorm', 'PubMed'],
					generatedAt: new Date().toISOString(),
				},
			}
		} catch (error) {
			console.error('OpenAI treatment analysis error:', error)
			// Fall back to mock response on error
			return this.generateMockResponse(request)
		}
	}

	/**
	 * Call OpenAI using Assistant API with RAG (file search)
	 */
	private static async callOpenAIWithRAG(
		request: AIAnalysisRequest
	): Promise<OpenAITreatmentResponse> {
		try {
			const result = await AssistantService.runAnalysisWithRAG(request)
			const parsed = AssistantService.parseAnalysisResponse(result.content)

			if (result.citations.length > 0) {
				console.log('RAG citations found:', result.citations.map((c) => c.filename).join(', '))
			}

			return {
				medications: parsed.medications,
				riskLevel: parsed.riskLevel,
				riskFactors: parsed.riskFactors,
				riskJustification: parsed.riskJustification,
				rationale: parsed.rationale + (parsed.citedGuidelines?.length
					? `\n\nReferenced guidelines: ${parsed.citedGuidelines.join(', ')}`
					: ''),
				alternatives: parsed.alternatives,
			}
		} catch (error) {
			console.error('RAG analysis failed, falling back to standard API:', error)
			return this.callOpenAI(request)
		}
	}

	/**
	 * Call OpenAI API with structured medical prompt
	 */
	private static async callOpenAI(
		request: AIAnalysisRequest
	): Promise<OpenAITreatmentResponse> {
		const patientAge = this.calculateAge(request.patient.dateOfBirth)
		const ageCategory = patientAge < 18 ? 'Pediatric' : patientAge >= 65 ? 'Geriatric' : 'Adult'

		const userPrompt = `
Generate a treatment plan for the following patient:

PATIENT INFORMATION:
- Age: ${patientAge} years (${ageCategory})
- Gender: ${request.patient.gender}
- Known Allergies: ${request.patient.allergies?.join(', ') || 'None documented'}
- Chronic Conditions: ${request.patient.chronicConditions?.join(', ') || 'None documented'}
- Current Medications: ${request.currentMedications?.join(', ') || 'None'}

CLINICAL PRESENTATION:
- Chief Complaint: ${request.chiefComplaint}
- Current Symptoms: ${request.currentSymptoms.join(', ')}
${request.vitalSigns ? `
VITAL SIGNS:
- Blood Pressure: ${request.vitalSigns.bloodPressureSystolic || 'N/A'}/${request.vitalSigns.bloodPressureDiastolic || 'N/A'} mmHg
- Heart Rate: ${request.vitalSigns.heartRate || 'N/A'} bpm
- Temperature: ${request.vitalSigns.temperature || 'N/A'}°F
- Respiratory Rate: ${request.vitalSigns.respiratoryRate || 'N/A'}/min
- O2 Saturation: ${request.vitalSigns.oxygenSaturation || 'N/A'}%
` : ''}
${request.additionalNotes ? `\nADDITIONAL NOTES:\n${request.additionalNotes}` : ''}

Please provide treatment recommendations in JSON format with the following structure:
{
  "medications": [
    {
      "name": "Brand name",
      "genericName": "Generic name",
      "dosage": "Specific dosage (e.g., 500mg)",
      "frequency": "How often (e.g., twice daily)",
      "duration": "How long (e.g., 7 days)",
      "route": "Administration route (oral, IV, topical, etc.)",
      "instructions": "Special instructions",
      "rationale": "Why this medication is recommended",
      "confidenceScore": 0-100
    }
  ],
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "riskFactors": ["List of identified risk factors"],
  "riskJustification": "Explanation of risk assessment",
  "rationale": "Overall treatment approach rationale",
  "alternatives": [
    {
      "medications": [/* same structure as above */],
      "rationale": "Why this is a good alternative",
      "riskLevel": "LOW" | "MEDIUM" | "HIGH"
    }
  ]
}

IMPORTANT:
- Check ALL medications against patient allergies
- Consider age-appropriate dosing for ${ageCategory} patient
- Account for potential interactions with current medications
- Provide at least one alternative treatment option
- Be conservative with confidence scores
${this.hasNSAIDContraindication(request.patient.chronicConditions || []) ? `
CRITICAL SAFETY GUARDRAIL - NSAID CONTRAINDICATION:
This patient has one or more conditions that CONTRAINDICATE the use of NSAIDs:
- Patient conditions: ${this.getNSAIDContraindicatedConditions(request.patient.chronicConditions || []).join(', ')}

DO NOT recommend any NSAIDs including but not limited to:
- Ibuprofen (Advil, Motrin)
- Naproxen (Aleve, Naprosyn)
- Aspirin (except low-dose cardiac aspirin if specifically indicated)
- Diclofenac (Voltaren)
- Ketorolac (Toradol)
- Meloxicam (Mobic)
- Celecoxib (Celebrex)
- Any other COX inhibitors

NSAIDs can cause acute kidney injury, worsen hypertension, and accelerate CKD progression.
Instead, recommend safer alternatives like Acetaminophen (Tylenol) for pain management.
` : ''}
`

		const completion = await openai.chat.completions.create({
			model: MODEL,
			messages: [
				{ role: 'system', content: MEDICAL_SYSTEM_PROMPT },
				{ role: 'user', content: userPrompt },
			],
			temperature: TEMPERATURE,
			response_format: { type: 'json_object' },
			max_tokens: 4096,
		})

		const content = completion.choices[0].message.content
		if (!content) {
			throw new Error('No response from OpenAI')
		}

		return JSON.parse(content) as OpenAITreatmentResponse
	}

	/**
	 * Enhance medications with FDA validation and references
	 */
	private static async enhanceMedications(
		medications: OpenAITreatmentResponse['medications'],
		request: AIAnalysisRequest
	): Promise<EnhancedMedication[]> {
		const enhanced: EnhancedMedication[] = []

		for (const med of medications) {
			// Validate drug with FDA
			const validation = await MedicalApisService.validateDrug(
				med.name,
				request.currentMedications
			)

			// Get references for this medication
			const refs = await PubMedService.searchArticles(
				request.chiefComplaint,
				med.genericName || med.name,
				{ maxResults: 3 }
			)

			// Calculate evidence level
			const evidenceLevel = refs.references.length > 0
				? PubMedService.getEvidenceLevel(refs.references[0].publicationType)
				: 'D'

			// Calculate confidence
			const confidenceDetails = ConfidenceService.calculateMedicationConfidence({
				medicationName: med.name,
				aiConfidence: med.confidenceScore,
				fdaValidated: validation.isValid,
				dosageInfo: {
					recommended: med.dosage,
					withinLimits: validation.dosageRecommendations.length > 0,
				},
				route: med.route,
				interactions: validation.interactions.map((i) => ({
					severity: this.mapConfidenceSeverity(i.severity),
					count: 1,
				})),
				contraindications: validation.warnings,
				patientAllergies: request.patient.allergies || [],
				references: refs.references,
				patientAge: this.calculateAge(request.patient.dateOfBirth),
				patientConditions: request.patient.chronicConditions,
			})

			enhanced.push({
				name: med.name,
				genericName: med.genericName,
				dosage: med.dosage,
				frequency: med.frequency,
				duration: med.duration,
				route: med.route,
				instructions: med.instructions,
				confidenceScore: confidenceDetails.overallScore,
				rxcui: validation.drugInfo?.rxcui,
				ndcCode: validation.drugInfo?.ndcCodes?.[0],
				evidenceLevel,
				references: refs.references,
				fdaValidated: validation.isValid,
				ageAdjustedDosage: this.calculateAge(request.patient.dateOfBirth) < 18 ||
					this.calculateAge(request.patient.dateOfBirth) >= 65,
				renalAdjustment: validation.dosageRecommendations[0]?.renalAdjustment,
				hepaticAdjustment: validation.dosageRecommendations[0]?.hepaticAdjustment,
				confidenceDetails,
			})
		}

		return enhanced
	}

	/**
	 * Generate mock response when OpenAI is not available
	 */
	private static async generateMockResponse(
		request: AIAnalysisRequest
	): Promise<EnhancedAIAnalysisResponse> {
		await new Promise((resolve) => setTimeout(resolve, 1500))

		const patientHasNSAIDContraindication = this.hasNSAIDContraindication(
			request.patient.chronicConditions || []
		)

		const contraindications: Contraindication[] = []
		const riskFactors: string[] = ['Standard treatment approach']

		let mockMedications: EnhancedMedication[]

		if (patientHasNSAIDContraindication) {
			const contraindicatedConditions = this.getNSAIDContraindicatedConditions(
				request.patient.chronicConditions || []
			)

			mockMedications = [
				{
					name: 'Tylenol',
					genericName: 'Acetaminophen',
					dosage: '500-1000mg',
					frequency: 'Every 6 hours as needed',
					duration: '7 days',
					route: 'Oral',
					instructions: 'Do not exceed 3000mg per day. Avoid alcohol while taking this medication.',
					confidenceScore: 82,
					evidenceLevel: 'A',
					fdaValidated: true,
					references: [],
				},
			]

			contraindications.push({
				medication: 'NSAIDs (Ibuprofen, Naproxen, etc.)',
				reason: `NSAID medications contraindicated due to patient conditions: ${contraindicatedConditions.join(', ')}. NSAIDs can cause acute kidney injury, worsen hypertension, and accelerate CKD progression.`,
				severity: 'Absolute',
			})

			riskFactors.push(
				'Patient has conditions contraindicating NSAID use - Acetaminophen recommended as alternative'
			)
		} else {
			mockMedications = [
				{
					name: 'Ibuprofen',
					genericName: 'Ibuprofen',
					dosage: '400mg',
					frequency: 'Every 6-8 hours as needed',
					duration: '7 days',
					route: 'Oral',
					instructions: 'Take with food to reduce stomach irritation. Do not exceed 1200mg per day.',
					confidenceScore: 78,
					evidenceLevel: 'A',
					fdaValidated: true,
					references: [],
				},
			]
		}

		const mockConfidence: ConfidenceResult = {
			overallScore: 75,
			grade: 'MODERATE',
			breakdown: {
				drugValidation: 80,
				safetyScore: 85,
				evidenceScore: 60,
				patientFactors: 70,
				aiBaseScore: 80,
			},
			warnings: ['Mock response - OpenAI API not configured'],
			recommendations: ['Configure OPENAI_API_KEY for full functionality'],
		}

		return {
			medications: mockMedications,
			riskLevel: 'LOW',
			riskFactors,
			riskJustification: 'Mock response with conservative risk assessment',
			drugInteractions: [],
			contraindications,
			alternatives: [],
			rationale: 'This is a mock response. Configure OpenAI API for real recommendations.',
			confidenceScore: 75,
			generatedAt: new Date().toISOString(),
			overallConfidence: mockConfidence,
			disclaimer: 'MOCK RESPONSE - OpenAI API not configured. This is not a real medical recommendation.',
			generationMetadata: {
				model: 'mock',
				temperature: 0,
				validationSources: [],
				generatedAt: new Date().toISOString(),
			},
		}
	}

	// ============================================
	// Helper Methods
	// ============================================

	/**
	 * Check if a medication is an NSAID
	 */
	private static isNSAID(medicationName: string): boolean {
		const lowerName = medicationName.toLowerCase()
		return NSAID_MEDICATIONS.some(
			(nsaid) => lowerName.includes(nsaid) || nsaid.includes(lowerName)
		)
	}

	/**
	 * Check if patient has conditions that contraindicate NSAID use
	 */
	private static hasNSAIDContraindication(chronicConditions: string[]): boolean {
		if (!chronicConditions || chronicConditions.length === 0) return false

		return chronicConditions.some((condition) => {
			const lowerCondition = condition.toLowerCase()
			return NSAID_CONTRAINDICATED_CONDITIONS.some(
				(contraindicated) =>
					lowerCondition.includes(contraindicated) ||
					contraindicated.includes(lowerCondition)
			)
		})
	}

	/**
	 * Get the specific contraindicated conditions for NSAID warning
	 */
	private static getNSAIDContraindicatedConditions(chronicConditions: string[]): string[] {
		if (!chronicConditions || chronicConditions.length === 0) return []

		return chronicConditions.filter((condition) => {
			const lowerCondition = condition.toLowerCase()
			return NSAID_CONTRAINDICATED_CONDITIONS.some(
				(contraindicated) =>
					lowerCondition.includes(contraindicated) ||
					contraindicated.includes(lowerCondition)
			)
		})
	}

	private static calculateAge(dateOfBirth: string): number {
		const today = new Date()
		const birth = new Date(dateOfBirth)
		let age = today.getFullYear() - birth.getFullYear()
		const monthDiff = today.getMonth() - birth.getMonth()
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
			age--
		}
		return age
	}

	private static mapInteractionSeverity(
		severity: string
	): 'Mild' | 'Moderate' | 'Severe' {
		const lower = severity.toLowerCase()
		if (lower.includes('major') || lower.includes('severe') || lower.includes('contraindicated')) {
			return 'Severe'
		}
		if (lower.includes('minor') || lower.includes('mild')) {
			return 'Mild'
		}
		return 'Moderate'
	}

	private static mapConfidenceSeverity(
		severity: string
	): 'Minor' | 'Moderate' | 'Major' | 'Contraindicated' {
		const lower = severity.toLowerCase()
		if (lower.includes('contraindicated')) {
			return 'Contraindicated'
		}
		if (lower.includes('major') || lower.includes('severe')) {
			return 'Major'
		}
		if (lower.includes('minor') || lower.includes('mild')) {
			return 'Minor'
		}
		return 'Moderate'
	}
}
