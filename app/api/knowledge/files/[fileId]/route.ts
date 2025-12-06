import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AssistantService } from '@/lib/services/assistant.service'

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ fileId: string }> }
) {
	try {
		const session = await getServerSession(authOptions)
		const { fileId } = await params

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const success = await AssistantService.deleteKnowledgeFile(fileId)

		if (!success) {
			return NextResponse.json(
				{ error: 'Failed to delete file' },
				{ status: 400 }
			)
		}

		return NextResponse.json({ success: true, deletedFileId: fileId })
	} catch (error) {
		console.error('Error deleting knowledge file:', error)
		return NextResponse.json(
			{ error: 'Failed to delete file' },
			{ status: 500 }
		)
	}
}
