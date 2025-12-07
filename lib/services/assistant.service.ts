import OpenAI from 'openai'
import type { AIAnalysisRequest } from '@/src/modules/treatment-plans'

let openai: OpenAI | null = null

function getOpenAIClient(): OpenAI {
	if (!openai) {
		const apiKey = process.env.OPENAI_API_KEY
		if (!apiKey) {
			const error = new Error('OPENAI_API_KEY is not configured')
			error.name = 'OpenAIConfigurationError'
			throw error
		}
		openai = new OpenAI({ apiKey })
	}
	return openai
}

const ASSISTANT_NAME = 'Medical Treatment Advisor'
const MODEL = 'gpt-4-turbo'

const MEDICAL_SYSTEM_PROMPT = `You are an expert clinical decision support AI assistant helping licensed physicians create evidence-based treatment plans.

You have access to a comprehensive medical knowledge base including:
- FDA drug labels and safety information
- Clinical practice guidelines
- Drug interaction databases  
- Treatment protocols for common conditions

CRITICAL GUIDELINES:
1. SAFETY FIRST: Always prioritize patient safety over all other considerations
2. EVIDENCE-BASED: Recommend only medications with established efficacy for the condition
3. PATIENT-SPECIFIC: Consider age, allergies, current medications, and chronic conditions
4. CONSERVATIVE: When uncertain, recommend safer alternatives or suggest consultation
5. COMPLETE: Provide specific dosages, frequencies, durations, and routes of administration
6. TRANSPARENT: Explain your reasoning and confidence level for each recommendation
7. CITE SOURCES: Reference relevant guidelines or studies from your knowledge base when available

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
- Reference any relevant clinical guidelines from your knowledge base

DISCLAIMER: This is a clinical decision support tool. All recommendations require review and approval by a licensed healthcare professional before implementation.`

export interface AssistantConfig {
	assistantId?: string
	vectorStoreId?: string
}

export interface VectorStoreFile {
	id: string
	filename: string
	status: string
	createdAt: number
}

export interface VectorStoreStatus {
	id: string
	name: string
	fileCount: number
	status: string
	files: VectorStoreFile[]
}

export interface RAGAnalysisResult {
	content: string
	citations: Array<{
		filename: string
		quote: string
	}>
	threadId: string
	runId: string
}

export class AssistantService {
	private static assistantId: string | undefined = process.env.OPENAI_ASSISTANT_ID
	private static vectorStoreId: string | undefined = process.env.OPENAI_VECTOR_STORE_ID

	static isConfigured(): boolean {
		return !!process.env.OPENAI_API_KEY
	}

	static hasAssistant(): boolean {
		return !!this.assistantId
	}

	static hasVectorStore(): boolean {
		return !!this.vectorStoreId
	}

	static async getOrCreateVectorStore(name: string = 'Medical Knowledge Base'): Promise<string> {
		if (this.vectorStoreId) {
			try {
				const existing = await getOpenAIClient().vectorStores.retrieve(this.vectorStoreId)
				if (existing) {
					return this.vectorStoreId
				}
			} catch {
				console.log('Existing vector store not found, creating new one...')
			}
		}

		const vectorStore = await getOpenAIClient().vectorStores.create({
			name,
			expires_after: {
				anchor: 'last_active_at',
				days: 365,
			},
		})

		this.vectorStoreId = vectorStore.id
		console.log(`Created vector store: ${vectorStore.id}`)
		console.log('Add OPENAI_VECTOR_STORE_ID=' + vectorStore.id + ' to your .env file')

		return vectorStore.id
	}

	static async getOrCreateAssistant(): Promise<string> {
		if (this.assistantId) {
			try {
				const existing = await getOpenAIClient().beta.assistants.retrieve(this.assistantId)
				if (existing) {
					return this.assistantId
				}
			} catch {
				console.log('Existing assistant not found, creating new one...')
			}
		}

		const vectorStoreId = await this.getOrCreateVectorStore()

		const assistant = await getOpenAIClient().beta.assistants.create({
			name: ASSISTANT_NAME,
			instructions: MEDICAL_SYSTEM_PROMPT,
			model: MODEL,
			tools: [{ type: 'file_search' }],
			tool_resources: {
				file_search: {
					vector_store_ids: [vectorStoreId],
				},
			},
		})

		this.assistantId = assistant.id
		console.log(`Created assistant: ${assistant.id}`)
		console.log('Add OPENAI_ASSISTANT_ID=' + assistant.id + ' to your .env file')

		return assistant.id
	}

	static async uploadKnowledgeFile(
		fileBuffer: Buffer,
		filename: string,
		purpose: 'clinical-guidelines' | 'drug-interactions' | 'treatment-protocols' | 'general' = 'general'
	): Promise<{ fileId: string; vectorStoreFileId: string }> {
		const vectorStoreId = await this.getOrCreateVectorStore()

		const uint8Array = new Uint8Array(fileBuffer)
		const blob = new Blob([uint8Array], { type: 'application/json' })
		const file = await getOpenAIClient().files.create({
			file: new File([blob], filename, { type: 'application/json' }),
			purpose: 'assistants',
		})

		const vectorStoreFile = await getOpenAIClient().vectorStores.files.create(vectorStoreId, {
			file_id: file.id,
		})

		console.log(`Uploaded file ${filename} (${file.id}) to vector store`)

		return {
			fileId: file.id,
			vectorStoreFileId: vectorStoreFile.id,
		}
	}

	static async uploadKnowledgeFiles(
		files: Array<{ buffer: Buffer; filename: string }>
	): Promise<string[]> {
		const vectorStoreId = await this.getOrCreateVectorStore()

		const uploadedFiles: string[] = []

		for (const { buffer, filename } of files) {
			const uint8Array = new Uint8Array(buffer)
			const blob = new Blob([uint8Array], { type: 'application/json' })
			const file = await getOpenAIClient().files.create({
				file: new File([blob], filename, { type: 'application/json' }),
				purpose: 'assistants',
			})

			await getOpenAIClient().vectorStores.files.create(vectorStoreId, {
				file_id: file.id,
			})

			uploadedFiles.push(file.id)
			console.log(`Uploaded ${filename}`)
		}

		return uploadedFiles
	}

	static async getVectorStoreStatus(): Promise<VectorStoreStatus | null> {
		if (!this.vectorStoreId) {
			return null
		}

		try {
			const vectorStore = await getOpenAIClient().vectorStores.retrieve(this.vectorStoreId)
			const filesResponse = await getOpenAIClient().vectorStores.files.list(this.vectorStoreId)

			const files: VectorStoreFile[] = []
			for await (const file of filesResponse) {
				const fileDetails = await getOpenAIClient().files.retrieve(file.id)
				files.push({
					id: file.id,
					filename: fileDetails.filename,
					status: file.status,
					createdAt: fileDetails.created_at,
				})
			}

			return {
				id: vectorStore.id,
				name: vectorStore.name,
				fileCount: vectorStore.file_counts.completed,
				status: vectorStore.status,
				files,
			}
		} catch (error) {
			console.error('Error getting vector store status:', error)
			return null
		}
	}

	static async deleteKnowledgeFile(fileId: string): Promise<boolean> {
		if (!this.vectorStoreId) {
			return false
		}

		try {
			await getOpenAIClient().vectorStores.files.delete(fileId, { vector_store_id: this.vectorStoreId })
			await getOpenAIClient().files.delete(fileId)
			return true
		} catch (error) {
			console.error('Error deleting file:', error)
			return false
		}
	}

	static async runAnalysisWithRAG(request: AIAnalysisRequest): Promise<RAGAnalysisResult> {
		const assistantId = await this.getOrCreateAssistant()

		const patientAge = this.calculateAge(request.patient.dateOfBirth)
		const ageCategory = patientAge < 18 ? 'Pediatric' : patientAge >= 65 ? 'Geriatric' : 'Adult'

		const userPrompt = `
Generate a treatment plan for the following patient. Search your knowledge base for relevant clinical guidelines, drug information, and treatment protocols.

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

Please search your knowledge base for:
1. Clinical guidelines for treating ${request.chiefComplaint}
2. Drug interactions with the patient's current medications
3. Age-appropriate dosing guidelines for ${ageCategory} patients
4. Any relevant contraindications based on patient allergies and conditions

Then provide treatment recommendations in JSON format with the following structure:
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
      "rationale": "Why this medication is recommended, including any relevant guideline references",
      "confidenceScore": 0-100
    }
  ],
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "riskFactors": ["List of identified risk factors"],
  "riskJustification": "Explanation of risk assessment",
  "rationale": "Overall treatment approach rationale with guideline citations",
  "alternatives": [
    {
      "medications": [/* same structure as above */],
      "rationale": "Why this is a good alternative",
      "riskLevel": "LOW" | "MEDIUM" | "HIGH"
    }
  ],
  "citedGuidelines": ["List of guidelines referenced from knowledge base"]
}

IMPORTANT:
- Check ALL medications against patient allergies
- Consider age-appropriate dosing for ${ageCategory} patient
- Account for potential interactions with current medications
- Provide at least one alternative treatment option
- Reference relevant clinical guidelines from your knowledge base
- Be conservative with confidence scores
`

		const thread = await getOpenAIClient().beta.threads.create({
			messages: [
				{
					role: 'user',
					content: userPrompt,
				},
			],
		})

		const run = await getOpenAIClient().beta.threads.runs.createAndPoll(thread.id, {
			assistant_id: assistantId,
		})

		if (run.status !== 'completed') {
			throw new Error(`Run failed with status: ${run.status}`)
		}

		const messages = await getOpenAIClient().beta.threads.messages.list(thread.id)
		const assistantMessage = messages.data.find((m) => m.role === 'assistant')

		if (!assistantMessage) {
			throw new Error('No assistant response found')
		}

		const citations: Array<{ filename: string; quote: string }> = []
		let responseText = ''

		for (const content of assistantMessage.content) {
			if (content.type === 'text') {
				responseText = content.text.value

				if (content.text.annotations) {
					for (const annotation of content.text.annotations) {
						if (annotation.type === 'file_citation') {
							try {
								const file = await getOpenAIClient().files.retrieve(annotation.file_citation.file_id)
								citations.push({
									filename: file.filename,
									quote: annotation.text,
								})
							} catch {
								citations.push({
									filename: 'Unknown file',
									quote: annotation.text,
								})
							}
						}
					}
				}
			}
		}

		return {
			content: responseText,
			citations,
			threadId: thread.id,
			runId: run.id,
		}
	}

	static parseAnalysisResponse(content: string): {
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
		citedGuidelines?: string[]
	} {
		const jsonMatch = content.match(/\{[\s\S]*\}/)
		if (!jsonMatch) {
			throw new Error('No JSON found in response')
		}

		return JSON.parse(jsonMatch[0])
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
}
