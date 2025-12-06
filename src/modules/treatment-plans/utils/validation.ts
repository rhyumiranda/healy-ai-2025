import { z } from 'zod'

export const SEVERITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH'] as const
export const SYMPTOM_DURATIONS = ['days', 'weeks', 'months', 'years'] as const

export const severityLevelSchema = z.enum(SEVERITY_LEVELS)
export const symptomDurationSchema = z.enum(SYMPTOM_DURATIONS)

export const selectPatientSchema = z.object({
	patientId: z.string().min(1, 'Please select a patient'),
})

export const vitalSignsSchema = z.object({
	bloodPressureSystolic: z.number().min(60).max(250).optional(),
	bloodPressureDiastolic: z.number().min(40).max(150).optional(),
	heartRate: z.number().min(30).max(250).optional(),
	temperature: z.number().min(35).max(42).optional(),
	respiratoryRate: z.number().min(8).max(40).optional(),
	oxygenSaturation: z.number().min(70).max(100).optional(),
	weight: z.number().min(0.5).max(500).optional(),
	height: z.number().min(20).max(300).optional(),
})

export const labResultsManualSchema = z.object({
	glucose: z.number().min(0).max(1000).optional(),
	cholesterol: z.number().min(0).max(500).optional(),
	hemoglobin: z.number().min(0).max(25).optional(),
	whiteBloodCells: z.number().min(0).max(100000).optional(),
	platelets: z.number().min(0).max(1000000).optional(),
	creatinine: z.number().min(0).max(30).optional(),
	alt: z.number().min(0).max(5000).optional(),
	ast: z.number().min(0).max(5000).optional(),
	otherResults: z.string().max(2000).optional(),
})

export const labResultsFileSchema = z.object({
	fileName: z.string().min(1),
	fileType: z.string().min(1),
	fileSize: z.number().min(1).max(10000000),
	uploadedAt: z.string(),
	fileUrl: z.string().optional(),
})

export const labResultsSchema = z.object({
	inputMode: z.enum(['manual', 'file']),
	manual: labResultsManualSchema.optional(),
	file: labResultsFileSchema.optional(),
})

export const intakeSchema = z.object({
	chiefComplaint: z
		.string()
		.min(10, 'Chief complaint must be at least 10 characters')
		.max(1000, 'Chief complaint must be less than 1000 characters'),
	currentSymptoms: z
		.array(z.string())
		.min(1, 'At least one symptom is required'),
	symptomDuration: symptomDurationSchema.optional(),
	symptomDurationValue: z.number().min(1).max(365).optional(),
	severityLevel: severityLevelSchema.optional(),
	currentMedications: z.array(z.string()).optional(),
	vitalSigns: vitalSignsSchema.optional(),
	labResults: labResultsSchema.optional(),
	additionalNotes: z.string().max(5000).optional(),
})

export const medicationSchema = z.object({
	name: z.string().min(1, 'Medication name is required'),
	genericName: z.string().optional(),
	dosage: z.string().min(1, 'Dosage is required'),
	frequency: z.string().min(1, 'Frequency is required'),
	duration: z.string().min(1, 'Duration is required'),
	route: z.string().min(1, 'Route is required'),
	instructions: z.string().optional(),
	confidenceScore: z.number().min(0).max(100).optional(),
})

export const finalPlanSchema = z.object({
	medications: z.array(medicationSchema),
	notes: z.string().max(5000).optional(),
	approvedBy: z.string().optional(),
})

export const reviewSchema = z.object({
	finalPlan: finalPlanSchema.optional(),
	doctorNotes: z.string().max(5000).optional(),
	wasModified: z.boolean().optional(),
})

export type SelectPatientData = z.infer<typeof selectPatientSchema>
export type IntakeData = z.infer<typeof intakeSchema>
export type ReviewData = z.infer<typeof reviewSchema>
export type MedicationData = z.infer<typeof medicationSchema>
export type FinalPlanData = z.infer<typeof finalPlanSchema>
