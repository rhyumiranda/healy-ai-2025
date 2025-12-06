import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { KnowledgeIngestionService } from '@/lib/services/rag'
import { z } from 'zod'

const ingestFDASchema = z.object({
	type: z.literal('fda'),
	drugs: z.array(z.object({
		drugName: z.string(),
		sections: z.array(z.enum(['contraindications', 'warnings', 'dosage', 'interactions', 'indications'])).optional(),
	})),
})

const ingestPubMedSchema = z.object({
	type: z.literal('pubmed'),
	queries: z.array(z.object({
		condition: z.string(),
		medication: z.string().optional(),
		maxArticles: z.number().optional(),
	})),
})

const ingestGuidelinesSchema = z.object({
	type: z.literal('guidelines'),
	guidelines: z.array(z.object({
		title: z.string(),
		content: z.string(),
		source: z.string(),
		category: z.string().optional(),
		severityRelevance: z.array(z.string()).optional(),
	})),
})

const ingestInteractionsSchema = z.object({
	type: z.literal('interactions'),
	interactions: z.array(z.object({
		drug1: z.string(),
		drug2: z.string(),
		severity: z.string(),
		description: z.string(),
		recommendation: z.string(),
	})),
})

const requestSchema = z.union([
	ingestFDASchema,
	ingestPubMedSchema,
	ingestGuidelinesSchema,
	ingestInteractionsSchema,
])

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const data = requestSchema.parse(body)

		let result

		switch (data.type) {
			case 'fda':
				result = await KnowledgeIngestionService.ingestFDADrugLabels(data.drugs)
				break
			case 'pubmed':
				result = await KnowledgeIngestionService.ingestPubMedArticles(data.queries)
				break
			case 'guidelines':
				result = await KnowledgeIngestionService.ingestClinicalGuidelines(data.guidelines)
				break
			case 'interactions':
				result = await KnowledgeIngestionService.ingestDrugInteractions(data.interactions)
				break
		}

		return NextResponse.json({
			success: true,
			result,
		})
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Invalid request data', details: error.issues },
				{ status: 400 }
			)
		}

		console.error('Knowledge ingestion error:', error)
		return NextResponse.json(
			{ error: 'Failed to ingest knowledge' },
			{ status: 500 }
		)
	}
}

export async function GET() {
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const stats = await KnowledgeIngestionService.getIngestionStats()

		return NextResponse.json(stats)
	} catch (error) {
		console.error('Error getting ingestion stats:', error)
		return NextResponse.json(
			{ error: 'Failed to get stats' },
			{ status: 500 }
		)
	}
}

export async function DELETE(req: Request) {
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { searchParams } = new URL(req.url)
		const sourceType = searchParams.get('sourceType') as 'clinical_guideline' | 'drug_label' | 'pubmed' | 'interaction' | null

		const deleted = await KnowledgeIngestionService.clearKnowledgeBase(sourceType || undefined)

		return NextResponse.json({
			success: true,
			deletedCount: deleted,
			sourceType: sourceType || 'all',
		})
	} catch (error) {
		console.error('Error clearing knowledge base:', error)
		return NextResponse.json(
			{ error: 'Failed to clear knowledge base' },
			{ status: 500 }
		)
	}
}
