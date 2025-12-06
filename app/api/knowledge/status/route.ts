import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AssistantService } from '@/lib/services/assistant.service'

export async function GET() {
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const status = await AssistantService.getVectorStoreStatus()

		if (!status) {
			return NextResponse.json({
				configured: false,
				message: 'Vector store not configured. Run the seeder to initialize.',
				hasAssistant: AssistantService.hasAssistant(),
				hasVectorStore: AssistantService.hasVectorStore(),
			})
		}

		return NextResponse.json({
			configured: true,
			hasAssistant: AssistantService.hasAssistant(),
			hasVectorStore: AssistantService.hasVectorStore(),
			vectorStore: status,
		})
	} catch (error) {
		console.error('Error getting knowledge status:', error)
		return NextResponse.json(
			{ error: 'Failed to get knowledge status' },
			{ status: 500 }
		)
	}
}
