'use client'

import { useState, useCallback } from 'react'
import type { LoginFormData, LoginFormErrors, LoginFormState } from '../types'

export function useLoginForm() {
	const [formState, setFormState] = useState<LoginFormState>({
		data: {
			email: '',
			password: '',
			rememberMe: false,
		},
		errors: {},
		isSubmitting: false,
		isValid: false,
	})

	const validateEmail = useCallback((email: string): string | undefined => {
		if (!email) {
			return 'Email is required'
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			return 'Please enter a valid email address'
		}
		return undefined
	}, [])

	const validatePassword = useCallback((password: string): string | undefined => {
		if (!password) {
			return 'Password is required'
		}
		if (password.length < 8) {
			return 'Password must be at least 8 characters'
		}
		return undefined
	}, [])

	const validateForm = useCallback(
		(data: LoginFormData): LoginFormErrors => {
			const errors: LoginFormErrors = {}

			const emailError = validateEmail(data.email)
			if (emailError) errors.email = emailError

			const passwordError = validatePassword(data.password)
			if (passwordError) errors.password = passwordError

			return errors
		},
		[validateEmail, validatePassword]
	)

	const handleChange = useCallback(
		(field: keyof LoginFormData, value: string | boolean) => {
			setFormState((prev) => {
				const newData = { ...prev.data, [field]: value }
				const errors = validateForm(newData)
				const isValid = Object.keys(errors).length === 0

				return {
					...prev,
					data: newData,
					errors,
					isValid,
				}
			})
		},
		[validateForm]
	)

	const handleSubmit = useCallback(
		async (onSubmit: (data: LoginFormData) => Promise<void>) => {
			const errors = validateForm(formState.data)

			if (Object.keys(errors).length > 0) {
				setFormState((prev) => ({ ...prev, errors }))
				return
			}

			setFormState((prev) => ({ ...prev, isSubmitting: true, errors: {} }))

			try {
				await onSubmit(formState.data)
			} catch (error) {
				setFormState((prev) => ({
					...prev,
					isSubmitting: false,
					errors: {
						general:
							error instanceof Error
								? error.message
								: 'An unexpected error occurred. Please try again.',
					},
				}))
			}
		},
		[formState.data, validateForm]
	)

	const resetForm = useCallback(() => {
		setFormState({
			data: {
				email: '',
				password: '',
				rememberMe: false,
			},
			errors: {},
			isSubmitting: false,
			isValid: false,
		})
	}, [])

	return {
		formState,
		handleChange,
		handleSubmit,
		resetForm,
	}
}
