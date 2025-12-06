import {
	selectPatientSchema,
	intakeSchema,
	reviewSchema,
	SEVERITY_LEVELS,
	SYMPTOM_DURATIONS,
} from '@/src/modules/treatment-plans/utils/validation'

describe('Treatment Plan Wizard Validation Schemas', () => {
	describe('selectPatientSchema (Step 1)', () => {
		it('should validate when patientId is provided', () => {
			const validData = { patientId: 'patient-123' }
			const result = selectPatientSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should reject empty patientId', () => {
			const invalidData = { patientId: '' }
			const result = selectPatientSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject missing patientId', () => {
			const invalidData = {}
			const result = selectPatientSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})
	})

	describe('intakeSchema (Step 2)', () => {
		it('should validate with required fields only', () => {
			const validData = {
				chiefComplaint: 'Persistent headache for 3 days',
				currentSymptoms: ['headache', 'nausea'],
			}
			const result = intakeSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should validate with all fields', () => {
			const validData = {
				chiefComplaint: 'Persistent headache for 3 days',
				currentSymptoms: ['headache', 'nausea', 'dizziness'],
				symptomDuration: 'days',
				symptomDurationValue: 3,
				severityLevel: 'MEDIUM',
				currentMedications: ['Aspirin 81mg'],
				vitalSigns: {
					bloodPressureSystolic: 120,
					bloodPressureDiastolic: 80,
					heartRate: 72,
				},
				additionalNotes: 'Patient reports stress at work',
			}
			const result = intakeSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should reject empty chief complaint', () => {
			const invalidData = {
				chiefComplaint: '',
				currentSymptoms: ['headache'],
			}
			const result = intakeSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject chief complaint shorter than 10 characters', () => {
			const invalidData = {
				chiefComplaint: 'Headache',
				currentSymptoms: ['headache'],
			}
			const result = intakeSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject empty symptoms array', () => {
			const invalidData = {
				chiefComplaint: 'Persistent headache for 3 days',
				currentSymptoms: [],
			}
			const result = intakeSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should accept all valid severity levels', () => {
			SEVERITY_LEVELS.forEach((level) => {
				const validData = {
					chiefComplaint: 'Persistent headache for 3 days',
					currentSymptoms: ['headache'],
					severityLevel: level,
				}
				const result = intakeSchema.safeParse(validData)
				expect(result.success).toBe(true)
			})
		})

		it('should reject invalid severity level', () => {
			const invalidData = {
				chiefComplaint: 'Persistent headache for 3 days',
				currentSymptoms: ['headache'],
				severityLevel: 'CRITICAL',
			}
			const result = intakeSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should accept all valid symptom durations', () => {
			SYMPTOM_DURATIONS.forEach((duration) => {
				const validData = {
					chiefComplaint: 'Persistent headache for 3 days',
					currentSymptoms: ['headache'],
					symptomDuration: duration,
				}
				const result = intakeSchema.safeParse(validData)
				expect(result.success).toBe(true)
			})
		})

		it('should validate vital signs within range', () => {
			const validData = {
				chiefComplaint: 'Persistent headache for 3 days',
				currentSymptoms: ['headache'],
				vitalSigns: {
					bloodPressureSystolic: 120,
					bloodPressureDiastolic: 80,
					heartRate: 72,
					temperature: 36.6,
					respiratoryRate: 16,
					oxygenSaturation: 98,
				},
			}
			const result = intakeSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should reject systolic BP out of range', () => {
			const invalidData = {
				chiefComplaint: 'Persistent headache for 3 days',
				currentSymptoms: ['headache'],
				vitalSigns: {
					bloodPressureSystolic: 300,
				},
			}
			const result = intakeSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject heart rate out of range', () => {
			const invalidData = {
				chiefComplaint: 'Persistent headache for 3 days',
				currentSymptoms: ['headache'],
				vitalSigns: {
					heartRate: 500,
				},
			}
			const result = intakeSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should validate lab results in manual mode', () => {
			const validData = {
				chiefComplaint: 'Persistent headache for 3 days',
				currentSymptoms: ['headache'],
				labResults: {
					inputMode: 'manual',
					manual: {
						glucose: 100,
						cholesterol: 180,
					},
				},
			}
			const result = intakeSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should validate lab results in file mode', () => {
			const validData = {
				chiefComplaint: 'Persistent headache for 3 days',
				currentSymptoms: ['headache'],
				labResults: {
					inputMode: 'file',
					file: {
						fileName: 'lab-results.pdf',
						fileType: 'application/pdf',
						fileSize: 1024000,
						uploadedAt: new Date().toISOString(),
					},
				},
			}
			const result = intakeSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})
	})

	describe('reviewSchema (Step 4)', () => {
		it('should validate with minimal data', () => {
			const validData = {}
			const result = reviewSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should validate with doctor notes', () => {
			const validData = {
				doctorNotes: 'Patient responded well to initial treatment',
			}
			const result = reviewSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should validate with final plan modifications', () => {
			const validData = {
				finalPlan: {
					medications: [
						{
							name: 'Ibuprofen',
							dosage: '400mg',
							frequency: 'twice daily',
							duration: '7 days',
							route: 'oral',
						},
					],
					notes: 'Adjusted dosage based on patient weight',
				},
				doctorNotes: 'Modified AI recommendation',
				wasModified: true,
			}
			const result = reviewSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should reject doctor notes exceeding max length', () => {
			const invalidData = {
				doctorNotes: 'a'.repeat(5001),
			}
			const result = reviewSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should validate medication structure in final plan', () => {
			const validData = {
				finalPlan: {
					medications: [
						{
							name: 'Metformin',
							dosage: '500mg',
							frequency: 'twice daily',
							duration: '30 days',
							route: 'oral',
							instructions: 'Take with meals',
						},
					],
				},
			}
			const result = reviewSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})
	})
})
