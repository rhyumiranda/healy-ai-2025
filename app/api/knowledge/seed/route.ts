import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { KnowledgeSeederService } from '@/lib/services/knowledge-seeder.service'
import { AssistantService } from '@/lib/services/assistant.service'

export async function POST() {
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		if (!AssistantService.isConfigured()) {
			return NextResponse.json(
				{ error: 'OpenAI API key not configured' },
				{ status: 400 }
			)
		}

		const vectorStoreId = await AssistantService.getOrCreateVectorStore()
		const assistantId = await AssistantService.getOrCreateAssistant()

		const result = await KnowledgeSeederService.seedAllKnowledge()

		return NextResponse.json({
			success: true,
			message: 'Knowledge base seeded successfully',
			vectorStoreId,
			assistantId,
			seeded: result,
			envInstructions: {
				message: 'Add these to your .env file if not already present:',
				OPENAI_VECTOR_STORE_ID: vectorStoreId,
				OPENAI_ASSISTANT_ID: assistantId,
			},
		})
	} catch (error) {
		console.error('Error seeding knowledge base:', error)
		return NextResponse.json(
			{ error: 'Failed to seed knowledge base' },
			{ status: 500 }
		)
	}
}
