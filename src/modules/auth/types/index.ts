export interface DoctorRegistrationForm {
	fullName: string
	email: string
	password: string
	confirmPassword: string
	medicalLicenseNumber: string
	specialty: string
	phoneNumber: string
	acceptTerms: boolean
}

export interface FieldError {
	message: string
}

export interface FormErrors {
	[key: string]: FieldError | undefined
}

export type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong'

export interface PasswordValidation {
	hasMinLength: boolean
	hasUpperCase: boolean
	hasLowerCase: boolean
	hasNumber: boolean
	hasSpecialChar: boolean
}

export * from './wizard'
