import type { EmbeddingResult } from './types'

const EMBEDDING_DIMENSIONS = 384
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

interface EmbeddingApiResponse {
	embeddings: number[][]
	model: string
	dimensions: number
	tokenCounts: number[]
}

export class EmbeddingService {
	private static isConfigured(): boolean {
		return !!(SUPABASE_URL && SUPABASE_ANON_KEY)
	}

	static async generateEmbedding(text: string): Promise<EmbeddingResult> {
		const result = await this.generateEmbeddings([text])
		return result[0]
	}

	static async generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
		if (texts.length === 0) {
			return []
		}

		const cleanedTexts = texts.map((text) => this.preprocessText(text))

		if (this.isConfigured()) {
			return this.callSupabaseEdgeFunction(cleanedTexts)
		}

		return this.generateMockEmbeddings(cleanedTexts)
	}

	private static preprocessText(text: string): string {
		return text
			.replace(/\s+/g, ' ')
			.trim()
			.slice(0, 8000)
	}

	private static async callSupabaseEdgeFunction(texts: string[]): Promise<EmbeddingResult[]> {
		try {
			const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-embedding`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
				},
				body: JSON.stringify({ texts, normalize: true }),
			})

			if (!response.ok) {
				const error = await response.text()
				throw new Error(`Edge function error: ${error}`)
			}

			const data: EmbeddingApiResponse = await response.json()

			return data.embeddings.map((embedding, index) => ({
				embedding,
				tokenCount: data.tokenCounts[index],
			}))
		} catch (error) {
			console.error('Supabase embedding error:', error)
			return this.generateMockEmbeddings(texts)
		}
	}

	private static generateMockEmbeddings(texts: string[]): EmbeddingResult[] {
		console.warn('Using mock embeddings - configure SUPABASE_URL and SUPABASE_ANON_KEY for production')

		return texts.map((text) => {
			const hash = this.hashString(text)
			const embedding = Array.from({ length: EMBEDDING_DIMENSIONS }, (_, i) => {
				const seed = hash + i
				return (Math.sin(seed) * 0.5 + 0.5) * 2 - 1
			})

			const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
			const normalizedEmbedding = embedding.map((val) => val / norm)

			return {
				embedding: normalizedEmbedding,
				tokenCount: Math.ceil(text.length / 4),
			}
		})
	}

	private static hashString(str: string): number {
		let hash = 0
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i)
			hash = ((hash << 5) - hash) + char
			hash = hash & hash
		}
		return Math.abs(hash)
	}

	static getDimensions(): number {
		return EMBEDDING_DIMENSIONS
	}

	static getModelName(): string {
		return 'all-MiniLM-L6-v2'
	}

	static calculateSimilarity(embedding1: number[], embedding2: number[]): number {
		if (embedding1.length !== embedding2.length) {
			throw new Error('Embeddings must have the same dimensions')
		}

		let dotProduct = 0
		let norm1 = 0
		let norm2 = 0

		for (let i = 0; i < embedding1.length; i++) {
			dotProduct += embedding1[i] * embedding2[i]
			norm1 += embedding1[i] * embedding1[i]
			norm2 += embedding2[i] * embedding2[i]
		}

		return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
	}
}
