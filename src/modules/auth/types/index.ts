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

export interface RegistrationResponse {
	success: boolean
	message: string
	user?: {
		id: string
		email: string
		name: string | null
	}
	error?: string
}

export interface VerificationResponse {
	success: boolean
	message: string
	alreadyVerified?: boolean
	error?: string
}

export interface SafeUser {
	id: string
	email: string
	name: string | null
	emailVerified: Date | null
}

export interface SessionUser extends SafeUser {
	doctorProfile?: {
		id: string
		fullName: string
		specialty: string
		medicalLicenseNumber: string
		isVerified: boolean
	}
}

export * from './wizard'
