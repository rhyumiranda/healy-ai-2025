import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AssistantService } from '@/lib/services/assistant.service'

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const formData = await req.formData()
		const file = formData.get('file') as File | null
		const category = (formData.get('category') as string) || 'general'

		if (!file) {
			return NextResponse.json({ error: 'No file provided' }, { status: 400 })
		}

		const validTypes = ['application/json', 'application/pdf', 'text/plain', 'text/markdown']
		if (!validTypes.includes(file.type)) {
			return NextResponse.json(
				{ error: 'Invalid file type. Supported: JSON, PDF, TXT, MD' },
				{ status: 400 }
			)
		}

		const maxSize = 20 * 1024 * 1024
		if (file.size > maxSize) {
			return NextResponse.json(
				{ error: 'File too large. Maximum size: 20MB' },
				{ status: 400 }
			)
		}

		const buffer = Buffer.from(await file.arrayBuffer())
		const result = await AssistantService.uploadKnowledgeFile(
			buffer,
			file.name,
			category as 'clinical-guidelines' | 'drug-interactions' | 'treatment-protocols' | 'general'
		)

		return NextResponse.json({
			success: true,
			fileId: result.fileId,
			vectorStoreFileId: result.vectorStoreFileId,
			filename: file.name,
			size: file.size,
		})
	} catch (error) {
		console.error('Error uploading knowledge file:', error)
		return NextResponse.json(
			{ error: 'Failed to upload file' },
			{ status: 500 }
		)
	}
}
