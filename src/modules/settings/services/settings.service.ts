import type {
	UserProfile,
	UpdateProfileInput,
	NotificationPreferences,
	UpdateNotificationPreferencesInput,
	ActiveSession,
	TwoFactorSetupResponse,
	ChangePasswordInput,
	AppearanceSettings,
	UpdateAppearanceSettingsInput,
} from '../types'
import {
	DEFAULT_NOTIFICATION_PREFERENCES,
	DEFAULT_APPEARANCE_SETTINGS,
} from '../constants'

const MOCK_SESSIONS: ActiveSession[] = [
	{
		id: '1',
		device: 'MacBook Pro',
		browser: 'Chrome 120',
		location: 'San Francisco, CA',
		ipAddress: '192.168.1.1',
		lastActive: new Date().toISOString(),
		isCurrent: true,
	},
	{
		id: '2',
		device: 'iPhone 15',
		browser: 'Safari Mobile',
		location: 'San Francisco, CA',
		ipAddress: '192.168.1.2',
		lastActive: new Date(Date.now() - 3600000).toISOString(),
		isCurrent: false,
	},
	{
		id: '3',
		device: 'Windows PC',
		browser: 'Firefox 121',
		location: 'New York, NY',
		ipAddress: '10.0.0.1',
		lastActive: new Date(Date.now() - 86400000).toISOString(),
		isCurrent: false,
	},
]

export class SettingsService {
	private static simulateDelay(ms: number = 500): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms))
	}

	static async getProfile(): Promise<UserProfile> {
		await this.simulateDelay()
		return {
			id: 'mock-user-id',
			name: 'Dr. John Smith',
			email: 'john.smith@hospital.com',
			specialty: 'Internal Medicine',
			licenseNumber: 'MD-12345',
			phoneNumber: '+1 (555) 123-4567',
			hospitalAffiliation: 'General Hospital',
			avatarUrl: undefined,
		}
	}

	static async updateProfile(data: UpdateProfileInput): Promise<UserProfile> {
		await this.simulateDelay()
		const currentProfile = await this.getProfile()
		return {
			...currentProfile,
			...data,
		}
	}

	static async uploadAvatar(file: File): Promise<{ url: string }> {
		await this.simulateDelay(1000)
		const mockUrl = URL.createObjectURL(file)
		return { url: mockUrl }
	}

	static async getNotificationPreferences(): Promise<NotificationPreferences> {
		await this.simulateDelay()
		return { ...DEFAULT_NOTIFICATION_PREFERENCES }
	}

	static async updateNotificationPreferences(
		data: UpdateNotificationPreferencesInput
	): Promise<NotificationPreferences> {
		await this.simulateDelay()
		const current = await this.getNotificationPreferences()
		return {
			...current,
			...data,
		}
	}

	static async changePassword(input: ChangePasswordInput): Promise<void> {
		await this.simulateDelay(1000)
		if (input.currentPassword === 'wrong') {
			throw new Error('Current password is incorrect')
		}
		if (input.newPassword !== input.confirmPassword) {
			throw new Error('Passwords do not match')
		}
		if (input.newPassword.length < 8) {
			throw new Error('Password must be at least 8 characters')
		}
	}

	static async enable2FA(): Promise<TwoFactorSetupResponse> {
		await this.simulateDelay(1000)
		return {
			qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
			secret: 'JBSWY3DPEHPK3PXP',
			backupCodes: [
				'ABCD-1234-EFGH',
				'IJKL-5678-MNOP',
				'QRST-9012-UVWX',
				'YZAB-3456-CDEF',
				'GHIJ-7890-KLMN',
				'OPQR-2345-STUV',
				'WXYZ-6789-ABCD',
				'EFGH-0123-IJKL',
			],
		}
	}

	static async verify2FA(code: string): Promise<boolean> {
		await this.simulateDelay()
		return code.length === 6 && /^\d+$/.test(code)
	}

	static async disable2FA(): Promise<void> {
		await this.simulateDelay()
	}

	static async getActiveSessions(): Promise<ActiveSession[]> {
		await this.simulateDelay()
		return [...MOCK_SESSIONS]
	}

	static async logoutSession(sessionId: string): Promise<void> {
		await this.simulateDelay()
		const session = MOCK_SESSIONS.find(s => s.id === sessionId)
		if (!session) {
			throw new Error('Session not found')
		}
		if (session.isCurrent) {
			throw new Error('Cannot logout current session')
		}
	}

	static async logoutAllSessions(): Promise<void> {
		await this.simulateDelay(1000)
	}

	static async getAppearanceSettings(): Promise<AppearanceSettings> {
		await this.simulateDelay()
		return { ...DEFAULT_APPEARANCE_SETTINGS }
	}

	static async updateAppearanceSettings(
		data: UpdateAppearanceSettingsInput
	): Promise<AppearanceSettings> {
		await this.simulateDelay()
		const current = await this.getAppearanceSettings()
		return {
			...current,
			...data,
		}
	}
}
