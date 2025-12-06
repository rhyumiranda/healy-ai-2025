import type {
	AIAnalysisRequest,
	AIAnalysisResponse,
	Medication,
	DrugInteraction,
	Contraindication,
	AlternativePlan,
	RiskLevel,
} from '@/src/modules/treatment-plans'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const MOCK_AI_RESPONSE: AIAnalysisResponse = {
	medications: [
		{
			name: 'Ibuprofen',
			genericName: 'Ibuprofen',
			dosage: '400mg',
			frequency: 'Every 6-8 hours as needed',
			duration: '7 days',
			route: 'Oral',
			instructions: 'Take with food to reduce stomach irritation',
			confidenceScore: 92,
		},
		{
			name: 'Acetaminophen',
			genericName: 'Paracetamol',
			dosage: '500mg',
			frequency: 'Every 4-6 hours as needed',
			duration: '7 days',
			route: 'Oral',
			instructions: 'Do not exceed 4g per day',
			confidenceScore: 88,
		},
	],
	riskLevel: 'LOW',
	riskFactors: [
		'No significant drug interactions detected',
		'Standard dosing appropriate for patient profile',
	],
	riskJustification: 'The recommended treatment plan presents low risk based on the patient profile, absence of contraindicated conditions, and standard medication dosing.',
	drugInteractions: [],
	contraindications: [],
	alternatives: [
		{
			medications: [
				{
					name: 'Naproxen',
					genericName: 'Naproxen Sodium',
					dosage: '220mg',
					frequency: 'Every 8-12 hours',
					duration: '7 days',
					route: 'Oral',
					instructions: 'Take with food',
					confidenceScore: 85,
				},
			],
			rationale: 'Alternative NSAID option if ibuprofen is not tolerated',
			riskLevel: 'LOW',
		},
	],
	rationale: 'Based on the presented symptoms and patient history, a combination of anti-inflammatory and analgesic medications is recommended for symptomatic relief. The treatment plan focuses on managing pain and inflammation while minimizing potential side effects.',
	confidenceScore: 89,
	generatedAt: new Date().toISOString(),
}

function generateMockResponseForSymptoms(
	chiefComplaint: string,
	symptoms: string[],
	allergies: string[] = []
): AIAnalysisResponse {
	const hasAllergy = (med: string) => 
		allergies.some(a => a.toLowerCase().includes(med.toLowerCase()))

	const medications: Medication[] = []
	const drugInteractions: DrugInteraction[] = []
	const contraindications: Contraindication[] = []
	let riskLevel: RiskLevel = 'LOW'

	const lowerComplaint = chiefComplaint.toLowerCase()
	const lowerSymptoms = symptoms.map(s => s.toLowerCase())

	if (lowerComplaint.includes('headache') || lowerSymptoms.includes('headache')) {
		if (!hasAllergy('ibuprofen') && !hasAllergy('nsaid')) {
			medications.push({
				name: 'Ibuprofen',
				genericName: 'Ibuprofen',
				dosage: '400mg',
				frequency: 'Every 6-8 hours as needed',
				duration: '5-7 days',
				route: 'Oral',
				instructions: 'Take with food',
				confidenceScore: 91,
			})
		} else {
			contraindications.push({
				medication: 'Ibuprofen',
				reason: 'Patient has documented NSAID allergy',
				severity: 'Absolute',
			})
			riskLevel = 'MEDIUM'
		}
	}

	if (lowerComplaint.includes('fever') || lowerSymptoms.includes('fever')) {
		medications.push({
			name: 'Acetaminophen',
			genericName: 'Paracetamol',
			dosage: '500-1000mg',
			frequency: 'Every 4-6 hours as needed',
			duration: '3-5 days',
			route: 'Oral',
			instructions: 'Maximum 4g per day',
			confidenceScore: 94,
		})
	}

	if (lowerComplaint.includes('infection') || lowerSymptoms.includes('infection')) {
		if (!hasAllergy('penicillin') && !hasAllergy('amoxicillin')) {
			medications.push({
				name: 'Amoxicillin',
				genericName: 'Amoxicillin',
				dosage: '500mg',
				frequency: 'Three times daily',
				duration: '7-10 days',
				route: 'Oral',
				instructions: 'Complete full course even if symptoms improve',
				confidenceScore: 87,
			})
		} else {
			contraindications.push({
				medication: 'Amoxicillin',
				reason: 'Patient has documented penicillin allergy',
				severity: 'Absolute',
			})
			medications.push({
				name: 'Azithromycin',
				genericName: 'Azithromycin',
				dosage: '500mg day 1, then 250mg',
				frequency: 'Once daily',
				duration: '5 days',
				route: 'Oral',
				instructions: 'Take on empty stomach',
				confidenceScore: 82,
			})
			riskLevel = 'MEDIUM'
		}
	}

	if (medications.length === 0) {
		medications.push(...MOCK_AI_RESPONSE.medications)
	}

	const avgConfidence = medications.reduce((sum, m) => sum + (m.confidenceScore || 85), 0) / medications.length

	return {
		medications,
		riskLevel,
		riskFactors: contraindications.length > 0 
			? ['Allergy considerations affecting medication selection', 'Alternative medications selected']
			: ['No significant contraindications', 'Standard treatment protocol applicable'],
		riskJustification: `Treatment plan generated based on chief complaint "${chiefComplaint}" and ${symptoms.length} reported symptoms. ${contraindications.length > 0 ? 'Allergies have been considered in medication selection.' : 'No contraindications identified.'}`,
		drugInteractions,
		contraindications,
		alternatives: MOCK_AI_RESPONSE.alternatives,
		rationale: `Based on the clinical presentation of ${chiefComplaint}, the recommended treatment targets symptom management and addresses the underlying condition. ${medications.length} medication(s) have been selected based on efficacy, safety profile, and patient-specific factors.`,
		confidenceScore: Math.round(avgConfidence),
		generatedAt: new Date().toISOString(),
	}
}

export class OpenAIService {
	private static apiKey: string | undefined = process.env.OPENAI_API_KEY

	static async analyzeTreatment(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
		await delay(2000)

		const allergies = request.patient.allergies || []
		
		return generateMockResponseForSymptoms(
			request.chiefComplaint,
			request.currentSymptoms,
			allergies
		)
	}

	static isConfigured(): boolean {
		return !!this.apiKey
	}
}
