import type { Gender, PlanStatus, RiskLevel } from '@/lib/generated/prisma'

export type { Gender, PlanStatus, RiskLevel }

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'

export interface PatientDemographicsData {
	name: string
	dateOfBirth: string
	gender: Gender
	weight?: number
	height?: number
	bloodType?: BloodType
}

export interface PatientMedicalHistoryData {
	medicalHistory?: string
	chronicConditions?: string[]
}

export interface PatientMedicationsData {
	currentMedications?: string[]
	allergies?: string[]
}

export interface PatientWizardData
	extends PatientDemographicsData,
		PatientMedicalHistoryData,
		PatientMedicationsData {}

export type WizardStep = 1 | 2 | 3 | 4

export interface WizardStepConfig {
	id: WizardStep
	title: string
	description: string
}

export interface Patient {
	id: string
	doctorId: string
	name: string
	dateOfBirth: Date | string
	gender: Gender
	weight: number | null
	height: number | null
	bloodType: string | null
	medicalHistory: string | null
	currentMedications: string[]
	allergies: string[]
	chronicConditions: string[]
	createdAt: Date | string
	updatedAt: Date | string
	_count?: {
		treatmentPlans: number
	}
}

export interface PatientWithPlans extends Patient {
	treatmentPlans: TreatmentPlanSummary[]
}

export interface TreatmentPlanSummary {
	id: string
	chiefComplaint: string
	status: PlanStatus
	riskLevel: RiskLevel | null
	createdAt: Date | string
	updatedAt: Date | string
}

export interface CreatePatientInput {
	name: string
	dateOfBirth: string
	gender: Gender
	weight?: number
	height?: number
	bloodType?: BloodType
	medicalHistory?: string
	currentMedications?: string[]
	allergies?: string[]
	chronicConditions?: string[]
}

export interface UpdatePatientInput extends Partial<CreatePatientInput> {}

export interface PatientsResponse {
	patients: Patient[]
	total: number
	page: number
	pageSize: number
	totalPages: number
}

export interface PatientFilters {
	search?: string
	gender?: Gender
	sortBy?: 'name' | 'createdAt' | 'updatedAt'
	sortOrder?: 'asc' | 'desc'
	page?: number
	pageSize?: number
}
