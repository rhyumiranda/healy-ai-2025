import type { AIAnalysisRequest, AIAnalysisResponse } from '../types'

export class AIAnalysisService {
	static async analyzeTreatment(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
		const response = await fetch('/api/treatment-plans/analyze', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(request),
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to analyze treatment')
		}

		const data = await response.json()
		return data.analysis
	}
}
