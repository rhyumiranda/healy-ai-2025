import { useState, useCallback, useMemo } from 'react'
import type {
	TreatmentPlanWizardData,
	TreatmentWizardStep,
	PatientSummary,
	AIAnalysisRequest,
} from '../types'
import {
	selectPatientSchema,
	intakeSchema,
	reviewSchema,
} from '../utils/validation'
import { AIAnalysisService } from '../services/ai-analysis.service'
import { useCreateTreatmentPlan } from './use-treatment-plan-mutations'

const INITIAL_FORM_DATA: TreatmentPlanWizardData = {
	patientId: '',
	selectedPatient: undefined,
	chiefComplaint: '',
	currentSymptoms: [],
	symptomDuration: undefined,
	symptomDurationValue: undefined,
	severityLevel: undefined,
	currentMedications: [],
	vitalSigns: undefined,
	labResults: undefined,
	additionalNotes: '',
	aiAnalysis: undefined,
	finalPlan: undefined,
	doctorNotes: '',
	wasModified: false,
}

const TOTAL_STEPS = 4

export function useTreatmentPlanWizard() {
	const [currentStep, setCurrentStep] = useState<TreatmentWizardStep>(1)
	const [formData, setFormData] = useState<TreatmentPlanWizardData>(INITIAL_FORM_DATA)
	const [isAnalyzing, setIsAnalyzing] = useState(false)
	const [analysisError, setAnalysisError] = useState<string | null>(null)
	const { createTreatmentPlan, isLoading, error } = useCreateTreatmentPlan()

	const updateFormData = useCallback((data: Partial<TreatmentPlanWizardData>) => {
		setFormData((prev) => ({ ...prev, ...data }))
	}, [])

	const setSelectedPatient = useCallback((patient: PatientSummary) => {
		setFormData((prev) => ({
			...prev,
			patientId: patient.id,
			selectedPatient: patient,
			currentMedications: [],
		}))
	}, [])

	const validateStep = useCallback(
		(step: TreatmentWizardStep): boolean => {
			switch (step) {
				case 1: {
					const result = selectPatientSchema.safeParse({ patientId: formData.patientId })
					return result.success
				}
				case 2: {
					const result = intakeSchema.safeParse({
						chiefComplaint: formData.chiefComplaint,
						currentSymptoms: formData.currentSymptoms,
						symptomDuration: formData.symptomDuration,
						symptomDurationValue: formData.symptomDurationValue,
						severityLevel: formData.severityLevel,
						currentMedications: formData.currentMedications,
						vitalSigns: formData.vitalSigns,
						labResults: formData.labResults,
						additionalNotes: formData.additionalNotes,
					})
					return result.success
				}
				case 3:
					return true
				case 4: {
					const result = reviewSchema.safeParse({
						finalPlan: formData.finalPlan,
						doctorNotes: formData.doctorNotes,
						wasModified: formData.wasModified,
					})
					return result.success
				}
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
				const result = selectPatientSchema.safeParse({ patientId: formData.patientId })
				if (!result.success) {
					result.error.issues.forEach((issue) => {
						errors[issue.path.join('.')] = issue.message
					})
				}
				break
			}
			case 2: {
				const result = intakeSchema.safeParse({
					chiefComplaint: formData.chiefComplaint,
					currentSymptoms: formData.currentSymptoms,
				})
				if (!result.success) {
					result.error.issues.forEach((issue) => {
						errors[issue.path.join('.')] = issue.message
					})
				}
				break
			}
			case 4: {
				const result = reviewSchema.safeParse({
					finalPlan: formData.finalPlan,
					doctorNotes: formData.doctorNotes,
				})
				if (!result.success) {
					result.error.issues.forEach((issue) => {
						errors[issue.path.join('.')] = issue.message
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
			setCurrentStep((prev) => (prev + 1) as TreatmentWizardStep)
		}
	}, [currentStep])

	const prevStep = useCallback(() => {
		if (currentStep > 1) {
			setCurrentStep((prev) => (prev - 1) as TreatmentWizardStep)
		}
	}, [currentStep])

	const goToStep = useCallback((step: TreatmentWizardStep) => {
		if (step >= 1 && step <= TOTAL_STEPS) {
			setCurrentStep(step)
		}
	}, [])

	const resetForm = useCallback(() => {
		setFormData(INITIAL_FORM_DATA)
		setCurrentStep(1)
		setIsAnalyzing(false)
		setAnalysisError(null)
	}, [])

	const runAIAnalysis = useCallback(async () => {
		if (!formData.selectedPatient) {
			setAnalysisError('No patient selected')
			return
		}

		setIsAnalyzing(true)
		setAnalysisError(null)

		try {
			const request: AIAnalysisRequest = {
				patient: formData.selectedPatient,
				chiefComplaint: formData.chiefComplaint,
				currentSymptoms: formData.currentSymptoms,
				currentMedications: formData.currentMedications,
				vitalSigns: formData.vitalSigns,
				labResults: formData.labResults,
				additionalNotes: formData.additionalNotes,
			}

			const response = await AIAnalysisService.analyzeTreatment(request)
			
			setFormData((prev) => ({
				...prev,
				aiAnalysis: response,
				finalPlan: {
					medications: response.medications,
					notes: '',
				},
			}))
		} catch (err) {
			setAnalysisError(err instanceof Error ? err.message : 'AI analysis failed')
		} finally {
			setIsAnalyzing(false)
		}
	}, [formData])

	const submitAsApproved = useCallback(async () => {
		const submitData = {
			patientId: formData.patientId,
			chiefComplaint: formData.chiefComplaint,
			currentSymptoms: formData.currentSymptoms.join(', '),
			vitalSigns: formData.vitalSigns,
			status: 'APPROVED' as const,
		}
		return createTreatmentPlan(submitData)
	}, [formData, createTreatmentPlan])

	const submitAsDraft = useCallback(async () => {
		const submitData = {
			patientId: formData.patientId,
			chiefComplaint: formData.chiefComplaint,
			currentSymptoms: formData.currentSymptoms.join(', '),
			vitalSigns: formData.vitalSigns,
			status: 'DRAFT' as const,
		}
		return createTreatmentPlan(submitData)
	}, [formData, createTreatmentPlan])

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
		setSelectedPatient,
		isCurrentStepValid,
		getStepErrors,
		nextStep,
		prevStep,
		goToStep,
		resetForm,
		runAIAnalysis,
		submitAsApproved,
		submitAsDraft,
		progressPercentage,
		isFirstStep,
		isLastStep,
		isLoading,
		isAnalyzing,
		error,
		analysisError,
	}
}
