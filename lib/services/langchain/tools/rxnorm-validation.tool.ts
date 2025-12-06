import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { RxNormService } from '../../medical-apis.service'
import type { AgentToolResult } from '../types'

export const rxnormValidationSchema = z.object({
	drugName: z.string().describe('The name of the drug to validate'),
	checkInteractions: z.boolean().optional().default(false).describe('Whether to check for drug interactions'),
	getAlternatives: z.boolean().optional().default(false).describe('Whether to get related/alternative drugs'),
})

export type RxNormValidationInput = z.infer<typeof rxnormValidationSchema>

export async function executeRxNormValidation(input: RxNormValidationInput): Promise<AgentToolResult> {
	try {
		const rxcui = await RxNormService.getRxCUI(input.drugName)
		
		if (!rxcui) {
			return {
				success: false,
				error: `Drug "${input.drugName}" not found in RxNorm database`,
				source: 'RxNorm',
			}
		}

		const result: Record<string, unknown> = {
			drugName: input.drugName,
			rxcui,
			validated: true,
		}

		if (input.checkInteractions) {
			const interactions = await RxNormService.getDrugInteractions(rxcui)
			result.interactions = interactions
			result.interactionCount = interactions.length
		}

		if (input.getAlternatives) {
			const alternatives = await RxNormService.getRelatedDrugs(rxcui)
			result.alternatives = alternatives
		}

		return {
			success: true,
			data: result,
			source: 'RxNorm',
			confidence: 98,
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to validate drug in RxNorm',
			source: 'RxNorm',
		}
	}
}

export const RxNormValidationTool = new DynamicStructuredTool({
	name: 'rxnorm_validation',
	description: 'Validate drug names using the RxNorm database (NIH). Returns RxCUI identifiers needed for interaction checking. Can also retrieve drug interactions and alternative medications.',
	schema: rxnormValidationSchema,
	func: async (input) => {
		const result = await executeRxNormValidation(input)
		return JSON.stringify(result, null, 2)
	},
})
