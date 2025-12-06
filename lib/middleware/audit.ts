import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AuditService, AuditEventType } from '@/lib/services/audit.service'
import { v4 as uuidv4 } from 'uuid'

export interface AuditableRequest extends NextRequest {
	auditContext?: {
		requestId: string
		startTime: number
		userId?: string
		sessionId?: string
	}
}

const AUDITED_PATHS: Record<string, { eventType: AuditEventType; action: string; phiAccessed: boolean }> = {
	'/api/patients': { eventType: 'patient_access', action: 'Patient API access', phiAccessed: true },
	'/api/plans': { eventType: 'treatment_plan_create', action: 'Treatment plan API access', phiAccessed: true },
	'/api/treatment-plans': { eventType: 'treatment_plan_create', action: 'Treatment plan API access', phiAccessed: true },
	'/api/ai': { eventType: 'ai_request', action: 'AI API access', phiAccessed: true },
	'/api/knowledge': { eventType: 'knowledge_ingest', action: 'Knowledge base access', phiAccessed: false },
}

export async function withAuditLogging<T>(
	handler: (req: NextRequest) => Promise<NextResponse<T>>,
	options: {
		eventType?: AuditEventType
		action?: string
		phiAccessed?: boolean
		extractPatientId?: (req: NextRequest) => string | undefined
		extractResourceId?: (req: NextRequest) => string | undefined
	} = {}
): Promise<(req: NextRequest) => Promise<NextResponse<T>>> {
	return async (req: NextRequest): Promise<NextResponse<T>> => {
		const requestId = uuidv4()
		const startTime = Date.now()
		
		const session = await getServerSession(authOptions)
		const userId = session?.user?.id
		const sessionId = requestId

		const ipAddress = req.headers.get('x-forwarded-for') || 
			req.headers.get('x-real-ip') || 
			'unknown'
		const userAgent = req.headers.get('user-agent') || 'unknown'

		const pathname = new URL(req.url).pathname
		const auditConfig = Object.entries(AUDITED_PATHS).find(([path]) => 
			pathname.startsWith(path)
		)?.[1]

		const eventType = options.eventType || auditConfig?.eventType || 'patient_access'
		const action = options.action || auditConfig?.action || `${req.method} ${pathname}`
		const phiAccessed = options.phiAccessed ?? auditConfig?.phiAccessed ?? false

		const patientId = options.extractPatientId?.(req) || extractPatientIdFromUrl(pathname)
		const resourceId = options.extractResourceId?.(req) || extractResourceIdFromUrl(pathname)

		try {
			const response = await handler(req)
			const durationMs = Date.now() - startTime

			const success = response.status >= 200 && response.status < 400

			await AuditService.log(eventType, action, {
				userId,
				sessionId,
				patientId,
				resourceType: getResourceType(pathname),
				resourceId,
				details: {
					method: req.method,
					path: pathname,
					statusCode: response.status,
					requestId,
				},
				ipAddress,
				userAgent,
				success,
				durationMs,
				phiAccessed,
			})

			return response
		} catch (error) {
			const durationMs = Date.now() - startTime
			const errorMessage = error instanceof Error ? error.message : 'Unknown error'

			await AuditService.log(eventType, action, {
				userId,
				sessionId,
				patientId,
				resourceType: getResourceType(pathname),
				resourceId,
				details: {
					method: req.method,
					path: pathname,
					requestId,
					error: errorMessage,
				},
				ipAddress,
				userAgent,
				success: false,
				errorMessage,
				durationMs,
				phiAccessed,
				severity: 'error',
			})

			throw error
		}
	}
}

export async function auditAIRequest(
	userId: string,
	sessionId: string,
	patientId: string | undefined,
	aiDetails: {
		requestId: string
		model: string
		chiefComplaint?: string
		symptomCount?: number
	}
): Promise<string> {
	return AuditService.logAIInteraction('request', {
		userId,
		sessionId,
		patientId,
		aiDetails: {
			...aiDetails,
			medicationsRecommended: [],
			safetyAlertsTriggered: [],
		},
	})
}

export async function auditAIResponse(
	userId: string,
	sessionId: string,
	patientId: string | undefined,
	aiDetails: {
		requestId: string
		model: string
		promptTokens?: number
		completionTokens?: number
		totalTokens?: number
		ragSourceCount?: number
		medicationsRecommended: string[]
		safetyAlertsTriggered: string[]
		confidenceScore: number
	},
	success: boolean,
	durationMs: number,
	errorMessage?: string
): Promise<string> {
	return AuditService.logAIInteraction('response', {
		userId,
		sessionId,
		patientId,
		aiDetails,
		success,
		errorMessage,
		durationMs,
	})
}

export async function auditSafetyAlert(
	alertType: string,
	medication: string,
	options: {
		userId?: string
		patientId?: string
		sessionId?: string
		severity: 'warning' | 'critical'
		reason: string
		recommendation: string
	}
): Promise<string> {
	return AuditService.logSafetyAlert(alertType, {
		userId: options.userId,
		patientId: options.patientId,
		sessionId: options.sessionId,
		medication,
		severity: options.severity,
		details: {
			reason: options.reason,
			recommendation: options.recommendation,
		},
	})
}

function extractPatientIdFromUrl(pathname: string): string | undefined {
	const patientMatch = pathname.match(/\/patients\/([a-zA-Z0-9-]+)/)
	if (patientMatch) return patientMatch[1]

	const planMatch = pathname.match(/\/plans\/([a-zA-Z0-9-]+)/)
	return undefined
}

function extractResourceIdFromUrl(pathname: string): string | undefined {
	const match = pathname.match(/\/([a-zA-Z0-9-]+)(?:\/[a-zA-Z]+)?$/)
	if (match && match[1] !== 'patients' && match[1] !== 'plans' && match[1] !== 'api') {
		return match[1]
	}
	return undefined
}

function getResourceType(pathname: string): string {
	if (pathname.includes('/patients')) return 'patient'
	if (pathname.includes('/plans') || pathname.includes('/treatment-plans')) return 'treatment_plan'
	if (pathname.includes('/ai') || pathname.includes('/analyze')) return 'ai_analysis'
	if (pathname.includes('/knowledge')) return 'knowledge_base'
	return 'unknown'
}
