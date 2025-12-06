import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AuditService, AuditEventType, AuditSeverity } from '@/lib/services/audit.service'

export async function GET(req: Request) {
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { searchParams } = new URL(req.url)
		const page = parseInt(searchParams.get('page') || '1')
		const pageSize = parseInt(searchParams.get('pageSize') || '20')
		const search = searchParams.get('search') || ''
		const eventType = searchParams.get('eventType')
		const severity = searchParams.get('severity')
		const startDate = searchParams.get('startDate')
		const endDate = searchParams.get('endDate')
		const success = searchParams.get('success')
		const patientId = searchParams.get('patientId')
		const sortOrder = searchParams.get('sortOrder') || 'desc'

		const eventTypes: AuditEventType[] | undefined = eventType && eventType !== 'ALL'
			? [eventType as AuditEventType]
			: undefined

		const severities: AuditSeverity[] | undefined = severity && severity !== 'ALL'
			? [severity as AuditSeverity]
			: undefined

		const result = await AuditService.search({
			userId: session.user.id,
			patientId: patientId || undefined,
			eventTypes,
			severity: severities,
			startDate: startDate ? new Date(startDate) : undefined,
			endDate: endDate ? new Date(endDate) : undefined,
			success: success === 'true' ? true : success === 'false' ? false : undefined,
			limit: pageSize,
			offset: (page - 1) * pageSize,
		})

		let filteredLogs = result.logs
		if (search) {
			const searchLower = search.toLowerCase()
			filteredLogs = filteredLogs.filter(log =>
				log.action.toLowerCase().includes(searchLower) ||
				log.eventType.toLowerCase().includes(searchLower) ||
				(log.resourceType && log.resourceType.toLowerCase().includes(searchLower))
			)
		}

		if (sortOrder === 'asc') {
			filteredLogs = filteredLogs.reverse()
		}

		return NextResponse.json({
			logs: filteredLogs,
			total: result.total,
			page,
			pageSize,
			totalPages: Math.ceil(result.total / pageSize),
		})
	} catch (error) {
		console.error('Error fetching audit logs:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch audit logs' },
			{ status: 500 }
		)
	}
}

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const { format, startDate, endDate, patientId } = body

		if (!startDate || !endDate) {
			return NextResponse.json(
				{ error: 'Start date and end date are required' },
				{ status: 400 }
			)
		}

		const exportData = await AuditService.exportForCompliance({
			startDate: new Date(startDate),
			endDate: new Date(endDate),
			userId: session.user.id,
			patientId,
			format: format || 'json',
		})

		const contentType = format === 'csv' ? 'text/csv' : 'application/json'
		const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.${format || 'json'}`

		return new NextResponse(exportData, {
			headers: {
				'Content-Type': contentType,
				'Content-Disposition': `attachment; filename="${filename}"`,
			},
		})
	} catch (error) {
		console.error('Error exporting audit logs:', error)
		return NextResponse.json(
			{ error: 'Failed to export audit logs' },
			{ status: 500 }
		)
	}
}
