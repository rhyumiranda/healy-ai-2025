import { z } from 'zod'

export const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const
export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const

export const genderSchema = z.enum(GENDERS)
export const bloodTypeSchema = z.enum(BLOOD_TYPES)

const isNotFutureDate = (dateString: string): boolean => {
	const date = new Date(dateString)
	const today = new Date()
	today.setHours(23, 59, 59, 999)
	return date <= today
}

const isReasonableAge = (dateString: string): boolean => {
	const date = new Date(dateString)
	const today = new Date()
	const age = today.getFullYear() - date.getFullYear()
	return age <= 150
}

export const patientDemographicsSchema = z.object({
	name: z
		.string()
		.min(2, 'Name must be at least 2 characters')
		.max(100, 'Name must be less than 100 characters'),
	dateOfBirth: z
		.string()
		.min(1, 'Date of birth is required')
		.refine(isNotFutureDate, 'Date of birth cannot be in the future')
		.refine(isReasonableAge, 'Please enter a valid date of birth'),
	gender: genderSchema,
	weight: z
		.number()
		.min(0.5, 'Weight must be at least 0.5 kg')
		.max(500, 'Weight must be less than 500 kg')
		.optional(),
	height: z
		.number()
		.min(20, 'Height must be at least 20 cm')
		.max(300, 'Height must be less than 300 cm')
		.optional(),
	bloodType: bloodTypeSchema.optional(),
})

export const patientMedicalHistorySchema = z.object({
	medicalHistory: z
		.string()
		.max(5000, 'Medical history must be less than 5000 characters')
		.optional(),
	chronicConditions: z.array(z.string()).optional(),
})

export const patientMedicationsSchema = z.object({
	currentMedications: z.array(z.string()).optional(),
	allergies: z.array(z.string()).optional(),
})

export const patientVitalsSchema = z.object({
	bloodPressureSystolic: z
		.number()
		.min(60, 'Systolic BP must be at least 60 mmHg')
		.max(250, 'Systolic BP must be less than 250 mmHg')
		.optional(),
	bloodPressureDiastolic: z
		.number()
		.min(40, 'Diastolic BP must be at least 40 mmHg')
		.max(150, 'Diastolic BP must be less than 150 mmHg')
		.optional(),
	heartRate: z
		.number()
		.min(30, 'Heart rate must be at least 30 bpm')
		.max(250, 'Heart rate must be less than 250 bpm')
		.optional(),
	temperature: z
		.number()
		.min(35, 'Temperature must be at least 35°C')
		.max(42, 'Temperature must be less than 42°C')
		.optional(),
	respiratoryRate: z
		.number()
		.min(8, 'Respiratory rate must be at least 8/min')
		.max(40, 'Respiratory rate must be less than 40/min')
		.optional(),
	oxygenSaturation: z
		.number()
		.min(70, 'Oxygen saturation must be at least 70%')
		.max(100, 'Oxygen saturation cannot exceed 100%')
		.optional(),
	chiefComplaint: z
		.string()
		.max(500, 'Chief complaint must be less than 500 characters')
		.optional(),
	currentSymptoms: z.array(z.string()).optional(),
})

export const createPatientSchema = patientDemographicsSchema
	.merge(patientMedicalHistorySchema)
	.merge(patientMedicationsSchema)
	.merge(patientVitalsSchema)

export type PatientDemographics = z.infer<typeof patientDemographicsSchema>
export type PatientMedicalHistory = z.infer<typeof patientMedicalHistorySchema>
export type PatientMedications = z.infer<typeof patientMedicationsSchema>
export type PatientVitals = z.infer<typeof patientVitalsSchema>
export type CreatePatientData = z.infer<typeof createPatientSchema>
