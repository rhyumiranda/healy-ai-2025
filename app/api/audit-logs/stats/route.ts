import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AuditService } from '@/lib/services/audit.service'

export async function GET(req: Request) {
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { searchParams } = new URL(req.url)
		const startDate = searchParams.get('startDate')
		const endDate = searchParams.get('endDate')

		const stats = await AuditService.getStats({
			userId: session.user.id,
			startDate: startDate ? new Date(startDate) : undefined,
			endDate: endDate ? new Date(endDate) : undefined,
		})

		return NextResponse.json({ stats })
	} catch (error) {
		console.error('Error fetching audit stats:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch audit stats' },
			{ status: 500 }
		)
	}
}
