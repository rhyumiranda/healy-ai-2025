/**
 * Treatment Plan Service
 * Client-side service for interacting with treatment plan APIs
 */

import type {
	TreatmentPlan,
	TreatmentPlanListItem,
	TreatmentPlansResponse,
	TreatmentPlanFilters,
	AIAnalysisRequest,
	AIAnalysisResponse,
} from '../types'

export class TreatmentPlanService {
	private static baseUrl = '/api/treatment-plans'

	/**
	 * Get list of treatment plans with filtering
	 */
	static async getTreatmentPlans(
		filters: TreatmentPlanFilters = {}
	): Promise<TreatmentPlansResponse> {
		const params = new URLSearchParams()

		if (filters.search) params.set('search', filters.search)
		if (filters.status && filters.status !== 'ALL') params.set('status', filters.status)
		if (filters.riskLevel && filters.riskLevel !== 'ALL') params.set('riskLevel', filters.riskLevel)
		if (filters.patientId) params.set('patientId', filters.patientId)
		if (filters.page) params.set('page', filters.page.toString())
		if (filters.pageSize) params.set('pageSize', filters.pageSize.toString())
		if (filters.sortBy) params.set('sortBy', filters.sortBy)
		if (filters.sortOrder) params.set('sortOrder', filters.sortOrder)

		const response = await fetch(`${this.baseUrl}?${params.toString()}`)

		if (!response.ok) {
			throw new Error('Failed to fetch treatment plans')
		}

		return response.json()
	}

	/**
	 * Get single treatment plan by ID
	 */
	static async getTreatmentPlan(id: string): Promise<TreatmentPlan> {
		const response = await fetch(`${this.baseUrl}/${id}`)

		if (!response.ok) {
			if (response.status === 404) {
				throw new Error('Treatment plan not found')
			}
			throw new Error('Failed to fetch treatment plan')
		}

		const data = await response.json()
		return data.treatmentPlan
	}

	/**
	 * Create new treatment plan
	 */
	static async createTreatmentPlan(input: {
		patientId: string
		chiefComplaint: string
		currentSymptoms: string
		vitalSigns?: Record<string, unknown>
		physicalExamNotes?: string
		aiRecommendations?: AIAnalysisResponse
		riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH'
		riskFactors?: string[]
		riskJustification?: string
		drugInteractions?: unknown[]
		contraindications?: unknown[]
		alternatives?: unknown[]
		status?: 'DRAFT' | 'APPROVED' | 'REJECTED'
	}): Promise<TreatmentPlan> {
		const response = await fetch(this.baseUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to create treatment plan')
		}

		const data = await response.json()
		return data.treatmentPlan
	}

	/**
	 * Update existing treatment plan
	 */
	static async updateTreatmentPlan(
		id: string,
		input: {
			chiefComplaint?: string
			currentSymptoms?: string
			vitalSigns?: Record<string, unknown>
			physicalExamNotes?: string
			aiRecommendations?: AIAnalysisResponse
			finalPlan?: Record<string, unknown>
			riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | null
			riskFactors?: string[]
			riskJustification?: string | null
			drugInteractions?: unknown[]
			contraindications?: unknown[]
			alternatives?: unknown[]
			status?: 'DRAFT' | 'APPROVED' | 'REJECTED'
			wasModified?: boolean
			modificationNotes?: string | null
		}
	): Promise<TreatmentPlan> {
		const response = await fetch(`${this.baseUrl}/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to update treatment plan')
		}

		const data = await response.json()
		return data.treatmentPlan
	}

	/**
	 * Delete treatment plan (only drafts)
	 */
	static async deleteTreatmentPlan(id: string): Promise<void> {
		const response = await fetch(`${this.baseUrl}/${id}`, {
			method: 'DELETE',
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to delete treatment plan')
		}
	}

	/**
	 * Run AI analysis on patient data
	 */
	static async analyzeForTreatment(
		request: AIAnalysisRequest,
		options?: { useRAG?: boolean }
	): Promise<AIAnalysisResponse> {
		const response = await fetch(`${this.baseUrl}/analyze`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				...request,
				useRAG: options?.useRAG ?? false,
			}),
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to analyze treatment')
		}

		const data = await response.json()
		return data.analysis
	}

	/**
	 * Create treatment plan with AI analysis in one step
	 */
	static async createWithAIAnalysis(
		patientId: string,
		intakeData: {
			chiefComplaint: string
			currentSymptoms: string[]
			currentMedications: string[]
			vitalSigns?: Record<string, unknown>
			additionalNotes?: string
		},
		patient: AIAnalysisRequest['patient']
	): Promise<{ treatmentPlan: TreatmentPlan; analysis: AIAnalysisResponse }> {
		// Step 1: Run AI analysis
		const analysis = await this.analyzeForTreatment({
			patient,
			chiefComplaint: intakeData.chiefComplaint,
			currentSymptoms: intakeData.currentSymptoms,
			currentMedications: intakeData.currentMedications,
			vitalSigns: intakeData.vitalSigns,
			additionalNotes: intakeData.additionalNotes,
		})

		// Step 2: Create treatment plan with AI results
		const treatmentPlan = await this.createTreatmentPlan({
			patientId,
			chiefComplaint: intakeData.chiefComplaint,
			currentSymptoms: intakeData.currentSymptoms.join(', '),
			vitalSigns: intakeData.vitalSigns,
			aiRecommendations: analysis,
			riskLevel: analysis.riskLevel,
			riskFactors: analysis.riskFactors,
			riskJustification: analysis.riskJustification,
			drugInteractions: analysis.drugInteractions,
			contraindications: analysis.contraindications,
			alternatives: analysis.alternatives,
			status: 'DRAFT',
		})

		return { treatmentPlan, analysis }
	}

	/**
	 * Approve treatment plan with final plan data
	 */
	static async approveTreatmentPlan(
		id: string,
		finalPlan: {
			medications: unknown[]
			notes?: string
			approvedBy?: string
		},
		modificationNotes?: string
	): Promise<TreatmentPlan> {
		return this.updateTreatmentPlan(id, {
			finalPlan,
			status: 'APPROVED',
			wasModified: !!modificationNotes,
			modificationNotes,
		})
	}

	/**
	 * Reject treatment plan
	 */
	static async rejectTreatmentPlan(
		id: string,
		reason: string
	): Promise<TreatmentPlan> {
		return this.updateTreatmentPlan(id, {
			status: 'REJECTED',
			modificationNotes: reason,
		})
	}
}
