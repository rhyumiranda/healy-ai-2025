export type SeverityLevel = 'CRITICAL' | 'URGENT' | 'HIGH_RISK' | 'STANDARD'

export type ValidationSource = 'FDA' | 'INTERACTION' | 'GUIDELINE' | 'PUBMED' | 'RAG'

export interface VitalSignThresholds {
	systolicBpMin?: number
	systolicBpMax?: number
	diastolicBpMin?: number
	diastolicBpMax?: number
	heartRateMin?: number
	heartRateMax?: number
	temperatureMax?: number
	respiratoryRateMin?: number
	respiratoryRateMax?: number
	oxygenSaturationMin?: number
}

export interface SeverityTrigger {
	type: 'keyword' | 'vital_sign' | 'condition'
	value: string
	severity: SeverityLevel
}

export interface SeverityAssessment {
	isSevere: boolean
	severityLevel: SeverityLevel
	triggers: SeverityTrigger[]
	requiredValidations: ValidationSource[]
	autoEscalate: boolean
	confidenceModifier: number
}

export interface ValidationSourceResult {
	source: ValidationSource
	isApproved: boolean
	reason?: string
	confidence: number
	data?: unknown
}

export interface CascadeValidationResult {
	isApproved: boolean
	blockedBy?: ValidationSource
	blockReason?: string
	warnings: string[]
	confidenceModifier: number
	sources: ValidationSourceResult[]
	requiresManualReview: boolean
}

export interface GroundingClaim {
	claim: string
	medicationName?: string
	dosage?: string
	frequency?: string
	isGrounded: boolean
	groundingSources: string[]
	contradictions: string[]
}

export interface GroundingVerificationResult {
	isFullyGrounded: boolean
	groundedClaimsCount: number
	ungroundedClaimsCount: number
	contradictionsFound: number
	claims: GroundingClaim[]
	overallConfidenceModifier: number
	warnings: string[]
}

export interface SevereConditionRecord {
	id: string
	conditionName: string
	keywords: string[]
	vitalThresholds: VitalSignThresholds
	riskCategory: SeverityLevel
	requiredValidations: ValidationSource[]
	autoEscalate: boolean
}
