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
	timestamp: string
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

export interface AuditLogsResponse {
	logs: AuditLogEntry[]
	total: number
	page: number
	pageSize: number
	totalPages: number
}

export interface AuditStatsResponse {
	stats: {
		totalEvents: number
		eventsByType: Record<string, number>
		eventsBySeverity: Record<string, number>
		successRate: number
		phiAccessCount: number
		aiInteractionCount: number
		averageResponseTime: number
	}
}

export interface AuditFilters {
	search?: string
	eventType?: AuditEventType | 'ALL'
	severity?: AuditSeverity | 'ALL'
	startDate?: string
	endDate?: string
	success?: boolean | 'ALL'
	patientId?: string
	sortOrder?: 'asc' | 'desc'
	page?: number
	pageSize?: number
}

export const EVENT_TYPE_LABELS: Record<AuditEventType, string> = {
	login: 'User Login',
	logout: 'User Logout',
	login_failed: 'Failed Login',
	ai_request: 'AI Request',
	ai_response: 'AI Response',
	ai_analysis: 'AI Analysis',
	patient_access: 'Patient Viewed',
	patient_create: 'Patient Created',
	patient_update: 'Patient Updated',
	patient_delete: 'Patient Deleted',
	patient_list: 'Patient List Viewed',
	profile_view: 'Profile Viewed',
	treatment_plan_view: 'Treatment Plan Viewed',
	treatment_plan_create: 'Treatment Plan Created',
	treatment_plan_update: 'Treatment Plan Updated',
	treatment_plan_delete: 'Treatment Plan Deleted',
	treatment_plan_approve: 'Treatment Plan Approved',
	treatment_plan_reject: 'Treatment Plan Rejected',
	phi_access: 'PHI Accessed',
	phi_deidentify: 'PHI De-identified',
	phi_reidentify: 'PHI Re-identified',
	authentication: 'Authentication Event',
	authorization_failure: 'Authorization Failure',
	data_export: 'Data Export',
	knowledge_ingest: 'Knowledge Ingested',
	safety_alert: 'Safety Alert',
	error: 'Error',
}

export const SEVERITY_COLORS: Record<AuditSeverity, string> = {
	info: 'bg-blue-100 text-blue-800',
	warning: 'bg-yellow-100 text-yellow-800',
	error: 'bg-red-100 text-red-800',
	critical: 'bg-red-200 text-red-900',
}

export const EVENT_TYPE_ICONS: Record<string, string> = {
	login: '🔐',
	logout: '🚪',
	login_failed: '⚠️',
	patient: '👤',
	treatment_plan: '📋',
	ai: '🤖',
	phi: '🔒',
	safety_alert: '🚨',
	error: '❌',
	data_export: '📤',
}
