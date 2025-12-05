export const MEDICAL_SPECIALTIES = [
	'General Practice',
	'Internal Medicine',
	'Family Medicine',
	'Pediatrics',
	'Cardiology',
	'Dermatology',
	'Emergency Medicine',
	'Endocrinology',
	'Gastroenterology',
	'Neurology',
	'Oncology',
	'Orthopedics',
	'Psychiatry',
	'Radiology',
	'Surgery',
	'Other',
] as const

export const PASSWORD_REQUIREMENTS = {
	minLength: 8,
	requireUpperCase: true,
	requireLowerCase: true,
	requireNumber: true,
	requireSpecialChar: true,
} as const

export const VALIDATION_MESSAGES = {
	required: 'This field is required',
	invalidEmail: 'Please enter a valid email address',
	passwordMismatch: 'Passwords do not match',
	weakPassword: 'Password does not meet requirements',
	invalidPhone: 'Please enter a valid phone number',
	termsRequired: 'You must accept the terms and conditions',
} as const
