'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { RegistrationFormPersonal } from './registration-form-personal'
import { RegistrationFormProfessional } from './registration-form-professional'
import { RegistrationFormSecurity } from './registration-form-security'
import { RegistrationFormTerms } from './registration-form-terms'
import type { DoctorRegistrationForm, FormErrors } from '../types'
import { validateRegistrationForm } from '../utils/validation'

interface RegistrationFormProps {
	onSubmit: (data: DoctorRegistrationForm) => Promise<void>
}

export function RegistrationForm({ onSubmit }: RegistrationFormProps) {
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

	function handleChange(
		field: keyof DoctorRegistrationForm,
		value: string | boolean
	) {
		setFormData((prev) => ({ ...prev, [field]: value }))
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev }
				delete newErrors[field]
				return newErrors
			})
		}
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()

		const validationErrors = validateRegistrationForm(formData)

		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors)
			const firstErrorField = Object.keys(validationErrors)[0]
			const errorElement = document.getElementById(firstErrorField)
			errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
			errorElement?.focus()
			return
		}

		setIsSubmitting(true)
		try {
			await onSubmit(formData as DoctorRegistrationForm)
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
	}

	return (
		<form onSubmit={handleSubmit} className='space-y-8' noValidate>
			{errors.general && (
				<div
					className='rounded-lg border border-destructive/50 bg-destructive/10 p-4'
					role='alert'
				>
					<p className='text-sm font-medium text-destructive'>
						{errors.general.message}
					</p>
				</div>
			)}

			<RegistrationFormPersonal
				formData={formData}
				errors={errors}
				onChange={handleChange}
				disabled={isSubmitting}
			/>

			<Separator />

			<RegistrationFormProfessional
				formData={formData}
				errors={errors}
				onChange={handleChange}
				disabled={isSubmitting}
			/>

			<Separator />

			<RegistrationFormSecurity
				formData={formData}
				errors={errors}
				onChange={handleChange}
				disabled={isSubmitting}
			/>

			<Separator />

			<RegistrationFormTerms
				formData={formData}
				errors={errors}
				onChange={handleChange}
				disabled={isSubmitting}
			/>

			<Button
				type='submit'
				className='w-full'
				size='lg'
				disabled={isSubmitting}
			>
				{isSubmitting ? (
					<>
						<Loader2 className='mr-2 h-4 w-4 animate-spin' />
						Creating Account...
					</>
				) : (
					'Create Account'
				)}
			</Button>
		</form>
	)
}
