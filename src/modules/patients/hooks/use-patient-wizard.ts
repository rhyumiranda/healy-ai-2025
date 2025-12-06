import { useState, useCallback, useMemo } from 'react'
import type {
	PatientWizardData,
	WizardStep,
	Gender,
} from '../types'
import {
	patientDemographicsSchema,
	patientMedicalHistorySchema,
	patientMedicationsSchema,
	patientVitalsSchema,
} from '../utils/validation'
import { useCreatePatient } from './use-patient-mutations'

const INITIAL_FORM_DATA: PatientWizardData = {
	name: '',
	dateOfBirth: '',
	gender: 'MALE' as Gender,
	weight: undefined,
	height: undefined,
	bloodType: undefined,
	medicalHistory: '',
	chronicConditions: [],
	currentMedications: [],
	allergies: [],
	bloodPressureSystolic: undefined,
	bloodPressureDiastolic: undefined,
	heartRate: undefined,
	temperature: undefined,
	respiratoryRate: undefined,
	oxygenSaturation: undefined,
	chiefComplaint: '',
	currentSymptoms: [],
}

const TOTAL_STEPS = 5

export function usePatientWizard() {
	const [currentStep, setCurrentStep] = useState<WizardStep>(1)
	const [formData, setFormData] = useState<PatientWizardData>(INITIAL_FORM_DATA)
	const { createPatient, isLoading, error } = useCreatePatient()

	const updateFormData = useCallback((data: Partial<PatientWizardData>) => {
		setFormData((prev) => ({ ...prev, ...data }))
	}, [])

	const validateStep = useCallback(
		(step: WizardStep): boolean => {
			switch (step) {
				case 1: {
					const result = patientDemographicsSchema.safeParse(formData)
					return result.success
				}
				case 2: {
					const result = patientMedicalHistorySchema.safeParse(formData)
					return result.success
				}
				case 3: {
					const result = patientMedicationsSchema.safeParse(formData)
					return result.success
				}
				case 4: {
					const result = patientVitalsSchema.safeParse(formData)
					return result.success
				}
				case 5:
					return true
				default:
					return false
			}
		},
		[formData]
	)

	const getStepErrors = useCallback((): Record<string, string> => {
		const errors: Record<string, string> = {}

		switch (currentStep) {
			case 1: {
				const result = patientDemographicsSchema.safeParse(formData)
				if (!result.success) {
					result.error.issues.forEach((issue) => {
						const path = issue.path.join('.')
						errors[path] = issue.message
					})
				}
				break
			}
			case 2: {
				const result = patientMedicalHistorySchema.safeParse(formData)
				if (!result.success) {
					result.error.issues.forEach((issue) => {
						const path = issue.path.join('.')
						errors[path] = issue.message
					})
				}
				break
			}
			case 3: {
				const result = patientMedicationsSchema.safeParse(formData)
				if (!result.success) {
					result.error.issues.forEach((issue) => {
						const path = issue.path.join('.')
						errors[path] = issue.message
					})
				}
				break
			}
			case 4: {
				const result = patientVitalsSchema.safeParse(formData)
				if (!result.success) {
					result.error.issues.forEach((issue) => {
						const path = issue.path.join('.')
						errors[path] = issue.message
					})
				}
				break
			}
		}

		return errors
	}, [currentStep, formData])

	const isCurrentStepValid = useCallback((): boolean => {
		return validateStep(currentStep)
	}, [currentStep, validateStep])

	const nextStep = useCallback(() => {
		if (currentStep < TOTAL_STEPS) {
			setCurrentStep((prev) => (prev + 1) as WizardStep)
		}
	}, [currentStep])

	const prevStep = useCallback(() => {
		if (currentStep > 1) {
			setCurrentStep((prev) => (prev - 1) as WizardStep)
		}
	}, [currentStep])

	const goToStep = useCallback((step: WizardStep) => {
		if (step >= 1 && step <= TOTAL_STEPS) {
			setCurrentStep(step)
		}
	}, [])

	const resetForm = useCallback(() => {
		setFormData(INITIAL_FORM_DATA)
		setCurrentStep(1)
	}, [])

	const submitForm = useCallback(async () => {
		const submitData = {
			name: formData.name,
			dateOfBirth: formData.dateOfBirth,
			gender: formData.gender,
			medicalHistory: formData.medicalHistory || undefined,
			currentMedications: formData.currentMedications || [],
			allergies: formData.allergies || [],
			chronicConditions: formData.chronicConditions || [],
		}
		return createPatient(submitData)
	}, [formData, createPatient])

	const progressPercentage = useMemo(() => {
		return (currentStep / TOTAL_STEPS) * 100
	}, [currentStep])

	const isFirstStep = currentStep === 1
	const isLastStep = currentStep === TOTAL_STEPS

	return {
		currentStep,
		totalSteps: TOTAL_STEPS,
		formData,
		updateFormData,
		isCurrentStepValid,
		getStepErrors,
		nextStep,
		prevStep,
		goToStep,
		resetForm,
		submitForm,
		progressPercentage,
		isFirstStep,
		isLastStep,
		isLoading,
		error,
	}
}
