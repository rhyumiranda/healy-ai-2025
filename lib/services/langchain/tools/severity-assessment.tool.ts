import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { SeverityDetectionService } from '../../safety'
import type { AgentToolResult } from '../types'

export const severityAssessmentSchema = z.object({
	chiefComplaint: z.string().describe('The patient chief complaint'),
	currentSymptoms: z.array(z.string()).describe('List of current symptoms'),
	vitalSigns: z.object({
		bloodPressureSystolic: z.number().optional(),
		bloodPressureDiastolic: z.number().optional(),
		heartRate: z.number().optional(),
		temperature: z.number().optional(),
		respiratoryRate: z.number().optional(),
		oxygenSaturation: z.number().optional(),
	}).optional().describe('Patient vital signs'),
	chronicConditions: z.array(z.string()).optional().describe('Patient chronic conditions'),
	allergies: z.array(z.string()).optional().describe('Patient known allergies'),
	currentMedications: z.array(z.string()).optional().describe('Patient current medications'),
})

export type SeverityAssessmentInput = z.infer<typeof severityAssessmentSchema>

export async function executeSeverityAssessment(input: SeverityAssessmentInput): Promise<AgentToolResult> {
	try {
		const assessment = await SeverityDetectionService.assess({
			chiefComplaint: input.chiefComplaint,
			currentSymptoms: input.currentSymptoms,
			vitalSigns: input.vitalSigns,
			chronicConditions: input.chronicConditions || [],
			allergies: input.allergies || [],
			currentMedications: input.currentMedications || [],
		})

		return {
			success: true,
			data: {
				isSevere: assessment.isSevere,
				severityLevel: assessment.severityLevel,
				autoEscalate: assessment.autoEscalate,
				triggers: assessment.triggers,
				confidenceModifier: assessment.confidenceModifier,
				recommendations: assessment.isSevere
					? [
						'Case requires heightened attention',
						'Consider immediate clinical review',
						'Apply conservative treatment approach',
						...(assessment.autoEscalate ? ['Automatic escalation to senior review'] : []),
					]
					: ['Standard clinical workflow appropriate'],
				summary: assessment.isSevere
					? `SEVERE: ${assessment.severityLevel} - ${assessment.triggers.map(t => t.type).join(', ')}`
					: 'Case assessed as standard severity',
			},
			source: 'SeverityDetection',
			confidence: 90,
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to assess severity',
			source: 'SeverityDetection',
		}
	}
}

export const SeverityAssessmentTool = new DynamicStructuredTool({
	name: 'severity_assessment',
	description: 'Assess the severity of a clinical case based on symptoms, vital signs, and patient conditions. Use this first to determine workflow urgency and whether to escalate to senior review.',
	schema: severityAssessmentSchema,
	func: async (input) => {
		const result = await executeSeverityAssessment(input)
		return JSON.stringify(result, null, 2)
	},
})

