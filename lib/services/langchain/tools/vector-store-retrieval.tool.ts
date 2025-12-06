import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { RetrievalService } from '../../rag'
import type { SourceType } from '../../rag/types'
import type { AgentToolResult } from '../types'

export const vectorStoreRetrievalSchema = z.object({
	query: z.string().describe('The search query to find relevant medical knowledge'),
	sourceTypes: z.array(z.enum(['clinical_guideline', 'drug_label', 'pubmed', 'interaction']))
		.optional()
		.describe('Filter by specific source types'),
	maxDocuments: z.number().min(1).max(20).optional().default(10)
		.describe('Maximum number of documents to retrieve'),
	minSimilarity: z.number().min(0).max(1).optional().default(0.5)
		.describe('Minimum similarity score (0-1) for retrieved documents'),
})

export type VectorStoreRetrievalInput = z.infer<typeof vectorStoreRetrievalSchema>

export async function executeVectorStoreRetrieval(input: VectorStoreRetrievalInput): Promise<AgentToolResult> {
	try {
		const context = await RetrievalService.getContext(
			{
				chiefComplaint: input.query,
				currentSymptoms: [],
			},
			{
				maxDocuments: input.maxDocuments,
				minSimilarity: input.minSimilarity,
				sourceTypes: input.sourceTypes as SourceType[] | undefined,
			}
		)

		if (context.documents.length === 0) {
			return {
				success: true,
				data: {
					documentsFound: 0,
					message: 'No relevant documents found for the query',
					query: input.query,
				},
				source: 'VectorStore',
				confidence: 50,
			}
		}

		return {
			success: true,
			data: {
				documentsFound: context.documents.length,
				relevanceScore: context.relevanceScore,
				sourceBreakdown: context.sourceBreakdown,
				documents: context.documents.map(doc => ({
					id: doc.id,
					sourceType: doc.sourceType,
					sourceName: doc.sourceName,
					content: doc.content.slice(0, 1000),
					similarity: doc.similarity,
				})),
				citations: context.citations,
			},
			source: 'VectorStore',
			confidence: Math.round(context.relevanceScore * 100),
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to retrieve from vector store',
			source: 'VectorStore',
		}
	}
}

export const VectorStoreRetrievalTool = new DynamicStructuredTool({
	name: 'vector_store_retrieval',
	description: 'Search the medical knowledge base (RAG) for clinical guidelines, drug information, research evidence, and drug interactions. Use this to find evidence-based recommendations and validate treatment approaches.',
	schema: vectorStoreRetrievalSchema,
	func: async (input) => {
		const result = await executeVectorStoreRetrieval(input)
		return JSON.stringify(result, null, 2)
	},
})

