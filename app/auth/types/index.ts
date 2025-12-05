export interface LoginFormData {
	email: string
	password: string
	rememberMe?: boolean
}

export interface LoginFormErrors {
	email?: string
	password?: string
	general?: string
}

export interface LoginFormState {
	data: LoginFormData
	errors: LoginFormErrors
	isSubmitting: boolean
	isValid: boolean
}
