import { prisma } from '@/lib/prisma'
import { EmbeddingService } from './embedding.service'
import type { EmbeddingDocument, RetrievedDocument, SourceType } from './types'

interface SearchOptions {
	matchThreshold?: number
	matchCount?: number
	filterSourceType?: SourceType | null
	severityRelevance?: string[]
}

interface HybridSearchOptions extends SearchOptions {
	semanticWeight?: number
	keywordWeight?: number
	keywords?: string[]
	boostExactMatch?: boolean
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

	static async hybridSearch(
		query: string,
		options: HybridSearchOptions = {}
	): Promise<RetrievedDocument[]> {
		const {
			matchThreshold = 0.4,
			matchCount = 15,
			filterSourceType = null,
			severityRelevance = [],
			semanticWeight = 0.7,
			keywordWeight = 0.3,
			keywords = [],
			boostExactMatch = true,
		} = options

		const { embedding } = await EmbeddingService.generateEmbedding(query)
		const embeddingString = `[${embedding.join(',')}]`

		const searchKeywords = keywords.length > 0 
			? keywords 
			: this.extractKeywords(query)

		const keywordPattern = searchKeywords.map(k => k.toLowerCase()).join('|')

		let results: Array<{
			id: string
			content: string
			source_type: string
			source_id: string | null
			source_name: string
			metadata: Record<string, unknown>
			severity_relevance: string[]
			semantic_score: number
			keyword_score: number
			hybrid_score: number
		}>

		if (filterSourceType) {
			results = await prisma.$queryRawUnsafe(`
				WITH semantic_search AS (
					SELECT 
						id,
						content,
						source_type,
						source_id,
						source_name,
						metadata,
						severity_relevance,
						1 - (embedding <=> $1::vector) as semantic_score
					FROM medical_knowledge_embeddings
					WHERE source_type = $2
					AND 1 - (embedding <=> $1::vector) > $3
				),
				keyword_search AS (
					SELECT 
						id,
						CASE 
							WHEN $4 = '' THEN 0
							ELSE (
								LENGTH(LOWER(content)) - LENGTH(REPLACE(LOWER(content), LOWER($4), ''))
							) / GREATEST(LENGTH($4), 1)::float / 10.0
						END as keyword_score
					FROM medical_knowledge_embeddings
					WHERE source_type = $2
				)
				SELECT 
					s.id::text,
					s.content,
					s.source_type,
					s.source_id,
					s.source_name,
					s.metadata,
					s.severity_relevance,
					s.semantic_score,
					COALESCE(k.keyword_score, 0) as keyword_score,
					(s.semantic_score * $5 + COALESCE(k.keyword_score, 0) * $6) as hybrid_score
				FROM semantic_search s
				LEFT JOIN keyword_search k ON s.id = k.id
				ORDER BY hybrid_score DESC
				LIMIT $7
			`,
				embeddingString,
				filterSourceType,
				matchThreshold,
				keywordPattern,
				semanticWeight,
				keywordWeight,
				matchCount
			)
		} else {
			results = await prisma.$queryRawUnsafe(`
				WITH semantic_search AS (
					SELECT 
						id,
						content,
						source_type,
						source_id,
						source_name,
						metadata,
						severity_relevance,
						1 - (embedding <=> $1::vector) as semantic_score
					FROM medical_knowledge_embeddings
					WHERE 1 - (embedding <=> $1::vector) > $2
				),
				keyword_search AS (
					SELECT 
						id,
						CASE 
							WHEN $3 = '' THEN 0
							ELSE (
								LENGTH(LOWER(content)) - LENGTH(REPLACE(LOWER(content), LOWER($3), ''))
							) / GREATEST(LENGTH($3), 1)::float / 10.0
						END as keyword_score
					FROM medical_knowledge_embeddings
				)
				SELECT 
					s.id::text,
					s.content,
					s.source_type,
					s.source_id,
					s.source_name,
					s.metadata,
					s.severity_relevance,
					s.semantic_score,
					COALESCE(k.keyword_score, 0) as keyword_score,
					(s.semantic_score * $4 + COALESCE(k.keyword_score, 0) * $5) as hybrid_score
				FROM semantic_search s
				LEFT JOIN keyword_search k ON s.id = k.id
				ORDER BY hybrid_score DESC
				LIMIT $6
			`,
				embeddingString,
				matchThreshold,
				keywordPattern,
				semanticWeight,
				keywordWeight,
				matchCount
			)
		}

		let documents: RetrievedDocument[] = results.map((row) => ({
			id: row.id,
			content: row.content,
			sourceType: row.source_type as SourceType,
			sourceId: row.source_id,
			sourceName: row.source_name,
			metadata: {
				...row.metadata,
				semanticScore: Number(row.semantic_score),
				keywordScore: Number(row.keyword_score),
				hybridScore: Number(row.hybrid_score),
			},
			severityRelevance: row.severity_relevance || [],
			similarity: Number(row.hybrid_score),
		}))

		if (boostExactMatch && searchKeywords.length > 0) {
			documents = documents.map(doc => {
				const contentLower = doc.content.toLowerCase()
				let exactMatchBoost = 0
				
				for (const keyword of searchKeywords) {
					if (contentLower.includes(keyword.toLowerCase())) {
						exactMatchBoost += 0.05
					}
				}
				
				return {
					...doc,
					similarity: Math.min(1, doc.similarity + exactMatchBoost),
				}
			}).sort((a, b) => b.similarity - a.similarity)
		}

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

	private static extractKeywords(query: string): string[] {
		const medicalTerms = [
			'hypertension', 'diabetes', 'pain', 'fever', 'infection',
			'antibiotic', 'nsaid', 'analgesic', 'antihypertensive',
			'headache', 'cough', 'nausea', 'diarrhea', 'vomiting',
			'chest', 'cardiac', 'renal', 'hepatic', 'respiratory',
			'allergy', 'interaction', 'contraindication', 'dosage',
			'pediatric', 'geriatric', 'pregnancy', 'lactation',
		]

		const queryLower = query.toLowerCase()
		const foundTerms: string[] = []

		for (const term of medicalTerms) {
			if (queryLower.includes(term)) {
				foundTerms.push(term)
			}
		}

		const words = query.split(/\s+/)
			.filter(w => w.length > 4)
			.map(w => w.replace(/[^a-zA-Z0-9]/g, '').toLowerCase())
			.filter(w => w.length > 4)

		const uniqueKeywords = [...new Set([...foundTerms, ...words.slice(0, 5)])]
		
		return uniqueKeywords.slice(0, 10)
	}

	static async searchWithDiversity(
		query: string,
		options: HybridSearchOptions & { minPerSourceType?: number } = {}
	): Promise<RetrievedDocument[]> {
		const {
			matchCount = 15,
			minPerSourceType = 2,
			...hybridOptions
		} = options

		const allResults = await this.hybridSearch(query, {
			...hybridOptions,
			matchCount: matchCount * 2,
		})

		const resultsByType: Record<SourceType, RetrievedDocument[]> = {
			clinical_guideline: [],
			drug_label: [],
			pubmed: [],
			interaction: [],
		}

		for (const doc of allResults) {
			resultsByType[doc.sourceType].push(doc)
		}

		const diverseResults: RetrievedDocument[] = []
		
		for (const sourceType of Object.keys(resultsByType) as SourceType[]) {
			const typeDocs = resultsByType[sourceType]
			const docsToAdd = typeDocs.slice(0, Math.max(minPerSourceType, Math.ceil(matchCount / 4)))
			diverseResults.push(...docsToAdd)
		}

		for (const doc of allResults) {
			if (!diverseResults.find(d => d.id === doc.id)) {
				diverseResults.push(doc)
			}
			if (diverseResults.length >= matchCount) break
		}

		return diverseResults.sort((a, b) => b.similarity - a.similarity).slice(0, matchCount)
	}
}
