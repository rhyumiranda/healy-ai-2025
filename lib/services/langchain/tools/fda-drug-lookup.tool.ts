import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { OpenFDAService } from '../../medical-apis.service'
import type { AgentToolResult } from '../types'

export const fdaDrugLookupSchema = z.object({
	drugName: z.string().describe('The name of the drug to look up (brand or generic name)'),
	includeLabel: z.boolean().optional().default(true).describe('Whether to include full drug label information'),
	includeAdverseEvents: z.boolean().optional().default(false).describe('Whether to include adverse event data'),
})

export type FDADrugLookupInput = z.infer<typeof fdaDrugLookupSchema>

export async function executeFDADrugLookup(input: FDADrugLookupInput): Promise<AgentToolResult> {
	try {
		const drugInfo = await OpenFDAService.searchDrug(input.drugName)
		
		if (!drugInfo) {
			return {
				success: false,
				error: `Drug "${input.drugName}" not found in FDA database`,
				source: 'OpenFDA',
			}
		}

		const result: Record<string, unknown> = {
			drugInfo,
		}

		if (input.includeLabel) {
			const labelInfo = await OpenFDAService.getDrugLabel(input.drugName)
			if (labelInfo) {
				result.labelInfo = labelInfo
			}
		}

		if (input.includeAdverseEvents) {
			const adverseEvents = await OpenFDAService.getAdverseEvents(input.drugName, 10)
			result.adverseEvents = adverseEvents
		}

		return {
			success: true,
			data: result,
			source: 'OpenFDA',
			confidence: 95,
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to lookup drug in FDA database',
			source: 'OpenFDA',
		}
	}
}

export const FDADrugLookupTool = new DynamicStructuredTool({
	name: 'fda_drug_lookup',
	description: 'Search the OpenFDA database for drug information including brand/generic names, dosage forms, contraindications, warnings, and adverse events. Use this to validate drug recommendations and get official FDA information.',
	schema: fdaDrugLookupSchema,
	func: async (input) => {
		const result = await executeFDADrugLookup(input)
		return JSON.stringify(result, null, 2)
	},
})
