import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { MedicalApisService, RxNormService } from '../../medical-apis.service'
import type { AgentToolResult, InteractionEvidence } from '../types'

export const drugInteractionSchema = z.object({
	medications: z.array(z.string()).min(2).describe('List of medication names to check for interactions (minimum 2)'),
	includeSeverityFilter: z.enum(['all', 'moderate_and_above', 'major_only']).optional().default('all').describe('Filter interactions by severity level'),
})

export type DrugInteractionInput = z.infer<typeof drugInteractionSchema>

export async function executeDrugInteractionCheck(input: DrugInteractionInput): Promise<AgentToolResult> {
	try {
		const interactions = await MedicalApisService.checkDrugInteractions(input.medications)
		
		let filteredInteractions = interactions
		
		if (input.includeSeverityFilter === 'moderate_and_above') {
			filteredInteractions = interactions.filter(
				i => i.severity !== 'Minor'
			)
		} else if (input.includeSeverityFilter === 'major_only') {
			filteredInteractions = interactions.filter(
				i => i.severity === 'Major' || i.severity === 'Contraindicated'
			)
		}

		const evidenceFormat: InteractionEvidence[] = filteredInteractions.map(i => ({
			drug1: i.drug1,
			drug2: i.drug2,
			severity: i.severity,
			description: i.description,
			recommendation: i.recommendation,
			source: i.source,
		}))

		const hasCritical = filteredInteractions.some(i => i.severity === 'Contraindicated')
		const hasMajor = filteredInteractions.some(i => i.severity === 'Major')

		return {
			success: true,
			data: {
				medicationsChecked: input.medications,
				totalInteractions: filteredInteractions.length,
				hasCriticalInteraction: hasCritical,
				hasMajorInteraction: hasMajor,
				interactions: evidenceFormat,
				summary: hasCritical 
					? 'CRITICAL: Contraindicated drug combination detected'
					: hasMajor 
						? 'WARNING: Major drug interaction detected'
						: filteredInteractions.length > 0
							? `Found ${filteredInteractions.length} interaction(s)`
							: 'No significant interactions found',
			},
			source: 'RxNorm',
			confidence: 95,
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to check drug interactions',
			source: 'RxNorm',
		}
	}
}

export const DrugInteractionTool = new DynamicStructuredTool({
	name: 'drug_interaction_check',
	description: 'Check for drug-drug interactions between multiple medications. Returns severity levels (Minor/Moderate/Major/Contraindicated) and recommendations. Essential for patient safety before prescribing.',
	schema: drugInteractionSchema,
	func: async (input) => {
		const result = await executeDrugInteractionCheck(input)
		return JSON.stringify(result, null, 2)
	},
})
