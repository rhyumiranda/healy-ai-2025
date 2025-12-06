import { renderHook, act } from '@testing-library/react'
import { useTreatmentPlanWizard } from '@/src/modules/treatment-plans/hooks/use-treatment-plan-wizard'

const mockPatient = {
	id: 'patient-123',
	name: 'John Doe',
	dateOfBirth: '1990-01-15',
	gender: 'MALE' as const,
	allergies: ['Penicillin'],
	chronicConditions: ['Hypertension'],
}

jest.mock('@/lib/services/openai.service', () => ({
	OpenAIService: {
		analyzeTreatment: jest.fn().mockResolvedValue({
			medications: [{ name: 'Test Med', dosage: '10mg', frequency: 'daily', duration: '7 days', route: 'oral' }],
			riskLevel: 'LOW',
			riskFactors: [],
			riskJustification: 'Low risk',
			drugInteractions: [],
			contraindications: [],
			alternatives: [],
			rationale: 'Test rationale',
			confidenceScore: 90,
			generatedAt: new Date().toISOString(),
		}),
	},
}))

jest.mock('@/src/modules/treatment-plans/hooks/use-treatment-plan-mutations', () => ({
	useCreateTreatmentPlan: () => ({
		createTreatmentPlan: jest.fn().mockResolvedValue({ id: 'plan-123' }),
		isLoading: false,
		error: null,
	}),
}))

describe('useTreatmentPlanWizard', () => {
	describe('initialization', () => {
		it('should initialize with step 1', () => {
			const { result } = renderHook(() => useTreatmentPlanWizard())
			expect(result.current.currentStep).toBe(1)
		})

		it('should initialize with empty form data', () => {
			const { result } = renderHook(() => useTreatmentPlanWizard())
			expect(result.current.formData.patientId).toBe('')
			expect(result.current.formData.chiefComplaint).toBe('')
			expect(result.current.formData.currentSymptoms).toEqual([])
		})

		it('should have 4 total steps', () => {
			const { result } = renderHook(() => useTreatmentPlanWizard())
			expect(result.current.totalSteps).toBe(4)
		})
	})

	describe('step navigation', () => {
		it('should move to next step when valid', () => {
			const { result } = renderHook(() => useTreatmentPlanWizard())

			act(() => {
				result.current.updateFormData({ patientId: 'patient-123' })
			})

			act(() => {
				result.current.nextStep()
			})

			expect(result.current.currentStep).toBe(2)
		})

		it('should move to previous step', () => {
			const { result } = renderHook(() => useTreatmentPlanWizard())

			act(() => {
				result.current.updateFormData({ patientId: 'patient-123' })
			})

			act(() => {
				result.current.nextStep()
			})

			act(() => {
				result.current.prevStep()
			})

			expect(result.current.currentStep).toBe(1)
		})

		it('should not go below step 1', () => {
			const { result } = renderHook(() => useTreatmentPlanWizard())

			act(() => {
				result.current.prevStep()
			})

			expect(result.current.currentStep).toBe(1)
		})

		it('should not exceed step 4', () => {
			const { result } = renderHook(() => useTreatmentPlanWizard())

			act(() => {
				result.current.updateFormData({ patientId: 'patient-123' })
			})

			for (let i = 0; i < 10; i++) {
				act(() => {
					result.current.nextStep()
				})
			}

			expect(result.current.currentStep).toBeLessThanOrEqual(4)
		})

		it('should allow jumping to a specific step', () => {
			const { result } = renderHook(() => useTreatmentPlanWizard())

			act(() => {
				result.current.goToStep(3)
			})

			expect(result.current.currentStep).toBe(3)
		})
	})

	describe('form data management', () => {
		it('should update form data correctly', () => {
			const { result } = renderHook(() => useTreatmentPlanWizard())

			act(() => {
				result.current.updateFormData({
					patientId: 'patient-456',
					chiefComplaint: 'Severe headache',
				})
			})

			expect(result.current.formData.patientId).toBe('patient-456')
			expect(result.current.formData.chiefComplaint).toBe('Severe headache')
		})

		it('should merge new data with existing data', () => {
			const { result } = renderHook(() => useTreatmentPlanWizard())

			act(() => {
				result.current.updateFormData({ patientId: 'patient-123' })
			})

			act(() => {
				result.current.updateFormData({ chiefComplaint: 'Headache' })
			})

			expect(result.current.formData.patientId).toBe('patient-123')
			expect(result.current.formData.chiefComplaint).toBe('Headache')
		})

		it('should handle array fields correctly', () => {
			const { result } = renderHook(() => useTreatmentPlanWizard())

			act(() => {
				result.current.updateFormData({
					currentSymptoms: ['headache', 'nausea'],
					currentMedications: ['Aspirin'],
				})
			})

			expect(result.current.formData.currentSymptoms).toEqual(['headache', 'nausea'])
			expect(result.current.formData.currentMedications).toEqual(['Aspirin'])
		})

		it('should set selected patient data', () => {
			const { result } = renderHook(() => useTreatmentPlanWizard())

			act(() => {
				result.current.setSelectedPatient(mockPatient)
			})

			expect(result.current.formData.patientId).toBe('patient-123')
			expect(result.current.formData.selectedPatient).toEqual(mockPatient)
		})
	})

	describe('validation', () => {
		it('should validate step 1 with patient selected', () => {
			const { result } = renderHook(() => useTreatmentPlanWizard())

			act(() => {
				result.current.updateFormData({ patientId: 'patient-123' })
			})

			expect(result.current.isCurrentStepValid()).toBe(true)
		})

		it('should invalidate step 1 without patient', () => {
			const { result } = renderHook(() => useTreatmentPlanWizard())

			expect(result.current.isCurrentStepValid()).toBe(false)
		})

		it('should validate step 2 with required fields', () => {
			const { result } = renderHook(() => useTreatmentPlanWizard())

			act(() => {
				result.current.updateFormData({ patientId: 'patient-123' })
				result.current.goToStep(2)
			})

			act(() => {
				result.current.updateFormData({
					chiefComplaint: 'Severe headache for 3 days',
					currentSymptoms: ['headache', 'nausea'],
				})
			})

			expect(result.current.isCurrentStepValid()).toBe(true)
		})

		it('should invalidate step 2 with short chief complaint', () => {
			const { result } = renderHook(() => useTreatmentPlanWizard())

			act(() => {
				result.current.goToStep(2)
			})

			act(() => {
				result.current.updateFormData({
					chiefComplaint: 'Headache',
					currentSymptoms: ['headache'],
				})
			})

			expect(result.current.isCurrentStepValid()).toBe(false)
		})

		it('should return validation errors', () => {
			const { result } = renderHook(() => useTreatmentPlanWizard())

			const errors = result.current.getStepErrors()
			expect(Object.keys(errors).length).toBeGreaterThan(0)
		})
	})

	describe('step progress', () => {
		it('should calculate progress percentage correctly', () => {
			const { result } = renderHook(() => useTreatmentPlanWizard())

			expect(result.current.progressPercentage).toBe(25)

			act(() => {
				result.current.updateFormData({ patientId: 'patient-123' })
				result.current.nextStep()
			})

			expect(result.current.progressPercentage).toBe(50)
		})

		it('should identify first and last steps', () => {
			const { result } = renderHook(() => useTreatmentPlanWizard())

			expect(result.current.isFirstStep).toBe(true)
			expect(result.current.isLastStep).toBe(false)

			act(() => {
				result.current.goToStep(4)
			})

			expect(result.current.isFirstStep).toBe(false)
			expect(result.current.isLastStep).toBe(true)
		})
	})

	describe('AI analysis', () => {
		it('should set analyzing state during AI analysis', async () => {
			const { result } = renderHook(() => useTreatmentPlanWizard())

			act(() => {
				result.current.setSelectedPatient(mockPatient)
				result.current.updateFormData({
					chiefComplaint: 'Severe headache for 3 days',
					currentSymptoms: ['headache', 'nausea'],
				})
			})

			let analysisPromise: Promise<void>
			act(() => {
				analysisPromise = result.current.runAIAnalysis()
			})

			expect(result.current.isAnalyzing).toBe(true)

			await act(async () => {
				await analysisPromise
			})

			expect(result.current.isAnalyzing).toBe(false)
		})

		it('should store AI analysis results', async () => {
			const { result } = renderHook(() => useTreatmentPlanWizard())

			act(() => {
				result.current.setSelectedPatient(mockPatient)
				result.current.updateFormData({
					chiefComplaint: 'Severe headache for 3 days',
					currentSymptoms: ['headache', 'nausea'],
				})
			})

			await act(async () => {
				await result.current.runAIAnalysis()
			})

			expect(result.current.formData.aiAnalysis).toBeDefined()
			expect(result.current.formData.aiAnalysis?.medications.length).toBeGreaterThan(0)
		})
	})

	describe('reset functionality', () => {
		it('should reset form to initial state', () => {
			const { result } = renderHook(() => useTreatmentPlanWizard())

			act(() => {
				result.current.updateFormData({
					patientId: 'patient-123',
					chiefComplaint: 'Test complaint',
					currentSymptoms: ['headache'],
				})
				result.current.nextStep()
			})

			act(() => {
				result.current.resetForm()
			})

			expect(result.current.currentStep).toBe(1)
			expect(result.current.formData.patientId).toBe('')
			expect(result.current.formData.chiefComplaint).toBe('')
		})
	})
})
