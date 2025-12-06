export interface UserProfile {
	id: string
	name: string
	email: string
	specialty?: string
	licenseNumber?: string
	phoneNumber?: string
	hospitalAffiliation?: string
	avatarUrl?: string
}

export interface UpdateProfileInput {
	name?: string
	specialty?: string
	licenseNumber?: string
	phoneNumber?: string
	hospitalAffiliation?: string
	avatarUrl?: string
}

export type NotificationFrequency = 'immediate' | 'daily' | 'weekly'

export interface NotificationPreferences {
	safetyAlerts: boolean
	treatmentPlanUpdates: boolean
	emailNotifications: boolean
	pushNotifications: boolean
	frequency: NotificationFrequency
}

export interface UpdateNotificationPreferencesInput {
	safetyAlerts?: boolean
	treatmentPlanUpdates?: boolean
	emailNotifications?: boolean
	pushNotifications?: boolean
	frequency?: NotificationFrequency
}

export interface ActiveSession {
	id: string
	device: string
	browser: string
	location: string
	ipAddress: string
	lastActive: Date | string
	isCurrent: boolean
}

export interface SecuritySettings {
	twoFactorEnabled: boolean
	activeSessions: ActiveSession[]
}

export interface TwoFactorSetupResponse {
	qrCode: string
	secret: string
	backupCodes: string[]
}

export interface ChangePasswordInput {
	currentPassword: string
	newPassword: string
	confirmPassword: string
}

export type Theme = 'light' | 'dark' | 'system'
export type FontSize = 'small' | 'medium' | 'large'

export interface AppearanceSettings {
	theme: Theme
	compactMode: boolean
	fontSize: FontSize
}

export interface UpdateAppearanceSettingsInput {
	theme?: Theme
	compactMode?: boolean
	fontSize?: FontSize
}
