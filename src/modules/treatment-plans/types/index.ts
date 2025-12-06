import type { PlanStatus, RiskLevel, Gender } from '@/lib/generated/prisma'

export type { PlanStatus, RiskLevel }

// ============================================
// Base Types
// ============================================

export interface VitalSigns {
	bloodPressureSystolic?: number
	bloodPressureDiastolic?: number
	heartRate?: number
	temperature?: number
	respiratoryRate?: number
	oxygenSaturation?: number
}

// ============================================
// Evidence & References
// ============================================

export type EvidenceLevel = 'A' | 'B' | 'C' | 'D'

export interface ClinicalReference {
	pmid: string
	title: string
	authors: string[]
	journal: string
	year: number
	abstract?: string
	doi?: string
	url: string
	relevanceScore: number
	publicationType: string[]
}

export interface ConfidenceBreakdown {
	drugValidation: number
	safetyScore: number
	evidenceScore: number
	patientFactors: number
	aiBaseScore: number
}

export interface ConfidenceResult {
	overallScore: number
	grade: 'HIGH' | 'MODERATE' | 'LOW' | 'INSUFFICIENT'
	breakdown: ConfidenceBreakdown
	warnings: string[]
	recommendations: string[]
}

// ============================================
// Medication Types
// ============================================

export interface Medication {
	name: string
	genericName?: string
	dosage: string
	frequency: string
	duration: string
	route: string
	instructions?: string
	confidenceScore?: number
}

export interface MedicationWithEvidence extends Medication {
	rxcui?: string
	ndcCode?: string
	evidenceLevel: EvidenceLevel
	references: ClinicalReference[]
	fdaValidated: boolean
	ageAdjustedDosage?: boolean
	renalAdjustment?: string
	hepaticAdjustment?: string
	confidenceDetails?: ConfidenceResult
	rationale?: string
}

// ============================================
// Drug Safety Types
// ============================================

export interface DrugInteraction {
	medication1: string
	medication2: string
	severity: 'Mild' | 'Moderate' | 'Severe'
	description: string
	recommendation: string
	source?: 'OpenFDA' | 'RxNorm' | 'Clinical'
	pmid?: string
}

export interface Contraindication {
	medication: string
	reason: string
	severity: 'Absolute' | 'Relative'
	patientCondition?: string
}

// ============================================
// Treatment Plan Types
// ============================================

export interface AlternativePlan {
	medications: Medication[]
	rationale: string
	riskLevel: RiskLevel
	confidenceScore?: number
}

export interface AIRecommendations {
	medications: Medication[]
	rationale: string
	recommendations: string[]
}

export interface FinalPlan {
	medications: Medication[]
	notes?: string
	approvedBy?: string
}

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export interface PatientSummary {
	id: string
	name: string
	dateOfBirth: string
	gender: Gender
	allergies: string[]
	chronicConditions: string[]
}

export interface TreatmentPlan {
	id: string
	patientId: string
	patient: PatientSummary
	doctorId: string
	chiefComplaint: string
	currentSymptoms: string
	vitalSigns?: VitalSigns
	physicalExamNotes?: string
	aiRecommendations?: AIRecommendations
	finalPlan?: FinalPlan
	riskLevel: RiskLevel | null
	riskFactors: string[]
	riskJustification?: string
	drugInteractions: DrugInteraction[]
	contraindications: Contraindication[]
	alternatives: AlternativePlan[]
	status: PlanStatus
	wasModified: boolean
	modificationNotes?: string
	createdAt: string
	updatedAt: string
	approvedAt?: string
}

export interface TreatmentPlanListItem {
	id: string
	patientId: string
	patient: {
		id: string
		name: string
	}
	chiefComplaint: string
	status: PlanStatus
	riskLevel: RiskLevel | null
	createdAt: string
	updatedAt: string
}

export interface TreatmentPlansResponse {
	plans: TreatmentPlanListItem[]
	total: number
	page: number
	pageSize: number
	totalPages: number
}

export interface TreatmentPlanFilters {
	search?: string
	status?: PlanStatus | 'ALL'
	riskLevel?: RiskLevel | 'ALL'
	patientId?: string
	dateFrom?: string
	dateTo?: string
	sortBy?: 'createdAt' | 'updatedAt' | 'patientName' | 'status'
	sortOrder?: 'asc' | 'desc'
	page?: number
	pageSize?: number
}

export interface CreateTreatmentPlanInput {
	patientId: string
	chiefComplaint: string
	currentSymptoms: string
	vitalSigns?: VitalSigns
	physicalExamNotes?: string
}

export interface UpdateTreatmentPlanInput {
	chiefComplaint?: string
	currentSymptoms?: string
	vitalSigns?: VitalSigns
	physicalExamNotes?: string
	finalPlan?: FinalPlan
	status?: PlanStatus
	modificationNotes?: string
}

// ============================================
// Wizard Types
// ============================================

export type TreatmentWizardStep = 1 | 2 | 3 | 4

export type SymptomDuration = 'days' | 'weeks' | 'months' | 'years'

export interface LabResultsManual {
	glucose?: number
	cholesterol?: number
	hemoglobin?: number
	whiteBloodCells?: number
	platelets?: number
	creatinine?: number
	alt?: number
	ast?: number
	otherResults?: string
}

export interface LabResultsFile {
	fileName: string
	fileType: string
	fileSize: number
	uploadedAt: string
	fileUrl?: string
}

export interface LabResults {
	inputMode: 'manual' | 'file'
	manual?: LabResultsManual
	file?: LabResultsFile
}

export interface TreatmentPlanWizardData {
	patientId: string
	selectedPatient?: PatientSummary
	chiefComplaint: string
	currentSymptoms: string[]
	symptomDuration?: SymptomDuration
	symptomDurationValue?: number
	severityLevel?: SeverityLevel
	currentMedications: string[]
	vitalSigns?: VitalSigns
	labResults?: LabResults
	additionalNotes?: string
	aiAnalysis?: AIAnalysisResponse
	finalPlan?: FinalPlan
	doctorNotes?: string
	wasModified: boolean
}

// ============================================
// AI Analysis Types
// ============================================

export interface AIAnalysisRequest {
	patient: PatientSummary
	chiefComplaint: string
	currentSymptoms: string[]
	currentMedications: string[]
	vitalSigns?: VitalSigns
	labResults?: LabResults
	additionalNotes?: string
}

export interface AIAnalysisResponse {
	medications: Medication[]
	riskLevel: RiskLevel
	riskFactors: string[]
	riskJustification: string
	drugInteractions: DrugInteraction[]
	contraindications: Contraindication[]
	alternatives: AlternativePlan[]
	rationale: string
	confidenceScore: number
	generatedAt: string
}

export interface EnhancedAIAnalysisResponse extends Omit<AIAnalysisResponse, 'medications'> {
	medications: MedicationWithEvidence[]
	overallConfidence: ConfidenceResult
	disclaimer: string
	generationMetadata: {
		model: string
		temperature: number
		validationSources: string[]
		generatedAt: string
	}
}

// ============================================
// Wizard Configuration
// ============================================

export interface WizardStepConfig {
	id: TreatmentWizardStep
	title: string
	description: string
}

export const WIZARD_STEPS: WizardStepConfig[] = [
	{ id: 1, title: 'Select Patient', description: 'Choose a patient' },
	{ id: 2, title: 'Clinical Intake', description: 'Document symptoms' },
	{ id: 3, title: 'AI Analysis', description: 'Review recommendations' },
	{ id: 4, title: 'Review & Approve', description: 'Finalize plan' },
]

// ============================================
// Evidence Level Helpers
// ============================================

export const EVIDENCE_LEVEL_LABELS: Record<EvidenceLevel, string> = {
	A: 'Systematic Review / Meta-Analysis',
	B: 'Randomized Controlled Trial',
	C: 'Cohort / Case-Control Study',
	D: 'Expert Opinion / Case Report',
}

export const EVIDENCE_LEVEL_COLORS: Record<EvidenceLevel, string> = {
	A: 'green',
	B: 'blue',
	C: 'yellow',
	D: 'gray',
}

export const CONFIDENCE_GRADE_LABELS: Record<ConfidenceResult['grade'], string> = {
	HIGH: 'High Confidence',
	MODERATE: 'Moderate Confidence',
	LOW: 'Low Confidence',
	INSUFFICIENT: 'Insufficient Data',
}

export const CONFIDENCE_GRADE_COLORS: Record<ConfidenceResult['grade'], string> = {
	HIGH: 'green',
	MODERATE: 'yellow',
	LOW: 'orange',
	INSUFFICIENT: 'red',
}
