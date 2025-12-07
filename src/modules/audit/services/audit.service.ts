import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AuditService as CoreAuditService } from '@/lib/services/audit.service'
import type { AuditLogsResponse, AuditStatsResponse, AuditFilters, AuditEventType, AuditSeverity } from '../types'

export class AuditService {
	static async getAuditLogsServer(filters: AuditFilters = {}): Promise<AuditLogsResponse> {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			throw new Error('Unauthorized')
		}

		const page = filters.page || 1
		const pageSize = filters.pageSize || 20
		const search = filters.search || ''
		const eventType = filters.eventType
		const severity = filters.severity
		const startDate = filters.startDate
		const endDate = filters.endDate
		const success = filters.success
		const patientId = filters.patientId
		const sortOrder = filters.sortOrder || 'desc'

		const eventTypes: AuditEventType[] | undefined = eventType && eventType !== 'ALL'
			? [eventType as AuditEventType]
			: undefined

		const severities: AuditSeverity[] | undefined = severity && severity !== 'ALL'
			? [severity as AuditSeverity]
			: undefined

		const result = await CoreAuditService.search({
			userId: session.user.id,
			patientId: patientId || undefined,
			eventTypes,
			severity: severities,
			startDate: startDate ? new Date(startDate) : undefined,
			endDate: endDate ? new Date(endDate) : undefined,
			success: success === true ? true : success === false ? false : undefined,
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

		return {
			logs: filteredLogs.map(log => ({
				id: log.id,
				timestamp: log.timestamp.toISOString(),
				eventType: log.eventType,
				severity: log.severity,
				userId: log.userId,
				sessionId: log.sessionId,
				patientId: log.patientId,
				resourceType: log.resourceType,
				resourceId: log.resourceId,
				action: log.action,
				details: log.details,
				ipAddress: log.ipAddress,
				userAgent: log.userAgent,
				success: log.success,
				errorMessage: log.errorMessage,
				durationMs: log.durationMs,
				phiAccessed: log.phiAccessed,
				phiFields: log.phiFields,
			})),
			total: result.total,
			page,
			pageSize,
			totalPages: Math.ceil(result.total / pageSize),
		}
	}

	static async getAuditStatsServer(startDate?: string, endDate?: string): Promise<AuditStatsResponse> {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			throw new Error('Unauthorized')
		}

		const stats = await CoreAuditService.getStats({
			userId: session.user.id,
			startDate: startDate ? new Date(startDate) : undefined,
			endDate: endDate ? new Date(endDate) : undefined,
		})

		return { stats }
	}
}

