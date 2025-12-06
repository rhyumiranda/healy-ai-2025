import {
	patientDemographicsSchema,
	patientMedicalHistorySchema,
	patientMedicationsSchema,
	patientVitalsSchema,
	createPatientSchema,
	BLOOD_TYPES,
	GENDERS,
} from '@/src/modules/patients/utils/validation'

describe('Patient Validation Schemas', () => {
	describe('patientDemographicsSchema', () => {
		it('should validate valid demographics data', () => {
			const validData = {
				name: 'John Doe',
				dateOfBirth: '1990-01-15',
				gender: 'MALE',
			}
			const result = patientDemographicsSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should validate demographics with optional fields', () => {
			const validData = {
				name: 'Jane Smith',
				dateOfBirth: '1985-06-20',
				gender: 'FEMALE',
				weight: 65.5,
				height: 165,
				bloodType: 'A+',
			}
			const result = patientDemographicsSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should reject name shorter than 2 characters', () => {
			const invalidData = {
				name: 'J',
				dateOfBirth: '1990-01-15',
				gender: 'MALE',
			}
			const result = patientDemographicsSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(result.error.issues[0].path).toContain('name')
			}
		})

		it('should reject empty name', () => {
			const invalidData = {
				name: '',
				dateOfBirth: '1990-01-15',
				gender: 'MALE',
			}
			const result = patientDemographicsSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject future date of birth', () => {
			const futureDate = new Date()
			futureDate.setFullYear(futureDate.getFullYear() + 1)
			const invalidData = {
				name: 'John Doe',
				dateOfBirth: futureDate.toISOString().split('T')[0],
				gender: 'MALE',
			}
			const result = patientDemographicsSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(result.error.issues[0].path).toContain('dateOfBirth')
			}
		})

		it('should reject invalid gender', () => {
			const invalidData = {
				name: 'John Doe',
				dateOfBirth: '1990-01-15',
				gender: 'INVALID',
			}
			const result = patientDemographicsSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should accept all valid genders', () => {
			GENDERS.forEach((gender) => {
				const validData = {
					name: 'Test Patient',
					dateOfBirth: '1990-01-15',
					gender,
				}
				const result = patientDemographicsSchema.safeParse(validData)
				expect(result.success).toBe(true)
			})
		})

		it('should reject weight below minimum (0.5 kg)', () => {
			const invalidData = {
				name: 'John Doe',
				dateOfBirth: '1990-01-15',
				gender: 'MALE',
				weight: 0.3,
			}
			const result = patientDemographicsSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject weight above maximum (500 kg)', () => {
			const invalidData = {
				name: 'John Doe',
				dateOfBirth: '1990-01-15',
				gender: 'MALE',
				weight: 550,
			}
			const result = patientDemographicsSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject height below minimum (20 cm)', () => {
			const invalidData = {
				name: 'John Doe',
				dateOfBirth: '1990-01-15',
				gender: 'MALE',
				height: 15,
			}
			const result = patientDemographicsSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject height above maximum (300 cm)', () => {
			const invalidData = {
				name: 'John Doe',
				dateOfBirth: '1990-01-15',
				gender: 'MALE',
				height: 350,
			}
			const result = patientDemographicsSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should accept all valid blood types', () => {
			BLOOD_TYPES.forEach((bloodType) => {
				const validData = {
					name: 'Test Patient',
					dateOfBirth: '1990-01-15',
					gender: 'MALE',
					bloodType,
				}
				const result = patientDemographicsSchema.safeParse(validData)
				expect(result.success).toBe(true)
			})
		})

		it('should reject invalid blood type', () => {
			const invalidData = {
				name: 'John Doe',
				dateOfBirth: '1990-01-15',
				gender: 'MALE',
				bloodType: 'X+',
			}
			const result = patientDemographicsSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})
	})

	describe('patientMedicalHistorySchema', () => {
		it('should validate empty medical history', () => {
			const validData = {}
			const result = patientMedicalHistorySchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should validate medical history with text', () => {
			const validData = {
				medicalHistory: 'Previous surgery in 2020. Family history of diabetes.',
			}
			const result = patientMedicalHistorySchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should validate chronic conditions as array', () => {
			const validData = {
				chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
			}
			const result = patientMedicalHistorySchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should reject medical history exceeding 5000 characters', () => {
			const invalidData = {
				medicalHistory: 'a'.repeat(5001),
			}
			const result = patientMedicalHistorySchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should accept medical history at exactly 5000 characters', () => {
			const validData = {
				medicalHistory: 'a'.repeat(5000),
			}
			const result = patientMedicalHistorySchema.safeParse(validData)
			expect(result.success).toBe(true)
		})
	})

	describe('patientMedicationsSchema', () => {
		it('should validate empty medications and allergies', () => {
			const validData = {}
			const result = patientMedicationsSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should validate current medications as array', () => {
			const validData = {
				currentMedications: ['Metformin 500mg', 'Lisinopril 10mg'],
			}
			const result = patientMedicationsSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should validate allergies as array', () => {
			const validData = {
				allergies: ['Penicillin', 'Sulfa drugs', 'Shellfish'],
			}
			const result = patientMedicationsSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should validate both medications and allergies', () => {
			const validData = {
				currentMedications: ['Aspirin 81mg'],
				allergies: ['Codeine'],
			}
			const result = patientMedicationsSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})
	})

	describe('patientVitalsSchema', () => {
		it('should validate empty vitals', () => {
			const validData = {}
			const result = patientVitalsSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should validate complete vitals data', () => {
			const validData = {
				bloodPressureSystolic: 120,
				bloodPressureDiastolic: 80,
				heartRate: 72,
				temperature: 36.6,
				respiratoryRate: 16,
				oxygenSaturation: 98,
			}
			const result = patientVitalsSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should reject systolic BP below minimum (60)', () => {
			const invalidData = {
				bloodPressureSystolic: 50,
			}
			const result = patientVitalsSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject systolic BP above maximum (250)', () => {
			const invalidData = {
				bloodPressureSystolic: 260,
			}
			const result = patientVitalsSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject diastolic BP below minimum (40)', () => {
			const invalidData = {
				bloodPressureDiastolic: 30,
			}
			const result = patientVitalsSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject diastolic BP above maximum (150)', () => {
			const invalidData = {
				bloodPressureDiastolic: 160,
			}
			const result = patientVitalsSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject heart rate below minimum (30)', () => {
			const invalidData = {
				heartRate: 20,
			}
			const result = patientVitalsSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject heart rate above maximum (250)', () => {
			const invalidData = {
				heartRate: 260,
			}
			const result = patientVitalsSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject temperature below minimum (35°C)', () => {
			const invalidData = {
				temperature: 34,
			}
			const result = patientVitalsSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject temperature above maximum (42°C)', () => {
			const invalidData = {
				temperature: 43,
			}
			const result = patientVitalsSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject respiratory rate below minimum (8)', () => {
			const invalidData = {
				respiratoryRate: 5,
			}
			const result = patientVitalsSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject respiratory rate above maximum (40)', () => {
			const invalidData = {
				respiratoryRate: 45,
			}
			const result = patientVitalsSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject oxygen saturation below minimum (70%)', () => {
			const invalidData = {
				oxygenSaturation: 60,
			}
			const result = patientVitalsSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject oxygen saturation above maximum (100%)', () => {
			const invalidData = {
				oxygenSaturation: 105,
			}
			const result = patientVitalsSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should validate chief complaint', () => {
			const validData = {
				chiefComplaint: 'Persistent headache for 3 days',
			}
			const result = patientVitalsSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should reject chief complaint exceeding 500 characters', () => {
			const invalidData = {
				chiefComplaint: 'a'.repeat(501),
			}
			const result = patientVitalsSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should validate current symptoms as array', () => {
			const validData = {
				currentSymptoms: ['Headache', 'Nausea', 'Dizziness'],
			}
			const result = patientVitalsSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})
	})

	describe('createPatientSchema (combined)', () => {
		it('should validate complete patient data', () => {
			const validData = {
				name: 'John Doe',
				dateOfBirth: '1990-01-15',
				gender: 'MALE',
				weight: 75,
				height: 180,
				bloodType: 'O+',
				medicalHistory: 'No significant history',
				chronicConditions: ['Hypertension'],
				currentMedications: ['Lisinopril 10mg'],
				allergies: ['Penicillin'],
				bloodPressureSystolic: 130,
				bloodPressureDiastolic: 85,
				heartRate: 78,
				temperature: 36.8,
				respiratoryRate: 18,
				oxygenSaturation: 97,
				chiefComplaint: 'Routine checkup',
				currentSymptoms: [],
			}
			const result = createPatientSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should validate minimal required data', () => {
			const validData = {
				name: 'Jane Doe',
				dateOfBirth: '1985-06-20',
				gender: 'FEMALE',
			}
			const result = createPatientSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should reject missing required fields', () => {
			const invalidData = {
				name: 'John Doe',
			}
			const result = createPatientSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})
	})
})
