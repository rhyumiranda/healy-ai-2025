import type { NotificationFrequency, Theme, FontSize } from '../types'

export const MEDICAL_SPECIALTIES = [
	'Internal Medicine',
	'Family Medicine',
	'Pediatrics',
	'Cardiology',
	'Dermatology',
	'Emergency Medicine',
	'Endocrinology',
	'Gastroenterology',
	'Geriatrics',
	'Hematology',
	'Infectious Disease',
	'Nephrology',
	'Neurology',
	'Obstetrics & Gynecology',
	'Oncology',
	'Ophthalmology',
	'Orthopedics',
	'Otolaryngology',
	'Pathology',
	'Psychiatry',
	'Pulmonology',
	'Radiology',
	'Rheumatology',
	'Surgery',
	'Urology',
	'Other',
] as const

export const NOTIFICATION_FREQUENCIES: { value: NotificationFrequency; label: string }[] = [
	{ value: 'immediate', label: 'Immediate' },
	{ value: 'daily', label: 'Daily Digest' },
	{ value: 'weekly', label: 'Weekly Summary' },
]

export const THEMES: { value: Theme; label: string }[] = [
	{ value: 'light', label: 'Light' },
	{ value: 'dark', label: 'Dark' },
	{ value: 'system', label: 'System' },
]

export const FONT_SIZES: { value: FontSize; label: string; description: string }[] = [
	{ value: 'small', label: 'Small', description: '14px base' },
	{ value: 'medium', label: 'Medium', description: '16px base (default)' },
	{ value: 'large', label: 'Large', description: '18px base' },
]

export const DEFAULT_PROFILE = {
	name: '',
	email: '',
	specialty: undefined,
	licenseNumber: undefined,
	phoneNumber: undefined,
	hospitalAffiliation: undefined,
	avatarUrl: undefined,
}

export const DEFAULT_NOTIFICATION_PREFERENCES = {
	safetyAlerts: true,
	treatmentPlanUpdates: true,
	emailNotifications: false,
	pushNotifications: false,
	frequency: 'immediate' as NotificationFrequency,
}

export const DEFAULT_APPEARANCE_SETTINGS = {
	theme: 'system' as Theme,
	compactMode: false,
	fontSize: 'medium' as FontSize,
}
