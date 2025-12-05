'use client'

import { useState, useCallback, useEffect } from 'react'
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

	const [isInitialized, setIsInitialized] = useState(false)

	useEffect(() => {
		if (typeof window !== 'undefined' && !isInitialized) {
			try {
				const savedData = sessionStorage.getItem('form_login')
				if (savedData) {
					const parsed = JSON.parse(savedData) as Partial<LoginFormData>
					setFormState((prev) => ({
						...prev,
						data: {
							...prev.data,
							email: parsed.email || '',
							rememberMe: parsed.rememberMe || false,
						},
					}))
				}
			} catch (error) {
				console.error('Failed to load saved login data:', error)
			}
			setIsInitialized(true)
		}
	}, [isInitialized])

	useEffect(() => {
		if (!isInitialized) return

		const timeoutId = setTimeout(() => {
			try {
				const dataToSave = {
					email: formState.data.email,
					rememberMe: formState.data.rememberMe,
				}
				sessionStorage.setItem('form_login', JSON.stringify(dataToSave))
			} catch (error) {
				console.error('Failed to save login data:', error)
			}
		}, 500)

		return () => clearTimeout(timeoutId)
	}, [formState.data.email, formState.data.rememberMe, isInitialized])

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
				try {
					sessionStorage.removeItem('form_login')
				} catch (e) {
					console.error('Failed to clear saved data:', e)
				}
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
