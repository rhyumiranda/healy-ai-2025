'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { DoctorRegistrationForm, FormErrors, RegistrationResponse } from '../types'
import { validateRegistrationForm } from '../utils/validation'
import { REGISTRATION_STEPS } from '../types/wizard'

export function useRegistrationWizard() {
	const router = useRouter()
	const [currentStep, setCurrentStep] = useState(1)
	const [formData, setFormData] = useState<Partial<DoctorRegistrationForm>>({
		fullName: '',
		email: '',
		password: '',
		confirmPassword: '',
		medicalLicenseNumber: '',
		specialty: '',
		phoneNumber: '',
		acceptTerms: false,
	})
	const [errors, setErrors] = useState<FormErrors>({})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isInitialized, setIsInitialized] = useState(false)

	useEffect(() => {
		if (typeof window !== 'undefined' && !isInitialized) {
			try {
				const savedData = sessionStorage.getItem('form_registration')
				const savedStep = sessionStorage.getItem('form_registration_step')
				
				if (savedData) {
					const parsed = JSON.parse(savedData) as Partial<DoctorRegistrationForm>
					setFormData((prev) => ({
						...prev,
						fullName: parsed.fullName || '',
						email: parsed.email || '',
						medicalLicenseNumber: parsed.medicalLicenseNumber || '',
						specialty: parsed.specialty || '',
						phoneNumber: parsed.phoneNumber || '',
					}))
				}
				
				if (savedStep) {
					const step = parseInt(savedStep, 10)
					if (step >= 1 && step <= REGISTRATION_STEPS.length) {
						setCurrentStep(step)
					}
				}
			} catch (error) {
				// Failed to load saved registration data
			}
			setIsInitialized(true)
		}
	}, [isInitialized])

	useEffect(() => {
		if (!isInitialized) return

		const timeoutId = setTimeout(() => {
			try {
				const dataToSave = {
					fullName: formData.fullName,
					email: formData.email,
					medicalLicenseNumber: formData.medicalLicenseNumber,
					specialty: formData.specialty,
					phoneNumber: formData.phoneNumber,
				}
				sessionStorage.setItem('form_registration', JSON.stringify(dataToSave))
				sessionStorage.setItem('form_registration_step', currentStep.toString())
			} catch (error) {
				// Failed to save registration data
			}
		}, 500)

		return () => clearTimeout(timeoutId)
	}, [
		formData.fullName,
		formData.email,
		formData.medicalLicenseNumber,
		formData.specialty,
		formData.phoneNumber,
		currentStep,
		isInitialized,
	])

	const handleChange = useCallback(
		(field: keyof DoctorRegistrationForm, value: string | boolean) => {
			setFormData((prev) => ({ ...prev, [field]: value }))
			if (errors[field]) {
				setErrors((prev) => {
					const newErrors = { ...prev }
					delete newErrors[field]
					return newErrors
				})
			}
		},
		[errors]
	)

	const validateCurrentStep = useCallback((): boolean => {
		const currentStepConfig = REGISTRATION_STEPS[currentStep - 1]
		if (!currentStepConfig) return false

		const allErrors = validateRegistrationForm(formData)
		const stepErrors: FormErrors = {}

		currentStepConfig.fields.forEach((field) => {
			if (allErrors[field]) {
				stepErrors[field] = allErrors[field]
			}
		})

		setErrors(stepErrors)

		if (Object.keys(stepErrors).length > 0) {
			const firstErrorField = Object.keys(stepErrors)[0]
			const errorElement = document.getElementById(firstErrorField)
			errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
			errorElement?.focus()
			return false
		}

		return true
	}, [currentStep, formData])

	const canProceedToNextStep = useCallback((): boolean => {
		const currentStepConfig = REGISTRATION_STEPS[currentStep - 1]
		if (!currentStepConfig) return false

		return currentStepConfig.fields.every((field) => {
			const value = formData[field as keyof DoctorRegistrationForm]
			if (typeof value === 'boolean') {
				return currentStep === REGISTRATION_STEPS.length ? value : true
			}
			return Boolean(value && String(value).trim())
		})
	}, [currentStep, formData])

	const handleNext = useCallback(() => {
		if (!validateCurrentStep()) {
			return
		}

		if (currentStep < REGISTRATION_STEPS.length) {
			setCurrentStep((prev) => prev + 1)
			window.scrollTo({ top: 0, behavior: 'smooth' })
		}
	}, [currentStep, validateCurrentStep])

	const handleBack = useCallback(() => {
		if (currentStep > 1) {
			setCurrentStep((prev) => prev - 1)
			setErrors({})
			window.scrollTo({ top: 0, behavior: 'smooth' })
		}
	}, [currentStep])

	const handleSubmit = useCallback(
		async () => {
			if (!validateCurrentStep()) {
				return
			}

			const allErrors = validateRegistrationForm(formData)

			if (Object.keys(allErrors).length > 0) {
				setErrors(allErrors)
				const firstErrorField = Object.keys(allErrors)[0]
				const firstErrorStep = REGISTRATION_STEPS.findIndex((step) =>
					step.fields.includes(firstErrorField)
				)
				if (firstErrorStep !== -1) {
					setCurrentStep(firstErrorStep + 1)
				}
				return
			}

			setIsSubmitting(true)
			try {
				const response = await fetch('/api/auth/register', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(formData),
				})

				const data: RegistrationResponse = await response.json()

				if (!response.ok) {
					throw new Error(data.error || 'Registration failed')
				}

				try {
					sessionStorage.removeItem('form_registration')
					sessionStorage.removeItem('form_registration_step')
				} catch (e) {
					// Failed to clear saved data
				}

				router.push('/auth/verification-pending')
			} catch (error) {
				setErrors({
					general: {
						message:
							error instanceof Error
								? error.message
								: 'Registration failed. Please try again.',
					},
				})
			} finally {
				setIsSubmitting(false)
			}
		},
		[formData, validateCurrentStep, router]
	)

	return {
		currentStep,
		formData,
		errors,
		isSubmitting,
		totalSteps: REGISTRATION_STEPS.length,
		handleChange,
		handleNext,
		handleBack,
		handleSubmit,
		canProceedToNextStep: canProceedToNextStep(),
	}
}
