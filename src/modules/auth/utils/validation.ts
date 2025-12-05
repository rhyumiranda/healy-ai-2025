import type {
	PasswordValidation,
	PasswordStrength,
	DoctorRegistrationForm,
	FormErrors,
} from '../types'
import { PASSWORD_REQUIREMENTS, VALIDATION_MESSAGES } from '../constants'

export function validatePassword(password: string): PasswordValidation {
	return {
		hasMinLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
		hasUpperCase: /[A-Z]/.test(password),
		hasLowerCase: /[a-z]/.test(password),
		hasNumber: /[0-9]/.test(password),
		hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
	}
}

export function getPasswordStrength(password: string): PasswordStrength {
	const validation = validatePassword(password)
	const validCount = Object.values(validation).filter(Boolean).length

	if (validCount <= 2) return 'weak'
	if (validCount === 3) return 'medium'
	if (validCount === 4) return 'strong'
	return 'very-strong'
}

export function isPasswordValid(password: string): boolean {
	const validation = validatePassword(password)
	return Object.values(validation).every(Boolean)
}

export function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

export function validatePhoneNumber(phone: string): boolean {
	const phoneRegex = /^[\d\s()+-]+$/
	return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

export function validateRegistrationForm(
	data: Partial<DoctorRegistrationForm>
): FormErrors {
	const errors: FormErrors = {}

	if (!data.fullName?.trim()) {
		errors.fullName = { message: VALIDATION_MESSAGES.required }
	}

	if (!data.email?.trim()) {
		errors.email = { message: VALIDATION_MESSAGES.required }
	} else if (!validateEmail(data.email)) {
		errors.email = { message: VALIDATION_MESSAGES.invalidEmail }
	}

	if (!data.password) {
		errors.password = { message: VALIDATION_MESSAGES.required }
	} else if (!isPasswordValid(data.password)) {
		errors.password = { message: VALIDATION_MESSAGES.weakPassword }
	}

	if (!data.confirmPassword) {
		errors.confirmPassword = { message: VALIDATION_MESSAGES.required }
	} else if (data.password !== data.confirmPassword) {
		errors.confirmPassword = { message: VALIDATION_MESSAGES.passwordMismatch }
	}

	if (!data.medicalLicenseNumber?.trim()) {
		errors.medicalLicenseNumber = { message: VALIDATION_MESSAGES.required }
	}

	if (!data.specialty) {
		errors.specialty = { message: VALIDATION_MESSAGES.required }
	}

	if (!data.phoneNumber?.trim()) {
		errors.phoneNumber = { message: VALIDATION_MESSAGES.required }
	} else if (!validatePhoneNumber(data.phoneNumber)) {
		errors.phoneNumber = { message: VALIDATION_MESSAGES.invalidPhone }
	}

	if (!data.acceptTerms) {
		errors.acceptTerms = { message: VALIDATION_MESSAGES.termsRequired }
	}

	return errors
}
