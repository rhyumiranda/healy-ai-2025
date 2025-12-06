import { renderHook, act } from '@testing-library/react'
import { usePatientWizard } from '@/src/modules/patients/hooks/use-patient-wizard'

const mockCreatePatient = jest.fn()

jest.mock('@/src/modules/patients/hooks/use-patient-mutations', () => ({
	useCreatePatient: () => ({
		createPatient: mockCreatePatient,
		isLoading: false,
		error: null,
	}),
}))

describe('usePatientWizard', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		mockCreatePatient.mockResolvedValue({ id: 'test-id' })
	})

	describe('initialization', () => {
		it('should initialize with step 1', () => {
			const { result } = renderHook(() => usePatientWizard())
			expect(result.current.currentStep).toBe(1)
		})

		it('should initialize with empty form data', () => {
			const { result } = renderHook(() => usePatientWizard())
			expect(result.current.formData.name).toBe('')
			expect(result.current.formData.dateOfBirth).toBe('')
			expect(result.current.formData.gender).toBe('MALE')
		})

		it('should have 5 total steps', () => {
			const { result } = renderHook(() => usePatientWizard())
			expect(result.current.totalSteps).toBe(5)
		})
	})

	describe('step navigation', () => {
		it('should move to next step when nextStep is called', () => {
			const { result } = renderHook(() => usePatientWizard())

			act(() => {
				result.current.updateFormData({
					name: 'John Doe',
					dateOfBirth: '1990-01-15',
					gender: 'MALE',
				})
			})

			act(() => {
				result.current.nextStep()
			})

			expect(result.current.currentStep).toBe(2)
		})

		it('should move to previous step when prevStep is called', () => {
			const { result } = renderHook(() => usePatientWizard())

			act(() => {
				result.current.updateFormData({
					name: 'John Doe',
					dateOfBirth: '1990-01-15',
					gender: 'MALE',
				})
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
			const { result } = renderHook(() => usePatientWizard())

			act(() => {
				result.current.prevStep()
			})

			expect(result.current.currentStep).toBe(1)
		})

		it('should not exceed step 5', () => {
			const { result } = renderHook(() => usePatientWizard())

			act(() => {
				result.current.updateFormData({
					name: 'John Doe',
					dateOfBirth: '1990-01-15',
					gender: 'MALE',
				})
			})

			for (let i = 0; i < 10; i++) {
				act(() => {
					result.current.nextStep()
				})
			}

			expect(result.current.currentStep).toBe(5)
		})

		it('should allow jumping to a specific step', () => {
			const { result } = renderHook(() => usePatientWizard())

			act(() => {
				result.current.updateFormData({
					name: 'John Doe',
					dateOfBirth: '1990-01-15',
					gender: 'MALE',
				})
			})

			act(() => {
				result.current.goToStep(3)
			})

			expect(result.current.currentStep).toBe(3)
		})
	})

	describe('form data management', () => {
		it('should update form data correctly', () => {
			const { result } = renderHook(() => usePatientWizard())

			act(() => {
				result.current.updateFormData({
					name: 'Jane Smith',
					dateOfBirth: '1985-06-20',
				})
			})

			expect(result.current.formData.name).toBe('Jane Smith')
			expect(result.current.formData.dateOfBirth).toBe('1985-06-20')
		})

		it('should merge new data with existing data', () => {
			const { result } = renderHook(() => usePatientWizard())

			act(() => {
				result.current.updateFormData({
					name: 'John Doe',
				})
			})

			act(() => {
				result.current.updateFormData({
					dateOfBirth: '1990-01-15',
				})
			})

			expect(result.current.formData.name).toBe('John Doe')
			expect(result.current.formData.dateOfBirth).toBe('1990-01-15')
		})

		it('should handle array fields correctly', () => {
			const { result } = renderHook(() => usePatientWizard())

			act(() => {
				result.current.updateFormData({
					allergies: ['Penicillin', 'Sulfa'],
					currentMedications: ['Aspirin 81mg'],
				})
			})

			expect(result.current.formData.allergies).toEqual(['Penicillin', 'Sulfa'])
			expect(result.current.formData.currentMedications).toEqual(['Aspirin 81mg'])
		})
	})

	describe('validation', () => {
		it('should validate step 1 with valid data', () => {
			const { result } = renderHook(() => usePatientWizard())

			act(() => {
				result.current.updateFormData({
					name: 'John Doe',
					dateOfBirth: '1990-01-15',
					gender: 'MALE',
				})
			})

			expect(result.current.isCurrentStepValid()).toBe(true)
		})

		it('should invalidate step 1 with missing name', () => {
			const { result } = renderHook(() => usePatientWizard())

			act(() => {
				result.current.updateFormData({
					dateOfBirth: '1990-01-15',
					gender: 'MALE',
				})
			})

			expect(result.current.isCurrentStepValid()).toBe(false)
		})

		it('should invalidate step 1 with short name', () => {
			const { result } = renderHook(() => usePatientWizard())

			act(() => {
				result.current.updateFormData({
					name: 'J',
					dateOfBirth: '1990-01-15',
					gender: 'MALE',
				})
			})

			expect(result.current.isCurrentStepValid()).toBe(false)
		})

		it('should always validate steps 2-4 as they are optional', () => {
			const { result } = renderHook(() => usePatientWizard())

			act(() => {
				result.current.updateFormData({
					name: 'John Doe',
					dateOfBirth: '1990-01-15',
					gender: 'MALE',
				})
			})

			act(() => {
				result.current.goToStep(2)
			})
			expect(result.current.isCurrentStepValid()).toBe(true)

			act(() => {
				result.current.goToStep(3)
			})
			expect(result.current.isCurrentStepValid()).toBe(true)

			act(() => {
				result.current.goToStep(4)
			})
			expect(result.current.isCurrentStepValid()).toBe(true)
		})

		it('should return validation errors for invalid data', () => {
			const { result } = renderHook(() => usePatientWizard())

			act(() => {
				result.current.updateFormData({
					name: 'J',
					dateOfBirth: '',
					gender: 'MALE',
				})
			})

			const errors = result.current.getStepErrors()
			expect(Object.keys(errors).length).toBeGreaterThan(0)
		})
	})

	describe('step progress', () => {
		it('should calculate progress percentage correctly', () => {
			const { result } = renderHook(() => usePatientWizard())

			expect(result.current.progressPercentage).toBe(20)

			act(() => {
				result.current.updateFormData({
					name: 'John Doe',
					dateOfBirth: '1990-01-15',
					gender: 'MALE',
				})
			})

			act(() => {
				result.current.nextStep()
			})

			expect(result.current.progressPercentage).toBe(40)
		})

		it('should identify first and last steps correctly', () => {
			const { result } = renderHook(() => usePatientWizard())

			expect(result.current.isFirstStep).toBe(true)
			expect(result.current.isLastStep).toBe(false)

			act(() => {
				result.current.updateFormData({
					name: 'John Doe',
					dateOfBirth: '1990-01-15',
					gender: 'MALE',
				})
			})

			act(() => {
				result.current.goToStep(5)
			})

			expect(result.current.isFirstStep).toBe(false)
			expect(result.current.isLastStep).toBe(true)
		})
	})

	describe('form submission', () => {
		it('should call createPatient on submit', async () => {
			const { result } = renderHook(() => usePatientWizard())

			act(() => {
				result.current.updateFormData({
					name: 'John Doe',
					dateOfBirth: '1990-01-15',
					gender: 'MALE',
				})
			})

			await act(async () => {
				await result.current.submitForm()
			})

			expect(mockCreatePatient).toHaveBeenCalled()
		})

		it('should pass form data to createPatient', async () => {
			const { result } = renderHook(() => usePatientWizard())

			const testData = {
				name: 'Jane Smith',
				dateOfBirth: '1985-06-20',
				gender: 'FEMALE' as const,
				allergies: ['Penicillin'],
			}

			act(() => {
				result.current.updateFormData(testData)
			})

			await act(async () => {
				await result.current.submitForm()
			})

			expect(mockCreatePatient).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'Jane Smith',
					dateOfBirth: '1985-06-20',
					gender: 'FEMALE',
					allergies: ['Penicillin'],
				})
			)
		})
	})

	describe('reset functionality', () => {
		it('should reset form to initial state', () => {
			const { result } = renderHook(() => usePatientWizard())

			act(() => {
				result.current.updateFormData({
					name: 'John Doe',
					dateOfBirth: '1990-01-15',
					gender: 'MALE',
					allergies: ['Penicillin'],
				})
			})

			act(() => {
				result.current.nextStep()
			})

			act(() => {
				result.current.resetForm()
			})

			expect(result.current.currentStep).toBe(1)
			expect(result.current.formData.name).toBe('')
			expect(result.current.formData.allergies).toEqual([])
		})
	})
})
