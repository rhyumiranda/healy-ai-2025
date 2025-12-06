import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1'

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

let embeddingPipeline: Awaited<ReturnType<typeof pipeline>> | null = null

async function getEmbeddingPipeline() {
	if (!embeddingPipeline) {
		embeddingPipeline = await pipeline(
			'feature-extraction',
			'Xenova/all-MiniLM-L6-v2',
			{ quantized: true }
		)
	}
	return embeddingPipeline
}

interface EmbeddingRequest {
	texts: string[]
	normalize?: boolean
}

interface EmbeddingResponse {
	embeddings: number[][]
	model: string
	dimensions: number
	tokenCounts: number[]
}

serve(async (req: Request) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders })
	}

	try {
		const { texts, normalize = true }: EmbeddingRequest = await req.json()

		if (!texts || !Array.isArray(texts) || texts.length === 0) {
			return new Response(
				JSON.stringify({ error: 'texts array is required' }),
				{ status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			)
		}

		if (texts.length > 100) {
			return new Response(
				JSON.stringify({ error: 'Maximum 100 texts per request' }),
				{ status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			)
		}

		const pipe = await getEmbeddingPipeline()
		const embeddings: number[][] = []
		const tokenCounts: number[] = []

		for (const text of texts) {
			const output = await pipe(text, { pooling: 'mean', normalize })
			const embedding = Array.from(output.data as Float32Array)
			embeddings.push(embedding)
			tokenCounts.push(Math.ceil(text.length / 4))
		}

		const response: EmbeddingResponse = {
			embeddings,
			model: 'all-MiniLM-L6-v2',
			dimensions: 384,
			tokenCounts,
		}

		return new Response(
			JSON.stringify(response),
			{ headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		)
	} catch (error) {
		console.error('Embedding generation error:', error)
		return new Response(
			JSON.stringify({ error: 'Failed to generate embeddings', details: String(error) }),
			{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		)
	}
})
