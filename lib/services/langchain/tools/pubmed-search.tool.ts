import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { PubMedService } from '../../pubmed.service'
import type { AgentToolResult, PubMedReferenceEvidence } from '../types'

export const pubmedSearchSchema = z.object({
	condition: z.string().describe('The medical condition or disease to search for'),
	medication: z.string().optional().describe('Optional: specific medication to include in search'),
	maxResults: z.number().min(1).max(20).optional().default(5).describe('Maximum number of articles to return'),
	yearFrom: z.number().optional().describe('Optional: filter to articles published after this year'),
})

export type PubMedSearchInput = z.infer<typeof pubmedSearchSchema>

export async function executePubMedSearch(input: PubMedSearchInput): Promise<AgentToolResult> {
	try {
		const searchResult = await PubMedService.searchArticles(
			input.condition,
			input.medication,
			{
				maxResults: input.maxResults,
				yearFrom: input.yearFrom,
			}
		)

		if (searchResult.references.length === 0) {
			return {
				success: true,
				data: {
					articlesFound: 0,
					message: `No PubMed articles found for "${input.condition}"${input.medication ? ` with "${input.medication}"` : ''}`,
					searchQuery: searchResult.searchQuery,
				},
				source: 'PubMed',
				confidence: 50,
			}
		}

		const references: PubMedReferenceEvidence[] = searchResult.references.map(ref => ({
			pmid: ref.pmid,
			title: ref.title,
			abstract: ref.abstract || '',
			publicationType: ref.publicationType.join(', '),
			relevanceScore: ref.relevanceScore || 0.7,
		}))

		const evidenceLevels = references.map(ref => {
			const pubType = ref.publicationType.toLowerCase()
			if (pubType.includes('meta-analysis') || pubType.includes('systematic review')) return 'A'
			if (pubType.includes('randomized') || pubType.includes('clinical trial')) return 'B'
			if (pubType.includes('cohort') || pubType.includes('observational')) return 'C'
			return 'D'
		})

		const bestEvidenceLevel = evidenceLevels.includes('A') ? 'A' 
			: evidenceLevels.includes('B') ? 'B'
			: evidenceLevels.includes('C') ? 'C' : 'D'

		return {
			success: true,
			data: {
				articlesFound: references.length,
				searchQuery: searchResult.searchQuery,
				bestEvidenceLevel,
				references,
				summary: `Found ${references.length} relevant articles. Best evidence level: ${bestEvidenceLevel}`,
			},
			source: 'PubMed',
			confidence: 85,
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to search PubMed',
			source: 'PubMed',
		}
	}
}

export const PubMedSearchTool = new DynamicStructuredTool({
	name: 'pubmed_search',
	description: 'Search PubMed for clinical research articles and evidence. Use this to find evidence supporting treatment recommendations, especially for complex or uncommon conditions.',
	schema: pubmedSearchSchema,
	func: async (input) => {
		const result = await executePubMedSearch(input)
		return JSON.stringify(result, null, 2)
	},
})

