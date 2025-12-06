import { prisma } from '@/lib/prisma'
import { EmbeddingService } from './embedding.service'
import type { EmbeddingDocument, RetrievedDocument, SourceType } from './types'

interface SearchOptions {
	matchThreshold?: number
	matchCount?: number
	filterSourceType?: SourceType | null
	severityRelevance?: string[]
}

export class VectorStoreService {
	static async upsertDocument(document: EmbeddingDocument): Promise<string> {
		const { embedding } = await EmbeddingService.generateEmbedding(document.content)
		const embeddingString = `[${embedding.join(',')}]`

		if (document.id) {
			await prisma.$executeRawUnsafe(`
				UPDATE medical_knowledge_embeddings 
				SET 
					content = $1,
					embedding = $2::vector,
					source_type = $3,
					source_id = $4,
					source_name = $5,
					metadata = $6::jsonb,
					severity_relevance = $7::text[],
					updated_at = NOW()
				WHERE id = $8::uuid
			`,
				document.content,
				embeddingString,
				document.sourceType,
				document.sourceId || null,
				document.sourceName,
				JSON.stringify(document.metadata || {}),
				document.severityRelevance || [],
				document.id
			)
			return document.id
		}

		const result = await prisma.$queryRawUnsafe<{ id: string }[]>(`
			INSERT INTO medical_knowledge_embeddings 
				(content, embedding, source_type, source_id, source_name, metadata, severity_relevance)
			VALUES 
				($1, $2::vector, $3, $4, $5, $6::jsonb, $7::text[])
			RETURNING id::text
		`,
			document.content,
			embeddingString,
			document.sourceType,
			document.sourceId || null,
			document.sourceName,
			JSON.stringify(document.metadata || {}),
			document.severityRelevance || []
		)

		return result[0].id
	}

	static async upsertDocuments(documents: EmbeddingDocument[]): Promise<string[]> {
		const ids: string[] = []

		const batchSize = 10
		for (let i = 0; i < documents.length; i += batchSize) {
			const batch = documents.slice(i, i + batchSize)
			const batchIds = await Promise.all(batch.map((doc) => this.upsertDocument(doc)))
			ids.push(...batchIds)
		}

		return ids
	}

	static async searchSimilar(
		query: string,
		options: SearchOptions = {}
	): Promise<RetrievedDocument[]> {
		const {
			matchThreshold = 0.5,
			matchCount = 10,
			filterSourceType = null,
			severityRelevance = [],
		} = options

		const { embedding } = await EmbeddingService.generateEmbedding(query)
		const embeddingString = `[${embedding.join(',')}]`

		let results: Array<{
			id: string
			content: string
			source_type: string
			source_id: string | null
			source_name: string
			metadata: Record<string, unknown>
			severity_relevance: string[]
			similarity: number
		}>

		if (filterSourceType) {
			results = await prisma.$queryRawUnsafe(`
				SELECT 
					id::text,
					content,
					source_type,
					source_id,
					source_name,
					metadata,
					severity_relevance,
					1 - (embedding <=> $1::vector) as similarity
				FROM medical_knowledge_embeddings
				WHERE 
					source_type = $2
					AND 1 - (embedding <=> $1::vector) > $3
				ORDER BY embedding <=> $1::vector
				LIMIT $4
			`,
				embeddingString,
				filterSourceType,
				matchThreshold,
				matchCount
			)
		} else {
			results = await prisma.$queryRawUnsafe(`
				SELECT 
					id::text,
					content,
					source_type,
					source_id,
					source_name,
					metadata,
					severity_relevance,
					1 - (embedding <=> $1::vector) as similarity
				FROM medical_knowledge_embeddings
				WHERE 1 - (embedding <=> $1::vector) > $2
				ORDER BY embedding <=> $1::vector
				LIMIT $3
			`,
				embeddingString,
				matchThreshold,
				matchCount
			)
		}

		let documents: RetrievedDocument[] = results.map((row) => ({
			id: row.id,
			content: row.content,
			sourceType: row.source_type as SourceType,
			sourceId: row.source_id,
			sourceName: row.source_name,
			metadata: row.metadata,
			severityRelevance: row.severity_relevance || [],
			similarity: Number(row.similarity),
		}))

		if (severityRelevance.length > 0) {
			documents = documents.sort((a, b) => {
				const aRelevance = a.severityRelevance.filter((tag) =>
					severityRelevance.includes(tag)
				).length
				const bRelevance = b.severityRelevance.filter((tag) =>
					severityRelevance.includes(tag)
				).length

				if (aRelevance !== bRelevance) {
					return bRelevance - aRelevance
				}
				return b.similarity - a.similarity
			})
		}

		return documents
	}

	static async deleteDocument(id: string): Promise<boolean> {
		try {
			await prisma.$executeRawUnsafe(`
				DELETE FROM medical_knowledge_embeddings WHERE id = $1::uuid
			`, id)
			return true
		} catch (error) {
			console.error('Error deleting document:', error)
			return false
		}
	}

	static async deleteBySourceType(sourceType: SourceType): Promise<number> {
		const result = await prisma.$executeRawUnsafe(`
			DELETE FROM medical_knowledge_embeddings WHERE source_type = $1
		`, sourceType)
		return result as number
	}

	static async deleteBySourceId(sourceId: string): Promise<boolean> {
		try {
			await prisma.$executeRawUnsafe(`
				DELETE FROM medical_knowledge_embeddings WHERE source_id = $1
			`, sourceId)
			return true
		} catch (error) {
			console.error('Error deleting by source ID:', error)
			return false
		}
	}

	static async getDocumentCount(sourceType?: SourceType): Promise<number> {
		if (sourceType) {
			const result = await prisma.$queryRawUnsafe<{ count: bigint }[]>(`
				SELECT COUNT(*) as count FROM medical_knowledge_embeddings WHERE source_type = $1
			`, sourceType)
			return Number(result[0].count)
		}

		const result = await prisma.$queryRawUnsafe<{ count: bigint }[]>(`
			SELECT COUNT(*) as count FROM medical_knowledge_embeddings
		`)
		return Number(result[0].count)
	}

	static async getSourceBreakdown(): Promise<Record<SourceType, number>> {
		const results = await prisma.$queryRawUnsafe<{ source_type: string; count: bigint }[]>(`
			SELECT source_type, COUNT(*) as count 
			FROM medical_knowledge_embeddings 
			GROUP BY source_type
		`)

		const breakdown: Record<SourceType, number> = {
			clinical_guideline: 0,
			drug_label: 0,
			pubmed: 0,
			interaction: 0,
		}

		for (const row of results) {
			breakdown[row.source_type as SourceType] = Number(row.count)
		}

		return breakdown
	}

	static async documentExists(sourceType: SourceType, sourceId: string): Promise<boolean> {
		const result = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(`
			SELECT EXISTS(
				SELECT 1 FROM medical_knowledge_embeddings 
				WHERE source_type = $1 AND source_id = $2
			) as exists
		`, sourceType, sourceId)

		return result[0].exists
	}
}
