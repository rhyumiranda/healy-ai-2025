import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

export type AuditEventType =
	| 'ai_request'
	| 'ai_response'
	| 'patient_access'
	| 'patient_create'
	| 'patient_update'
	| 'patient_delete'
	| 'treatment_plan_create'
	| 'treatment_plan_update'
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
	userId?: string
	sessionId?: string
	patientId?: string
	resourceType?: string
	resourceId?: string
	action: string
	details: Record<string, unknown>
	ipAddress?: string
	userAgent?: string
	success: boolean
	errorMessage?: string
	durationMs?: number
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

const IN_MEMORY_LOGS: AuditLogEntry[] = []
const MAX_IN_MEMORY_LOGS = 10000

export class AuditService {
	private static async persistToDatabase(entry: AuditLogEntry): Promise<void> {
		try {
			await prisma.$executeRawUnsafe(`
				INSERT INTO audit_logs (
					id, timestamp, event_type, severity, user_id, session_id,
					patient_id, resource_type, resource_id, action, details,
					ip_address, user_agent, success, error_message, duration_ms,
					phi_accessed, phi_fields
				) VALUES (
					$1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb,
					$12, $13, $14, $15, $16, $17, $18::text[]
				)
			`,
				entry.id,
				entry.timestamp,
				entry.eventType,
				entry.severity,
				entry.userId || null,
				entry.sessionId || null,
				entry.patientId || null,
				entry.resourceType || null,
				entry.resourceId || null,
				entry.action,
				JSON.stringify(entry.details),
				entry.ipAddress || null,
				entry.userAgent || null,
				entry.success,
				entry.errorMessage || null,
				entry.durationMs || null,
				entry.phiAccessed,
				entry.phiFields || []
			)
		} catch (error) {
			console.error('Failed to persist audit log to database:', error)
			this.storeInMemory(entry)
		}
	}

	private static storeInMemory(entry: AuditLogEntry): void {
		IN_MEMORY_LOGS.push(entry)
		if (IN_MEMORY_LOGS.length > MAX_IN_MEMORY_LOGS) {
			IN_MEMORY_LOGS.shift()
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
		const entry: AuditLogEntry = {
			id: uuidv4(),
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

		this.storeInMemory(entry)

		await this.persistToDatabase(entry)

		if (entry.severity === 'critical' || entry.severity === 'error') {
			console.error(`[AUDIT ${entry.severity.toUpperCase()}] ${entry.eventType}: ${entry.action}`, {
				id: entry.id,
				userId: entry.userId,
				patientId: entry.patientId,
				error: entry.errorMessage,
			})
		}

		return entry.id
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

	static async logPatientAccess(
		action: 'view' | 'create' | 'update' | 'delete',
		options: {
			userId: string
			patientId: string
			sessionId?: string
			ipAddress?: string
			fieldsAccessed?: string[]
			success?: boolean
			errorMessage?: string
		}
	): Promise<string> {
		const eventTypeMap: Record<string, AuditEventType> = {
			view: 'patient_access',
			create: 'patient_create',
			update: 'patient_update',
			delete: 'patient_delete',
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
			phiAccessed: true,
			phiFields: options.fieldsAccessed || ['patient_record'],
		})
	}

	static async logTreatmentPlanAction(
		action: 'create' | 'update' | 'approve' | 'reject',
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
			create: 'treatment_plan_create',
			update: 'treatment_plan_update',
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

		let filtered = [...IN_MEMORY_LOGS]

		if (options.userId) {
			filtered = filtered.filter(l => l.userId === options.userId)
		}
		if (options.patientId) {
			filtered = filtered.filter(l => l.patientId === options.patientId)
		}
		if (options.eventTypes && options.eventTypes.length > 0) {
			filtered = filtered.filter(l => options.eventTypes!.includes(l.eventType))
		}
		if (options.severity && options.severity.length > 0) {
			filtered = filtered.filter(l => options.severity!.includes(l.severity))
		}
		if (options.startDate) {
			filtered = filtered.filter(l => l.timestamp >= options.startDate!)
		}
		if (options.endDate) {
			filtered = filtered.filter(l => l.timestamp <= options.endDate!)
		}
		if (options.success !== undefined) {
			filtered = filtered.filter(l => l.success === options.success)
		}
		if (options.phiAccessed !== undefined) {
			filtered = filtered.filter(l => l.phiAccessed === options.phiAccessed)
		}

		filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

		return {
			logs: filtered.slice(offset, offset + limit),
			total: filtered.length,
		}
	}

	static async getStats(options: {
		startDate?: Date
		endDate?: Date
		userId?: string
	} = {}): Promise<{
		totalEvents: number
		eventsByType: Record<AuditEventType, number>
		eventsBySeverity: Record<AuditSeverity, number>
		successRate: number
		phiAccessCount: number
		aiInteractionCount: number
		averageResponseTime: number
	}> {
		let filtered = [...IN_MEMORY_LOGS]

		if (options.startDate) {
			filtered = filtered.filter(l => l.timestamp >= options.startDate!)
		}
		if (options.endDate) {
			filtered = filtered.filter(l => l.timestamp <= options.endDate!)
		}
		if (options.userId) {
			filtered = filtered.filter(l => l.userId === options.userId)
		}

		const eventsByType: Record<string, number> = {}
		const eventsBySeverity: Record<string, number> = {}
		let successCount = 0
		let phiAccessCount = 0
		let aiInteractionCount = 0
		let totalResponseTime = 0
		let responseTimeCount = 0

		for (const log of filtered) {
			eventsByType[log.eventType] = (eventsByType[log.eventType] || 0) + 1
			eventsBySeverity[log.severity] = (eventsBySeverity[log.severity] || 0) + 1
			
			if (log.success) successCount++
			if (log.phiAccessed) phiAccessCount++
			if (log.eventType === 'ai_request' || log.eventType === 'ai_response') {
				aiInteractionCount++
			}
			if (log.durationMs) {
				totalResponseTime += log.durationMs
				responseTimeCount++
			}
		}

		return {
			totalEvents: filtered.length,
			eventsByType: eventsByType as Record<AuditEventType, number>,
			eventsBySeverity: eventsBySeverity as Record<AuditSeverity, number>,
			successRate: filtered.length > 0 ? successCount / filtered.length : 1,
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
			return 'error'
		}

		switch (eventType) {
			case 'safety_alert':
				return 'warning'
			case 'patient_delete':
			case 'authorization_failure':
				return 'warning'
			case 'error':
				return 'error'
			default:
				return 'info'
		}
	}
}

