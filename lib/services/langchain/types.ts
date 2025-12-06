import type { AIAnalysisRequest, AIAnalysisResponse } from '@/src/modules/treatment-plans'
import type { RAGContext } from '../rag/types'
import type { SeverityAssessment } from '../safety/types'

export type AgentRole =
	| 'orchestrator'
	| 'clinical_reasoner'
	| 'drug_validator'
	| 'safety_checker'
	| 'evidence_retriever'

export interface AgentContext {
	sessionId: string
	patientData: PatientContext
	currentStep: AgentStep
	previousSteps: AgentStep[]
	ragContext?: RAGContext
	severityAssessment?: SeverityAssessment
	accumulatedEvidence: AccumulatedEvidence
}

export interface PatientContext {
	patientId?: string
	age: number
	gender: string
	allergies: string[]
	chronicConditions: string[]
	currentMedications: string[]
	chiefComplaint: string
	currentSymptoms: string[]
	vitalSigns?: VitalSigns
	additionalNotes?: string
}

export interface VitalSigns {
	bloodPressureSystolic?: number
	bloodPressureDiastolic?: number
	heartRate?: number
	temperature?: number
	respiratoryRate?: number
	oxygenSaturation?: number
}

export interface AgentStep {
	stepId: string
	agentRole: AgentRole
	action: string
	input: Record<string, unknown>
	output?: Record<string, unknown>
	reasoning?: string
	timestamp: string
	durationMs?: number
	toolsUsed: string[]
	error?: string
}

export interface AccumulatedEvidence {
	clinicalGuidelines: ClinicalGuidelineEvidence[]
	drugInformation: DrugInformationEvidence[]
	interactions: InteractionEvidence[]
	contraindications: ContraindicationEvidence[]
	pubmedReferences: PubMedReferenceEvidence[]
}

export interface ClinicalGuidelineEvidence {
	guidelineId: string
	title: string
	relevantSection: string
	recommendation: string
	evidenceLevel: 'A' | 'B' | 'C' | 'D'
	source: string
}

export interface DrugInformationEvidence {
	drugName: string
	genericName?: string
	rxcui?: string
	fdaValidated: boolean
	dosageInfo?: string
	contraindications: string[]
	warnings: string[]
	source: 'OpenFDA' | 'RxNorm' | 'DailyMed'
}

export interface InteractionEvidence {
	drug1: string
	drug2: string
	severity: 'Minor' | 'Moderate' | 'Major' | 'Contraindicated'
	description: string
	recommendation: string
	source: string
}

export interface ContraindicationEvidence {
	medication: string
	condition: string
	severity: 'Absolute' | 'Relative'
	reason: string
	source: string
}

export interface PubMedReferenceEvidence {
	pmid: string
	title: string
	abstract: string
	publicationType: string
	relevanceScore: number
}

export interface OrchestratorDecision {
	nextAgent: AgentRole
	action: string
	reasoning: string
	priority: 'high' | 'medium' | 'low'
	requiredTools: string[]
}

export interface AgentToolResult {
	success: boolean
	data?: Record<string, unknown>
	error?: string
	source?: string
	confidence?: number
}

export interface ClinicalReasoningResult {
	suggestedDiagnoses: DiagnosisSuggestion[]
	treatmentApproach: string
	medications: MedicationRecommendation[]
	nonPharmacologicalRecommendations: string[]
	followUpRecommendations: string[]
	warnings: string[]
	reasoning: string
}

export interface DiagnosisSuggestion {
	diagnosis: string
	confidence: number
	supportingEvidence: string[]
	differentialDiagnoses: string[]
}

export interface MedicationRecommendation {
	name: string
	genericName: string
	dosage: string
	frequency: string
	duration: string
	route: string
	instructions: string
	rationale: string
	confidenceScore: number
	evidenceLevel?: 'A' | 'B' | 'C' | 'D'
	requiresValidation: boolean
}

export interface SafetyCheckResult {
	isApproved: boolean
	riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
	issues: SafetyIssue[]
	blockedMedications: string[]
	warnings: string[]
	recommendations: string[]
}

export interface SafetyIssue {
	type: 'allergy' | 'interaction' | 'contraindication' | 'dosage' | 'age_related' | 'condition_related'
	severity: 'warning' | 'caution' | 'blocked'
	medication: string
	description: string
	recommendation: string
}

export interface AgentExecutionResult {
	success: boolean
	response?: AIAnalysisResponse
	context: AgentContext
	executionSummary: ExecutionSummary
	error?: string
}

export interface ExecutionSummary {
	totalSteps: number
	totalDurationMs: number
	agentsInvoked: AgentRole[]
	toolsUsed: string[]
	evidenceSourcesUsed: number
	safetyChecksPerformed: number
	wasEscalated: boolean
	escalationReason?: string
}

export interface AgentPromptConfig {
	systemPrompt: string
	temperature: number
	maxTokens: number
	responseFormat?: 'json' | 'text'
}

export type ToolName =
	| 'fda_drug_lookup'
	| 'rxnorm_validation'
	| 'pubmed_search'
	| 'vector_store_retrieval'
	| 'drug_interaction_check'
	| 'severity_assessment'
	| 'guideline_search'
