import { prisma } from '@/lib/prisma'
import { AuditLog, Prisma } from '@/lib/generated/prisma'

export type AuditEventType =
	| 'login'
	| 'logout'
	| 'login_failed'
	| 'ai_request'
	| 'ai_response'
	| 'ai_analysis'
	| 'patient_access'
	| 'patient_create'
	| 'patient_update'
	| 'patient_delete'
	| 'patient_list'
	| 'profile_view'
	| 'treatment_plan_view'
	| 'treatment_plan_create'
	| 'treatment_plan_update'
	| 'treatment_plan_delete'
	| 'treatment_plan_approve'
	| 'treatment_plan_reject'
	| 'phi_access'
	| 'phi_deidentify'
	| 'phi_reidentify'
	| 'authentication'
	| 'authorization_failure'
	| 'data_export'
	| 'knowledge_ingest'
	| 'safety_alert'
	| 'error'

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface AuditLogEntry {
	id: string
	timestamp: Date
	eventType: AuditEventType
	severity: AuditSeverity
	userId?: string | null
	sessionId?: string | null
	patientId?: string | null
	resourceType?: string | null
	resourceId?: string | null
	action: string
	details: Record<string, unknown>
	ipAddress?: string | null
	userAgent?: string | null
	success: boolean
	errorMessage?: string | null
	durationMs?: number | null
	phiAccessed: boolean
	phiFields?: string[]
}

export interface AIAuditDetails {
	requestId: string
	model: string
	promptTokens?: number
	completionTokens?: number
	totalTokens?: number
	ragSourceCount?: number
	medicationsRecommended?: string[]
	safetyAlertsTriggered?: string[]
	confidenceScore?: number
	wasModified?: boolean
	modificationReason?: string
}

export interface AuditSearchOptions {
	userId?: string
	patientId?: string
	eventTypes?: AuditEventType[]
	severity?: AuditSeverity[]
	startDate?: Date
	endDate?: Date
	success?: boolean
	phiAccessed?: boolean
	limit?: number
	offset?: number
}

function mapDbToEntry(log: AuditLog): AuditLogEntry {
	return {
		id: log.id,
		timestamp: log.timestamp,
		eventType: log.eventType as AuditEventType,
		severity: log.severity as AuditSeverity,
		userId: log.userId,
		sessionId: log.sessionId,
		patientId: log.patientId,
		resourceType: log.resourceType,
		resourceId: log.resourceId,
		action: log.action,
		details: log.details as Record<string, unknown>,
		ipAddress: log.ipAddress,
		userAgent: log.userAgent,
		success: log.success,
		errorMessage: log.errorMessage,
		durationMs: log.durationMs,
		phiAccessed: log.phiAccessed,
		phiFields: log.phiFields,
	}
}

export class AuditService {
	private static async persistToDatabase(entry: Omit<AuditLogEntry, 'id'>): Promise<AuditLog> {
		try {
			return await prisma.auditLog.create({
				data: {
					timestamp: entry.timestamp,
					eventType: entry.eventType,
					severity: entry.severity,
					userId: entry.userId ?? null,
					sessionId: entry.sessionId ?? null,
					patientId: entry.patientId ?? null,
					resourceType: entry.resourceType ?? null,
					resourceId: entry.resourceId ?? null,
					action: entry.action,
					details: entry.details as Prisma.InputJsonValue,
					ipAddress: entry.ipAddress ?? null,
					userAgent: entry.userAgent ?? null,
					success: entry.success,
					errorMessage: entry.errorMessage ?? null,
					durationMs: entry.durationMs ?? null,
					phiAccessed: entry.phiAccessed,
					phiFields: entry.phiFields ?? [],
				},
			})
		} catch (error) {
			console.error('Failed to persist audit log to database:', error)
			throw error
		}
	}

	static async log(
		eventType: AuditEventType,
		action: string,
		options: {
			userId?: string
			sessionId?: string
			patientId?: string
			resourceType?: string
			resourceId?: string
			details?: Record<string, unknown>
			ipAddress?: string
			userAgent?: string
			success?: boolean
			errorMessage?: string
			durationMs?: number
			phiAccessed?: boolean
			phiFields?: string[]
			severity?: AuditSeverity
		} = {}
	): Promise<string> {
		const entry: Omit<AuditLogEntry, 'id'> = {
			timestamp: new Date(),
			eventType,
			severity: options.severity || this.determineSeverity(eventType, options.success ?? true),
			userId: options.userId,
			sessionId: options.sessionId,
			patientId: options.patientId,
			resourceType: options.resourceType,
			resourceId: options.resourceId,
			action,
			details: options.details || {},
			ipAddress: options.ipAddress,
			userAgent: options.userAgent,
			success: options.success ?? true,
			errorMessage: options.errorMessage,
			durationMs: options.durationMs,
			phiAccessed: options.phiAccessed ?? false,
			phiFields: options.phiFields,
		}

		const dbEntry = await this.persistToDatabase(entry)

		if (entry.severity === 'critical' || entry.severity === 'error') {
			console.error(`[AUDIT ${entry.severity.toUpperCase()}] ${entry.eventType}: ${entry.action}`, {
				id: dbEntry.id,
				userId: entry.userId,
				patientId: entry.patientId,
				error: entry.errorMessage,
			})
		}

		return dbEntry.id
	}

	static async logLogin(options: {
		userId: string
		email: string
		ipAddress?: string
		userAgent?: string
		success?: boolean
		errorMessage?: string
	}): Promise<string> {
		const eventType: AuditEventType = options.success === false ? 'login_failed' : 'login'
		return this.log(eventType, options.success === false ? 'Login failed' : 'User logged in', {
			userId: options.userId,
			details: {
				email: options.email,
			},
			ipAddress: options.ipAddress,
			userAgent: options.userAgent,
			success: options.success ?? true,
			errorMessage: options.errorMessage,
			severity: options.success === false ? 'warning' : 'info',
		})
	}

	static async logLogout(options: {
		userId: string
		email?: string
		ipAddress?: string
		userAgent?: string
	}): Promise<string> {
		return this.log('logout', 'User logged out', {
			userId: options.userId,
			details: {
				email: options.email,
			},
			ipAddress: options.ipAddress,
			userAgent: options.userAgent,
			success: true,
		})
	}

	static async logProfileView(options: {
		userId: string
		viewedUserId: string
		sessionId?: string
		ipAddress?: string
	}): Promise<string> {
		return this.log('profile_view', 'Profile viewed', {
			userId: options.userId,
			sessionId: options.sessionId,
			resourceType: 'user_profile',
			resourceId: options.viewedUserId,
			details: {
				viewedUserId: options.viewedUserId,
			},
			ipAddress: options.ipAddress,
			success: true,
		})
	}

	static async logAIInteraction(
		action: 'request' | 'response',
		options: {
			userId: string
			sessionId: string
			patientId?: string
			aiDetails: AIAuditDetails
			success?: boolean
			errorMessage?: string
			durationMs?: number
		}
	): Promise<string> {
		const eventType: AuditEventType = action === 'request' ? 'ai_request' : 'ai_response'
		
		let severity: AuditSeverity = 'info'
		if (options.aiDetails.safetyAlertsTriggered && options.aiDetails.safetyAlertsTriggered.length > 0) {
			severity = 'warning'
		}
		if (!options.success) {
			severity = 'error'
		}

		return this.log(eventType, `AI ${action}`, {
			userId: options.userId,
			sessionId: options.sessionId,
			patientId: options.patientId,
			resourceType: 'ai_analysis',
			resourceId: options.aiDetails.requestId,
			details: {
				...options.aiDetails,
				action,
			},
			success: options.success ?? true,
			errorMessage: options.errorMessage,
			durationMs: options.durationMs,
			phiAccessed: !!options.patientId,
			phiFields: options.patientId ? ['patient_data'] : undefined,
			severity,
		})
	}

	static async logAIAnalysis(options: {
		userId: string
		patientId: string
		sessionId?: string
		analysisType: string
		durationMs?: number
		success?: boolean
		errorMessage?: string
	}): Promise<string> {
		return this.log('ai_analysis', `AI analysis: ${options.analysisType}`, {
			userId: options.userId,
			sessionId: options.sessionId,
			patientId: options.patientId,
			resourceType: 'ai_analysis',
			details: {
				analysisType: options.analysisType,
			},
			durationMs: options.durationMs,
			success: options.success ?? true,
			errorMessage: options.errorMessage,
			phiAccessed: true,
			phiFields: ['patient_data', 'symptoms', 'medical_history'],
		})
	}

	static async logPatientAccess(
		action: 'view' | 'create' | 'update' | 'delete' | 'list',
		options: {
			userId: string
			patientId?: string
			sessionId?: string
			ipAddress?: string
			fieldsAccessed?: string[]
			success?: boolean
			errorMessage?: string
			durationMs?: number
		}
	): Promise<string> {
		const eventTypeMap: Record<string, AuditEventType> = {
			view: 'patient_access',
			create: 'patient_create',
			update: 'patient_update',
			delete: 'patient_delete',
			list: 'patient_list',
		}

		return this.log(eventTypeMap[action], `Patient ${action}`, {
			userId: options.userId,
			sessionId: options.sessionId,
			patientId: options.patientId,
			resourceType: 'patient',
			resourceId: options.patientId,
			details: {
				action,
				fieldsAccessed: options.fieldsAccessed,
			},
			ipAddress: options.ipAddress,
			success: options.success ?? true,
			errorMessage: options.errorMessage,
			durationMs: options.durationMs,
			phiAccessed: action !== 'list',
			phiFields: options.fieldsAccessed || ['patient_record'],
		})
	}

	static async logTreatmentPlanAction(
		action: 'view' | 'create' | 'update' | 'delete' | 'approve' | 'reject',
		options: {
			userId: string
			patientId: string
			planId: string
			sessionId?: string
			modifications?: string[]
			aiGenerated?: boolean
			success?: boolean
			errorMessage?: string
		}
	): Promise<string> {
		const eventTypeMap: Record<string, AuditEventType> = {
			view: 'treatment_plan_view',
			create: 'treatment_plan_create',
			update: 'treatment_plan_update',
			delete: 'treatment_plan_delete',
			approve: 'treatment_plan_approve',
			reject: 'treatment_plan_reject',
		}

		return this.log(eventTypeMap[action], `Treatment plan ${action}`, {
			userId: options.userId,
			sessionId: options.sessionId,
			patientId: options.patientId,
			resourceType: 'treatment_plan',
			resourceId: options.planId,
			details: {
				action,
				modifications: options.modifications,
				aiGenerated: options.aiGenerated,
			},
			success: options.success ?? true,
			errorMessage: options.errorMessage,
			phiAccessed: true,
			phiFields: ['treatment_plan', 'medications'],
		})
	}

	static async logSafetyAlert(
		alertType: string,
		options: {
			userId?: string
			patientId?: string
			sessionId?: string
			medication?: string
			severity: 'warning' | 'critical'
			details: Record<string, unknown>
		}
	): Promise<string> {
		return this.log('safety_alert', `Safety alert: ${alertType}`, {
			userId: options.userId,
			sessionId: options.sessionId,
			patientId: options.patientId,
			resourceType: 'safety_check',
			details: {
				alertType,
				medication: options.medication,
				...options.details,
			},
			severity: options.severity === 'critical' ? 'critical' : 'warning',
			success: true,
			phiAccessed: !!options.patientId,
		})
	}

	static async logPHIOperation(
		operation: 'deidentify' | 'reidentify' | 'access',
		options: {
			userId: string
			sessionId: string
			patientId?: string
			fieldsProcessed: string[]
			tokenCount?: number
			success?: boolean
		}
	): Promise<string> {
		const eventType: AuditEventType = operation === 'access' ? 'phi_access' :
			operation === 'deidentify' ? 'phi_deidentify' : 'phi_reidentify'

		return this.log(eventType, `PHI ${operation}`, {
			userId: options.userId,
			sessionId: options.sessionId,
			patientId: options.patientId,
			resourceType: 'phi',
			details: {
				operation,
				fieldsProcessed: options.fieldsProcessed,
				tokenCount: options.tokenCount,
			},
			success: options.success ?? true,
			phiAccessed: true,
			phiFields: options.fieldsProcessed,
		})
	}

	static async search(options: AuditSearchOptions): Promise<{
		logs: AuditLogEntry[]
		total: number
	}> {
		const {
			limit = 100,
			offset = 0,
		} = options

		const where: Prisma.AuditLogWhereInput = {}

		if (options.userId) {
			where.userId = options.userId
		}
		if (options.patientId) {
			where.patientId = options.patientId
		}
		if (options.eventTypes && options.eventTypes.length > 0) {
			where.eventType = { in: options.eventTypes }
		}
		if (options.severity && options.severity.length > 0) {
			where.severity = { in: options.severity }
		}
		if (options.startDate || options.endDate) {
			where.timestamp = {}
			if (options.startDate) {
				where.timestamp.gte = options.startDate
			}
			if (options.endDate) {
				where.timestamp.lte = options.endDate
			}
		}
		if (options.success !== undefined) {
			where.success = options.success
		}
		if (options.phiAccessed !== undefined) {
			where.phiAccessed = options.phiAccessed
		}

		const [logs, total] = await Promise.all([
			prisma.auditLog.findMany({
				where,
				orderBy: { timestamp: 'desc' },
				skip: offset,
				take: limit,
			}),
			prisma.auditLog.count({ where }),
		])

		return {
			logs: logs.map(mapDbToEntry),
			total,
		}
	}

	static async getStats(options: {
		startDate?: Date
		endDate?: Date
		userId?: string
	} = {}): Promise<{
		totalEvents: number
		eventsByType: Record<string, number>
		eventsBySeverity: Record<string, number>
		successRate: number
		phiAccessCount: number
		aiInteractionCount: number
		averageResponseTime: number
	}> {
		const where: Prisma.AuditLogWhereInput = {}

		if (options.startDate || options.endDate) {
			where.timestamp = {}
			if (options.startDate) {
				where.timestamp.gte = options.startDate
			}
			if (options.endDate) {
				where.timestamp.lte = options.endDate
			}
		}
		if (options.userId) {
			where.userId = options.userId
		}

		const logs = await prisma.auditLog.findMany({ where })

		const eventsByType: Record<string, number> = {}
		const eventsBySeverity: Record<string, number> = {}
		let successCount = 0
		let phiAccessCount = 0
		let aiInteractionCount = 0
		let totalResponseTime = 0
		let responseTimeCount = 0

		for (const log of logs) {
			eventsByType[log.eventType] = (eventsByType[log.eventType] || 0) + 1
			eventsBySeverity[log.severity] = (eventsBySeverity[log.severity] || 0) + 1
			
			if (log.success) successCount++
			if (log.phiAccessed) phiAccessCount++
			if (log.eventType === 'ai_request' || log.eventType === 'ai_response' || log.eventType === 'ai_analysis') {
				aiInteractionCount++
			}
			if (log.durationMs) {
				totalResponseTime += log.durationMs
				responseTimeCount++
			}
		}

		return {
			totalEvents: logs.length,
			eventsByType,
			eventsBySeverity,
			successRate: logs.length > 0 ? successCount / logs.length : 1,
			phiAccessCount,
			aiInteractionCount,
			averageResponseTime: responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0,
		}
	}

	static async exportForCompliance(options: {
		startDate: Date
		endDate: Date
		userId?: string
		patientId?: string
		format?: 'json' | 'csv'
	}): Promise<string> {
		const result = await this.search({
			startDate: options.startDate,
			endDate: options.endDate,
			userId: options.userId,
			patientId: options.patientId,
			limit: 100000,
		})

		await this.log('data_export', 'Audit log export for compliance', {
			userId: options.userId,
			details: {
				startDate: options.startDate.toISOString(),
				endDate: options.endDate.toISOString(),
				recordCount: result.total,
				format: options.format || 'json',
			},
			success: true,
			phiAccessed: !!options.patientId,
		})

		if (options.format === 'csv') {
			const headers = [
				'id', 'timestamp', 'eventType', 'severity', 'userId', 'patientId',
				'action', 'success', 'phiAccessed', 'durationMs',
			]
			const rows = result.logs.map(log => [
				log.id,
				log.timestamp.toISOString(),
				log.eventType,
				log.severity,
				log.userId || '',
				log.patientId || '',
				log.action,
				log.success.toString(),
				log.phiAccessed.toString(),
				log.durationMs?.toString() || '',
			])
			return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
		}

		return JSON.stringify(result.logs, null, 2)
	}

	private static determineSeverity(eventType: AuditEventType, success: boolean): AuditSeverity {
		if (!success) {
			if (eventType === 'authorization_failure') return 'critical'
			if (eventType === 'safety_alert') return 'critical'
			if (eventType === 'login_failed') return 'warning'
			return 'error'
		}

		switch (eventType) {
			case 'safety_alert':
				return 'warning'
			case 'patient_delete':
			case 'treatment_plan_delete':
			case 'authorization_failure':
				return 'warning'
			case 'error':
				return 'error'
			default:
				return 'info'
		}
	}
}
