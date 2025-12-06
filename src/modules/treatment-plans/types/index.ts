import type { PlanStatus, RiskLevel, Gender } from '@/lib/generated/prisma'

export type { PlanStatus, RiskLevel }

export interface VitalSigns {
	bloodPressureSystolic?: number
	bloodPressureDiastolic?: number
	heartRate?: number
	temperature?: number
	respiratoryRate?: number
	oxygenSaturation?: number
}

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

export interface DrugInteraction {
	medication1: string
	medication2: string
	severity: 'Mild' | 'Moderate' | 'Severe'
	description: string
	recommendation: string
}

export interface Contraindication {
	medication: string
	reason: string
	severity: 'Absolute' | 'Relative'
}

export interface AlternativePlan {
	medications: Medication[]
	rationale: string
	riskLevel: RiskLevel
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
