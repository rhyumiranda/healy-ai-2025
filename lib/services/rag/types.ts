export type SourceType = 'clinical_guideline' | 'drug_label' | 'pubmed' | 'interaction'

export interface EmbeddingDocument {
	id?: string
	content: string
	sourceType: SourceType
	sourceId?: string
	sourceName: string
	metadata?: Record<string, unknown>
	severityRelevance?: string[]
}

export interface EmbeddingResult {
	embedding: number[]
	tokenCount: number
}

export interface RetrievedDocument {
	id: string
	content: string
	sourceType: SourceType
	sourceId: string | null
	sourceName: string
	metadata: Record<string, unknown>
	severityRelevance: string[]
	similarity: number
}

export interface Citation {
	sourceType: SourceType
	sourceName: string
	sourceId: string | null
	content: string
	relevance: number
}

export interface RAGContext {
	documents: RetrievedDocument[]
	citations: Citation[]
	relevanceScore: number
	sourceBreakdown: {
		guidelines: number
		drugLabels: number
		pubmed: number
		interactions: number
	}
}

export interface ChunkingOptions {
	maxChunkSize: number
	overlapSize: number
	preserveContext: boolean
}

export interface ContentChunk {
	content: string
	metadata: {
		chunkIndex: number
		totalChunks: number
		originalLength: number
		section?: string
	}
}

export interface IngestionResult {
	documentsIngested: number
	chunksCreated: number
	errors: string[]
	sourceType: SourceType
}
