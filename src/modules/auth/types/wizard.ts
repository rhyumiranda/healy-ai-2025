export interface WizardStep {
	id: number
	title: string
	description: string
	fields: string[]
}

export const REGISTRATION_STEPS: WizardStep[] = [
	{
		id: 1,
		title: 'Personal Info',
		description: 'Tell us about yourself',
		fields: ['fullName', 'email', 'phoneNumber'],
	},
	{
		id: 2,
		title: 'Professional',
		description: 'Verify your credentials',
		fields: ['medicalLicenseNumber', 'specialty'],
	},
	{
		id: 3,
		title: 'Security',
		description: 'Secure your account',
		fields: ['password', 'confirmPassword'],
	},
	{
		id: 4,
		title: 'Confirm',
		description: 'Review and agree',
		fields: ['acceptTerms'],
	},
]
