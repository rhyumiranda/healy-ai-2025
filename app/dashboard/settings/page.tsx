'use client'

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
	ProfileSection,
	NotificationsSection,
	SecuritySection,
	AppearanceSection,
} from '@/components/settings'
import {
	useProfile,
	useNotifications,
	useSecurity,
	useAppearance,
} from '@/src/modules/settings'

export default function SettingsPage() {
	const {
		profile,
		isLoading: profileLoading,
		isSaving: profileSaving,
		isUploading,
		updateProfile,
		uploadAvatar,
	} = useProfile()

	const {
		preferences,
		isLoading: notificationsLoading,
		isSaving: notificationsSaving,
		togglePreference,
		updatePreferences,
	} = useNotifications()

	const {
		sessions,
		twoFactorEnabled,
		twoFactorSetup,
		isLoading: securityLoading,
		isChangingPassword,
		isTogglingTwoFactor,
		isLoggingOut,
		changePassword,
		initiate2FASetup,
		verify2FA,
		disable2FA,
		cancel2FASetup,
		logoutSession,
		logoutAllSessions,
	} = useSecurity()

	const {
		settings: appearanceSettings,
		theme,
		isLoading: appearanceLoading,
		isSaving: appearanceSaving,
		changeTheme,
		toggleCompactMode,
		changeFontSize,
	} = useAppearance()

	return (
		<>
			<header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
				<div className='flex items-center gap-2 px-4'>
					<SidebarTrigger className='-ml-1' />
					<Separator
						orientation='vertical'
						className='mr-2 data-[orientation=vertical]:h-4'
					/>
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem className='hidden md:block'>
								<BreadcrumbLink href='/dashboard'>Dashboard</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className='hidden md:block' />
							<BreadcrumbItem>
								<BreadcrumbPage>Settings</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>

			<div className='flex flex-1 flex-col gap-6 p-4 pt-0'>
				<div>
					<h1 className='text-2xl font-semibold tracking-tight'>Settings</h1>
					<p className='text-sm text-muted-foreground'>
						Manage your account settings and preferences
					</p>
				</div>

				<div className='grid gap-6'>
					<ProfileSection
						profile={profile}
						isLoading={profileLoading}
						isSaving={profileSaving}
						isUploading={isUploading}
						onUpdate={updateProfile}
						onUploadAvatar={uploadAvatar}
					/>

					<NotificationsSection
						preferences={preferences}
						isLoading={notificationsLoading}
						isSaving={notificationsSaving}
						onToggle={togglePreference}
						onFrequencyChange={(frequency) => updatePreferences({ frequency })}
					/>

					<SecuritySection
						sessions={sessions}
						twoFactorEnabled={twoFactorEnabled}
						twoFactorSetup={twoFactorSetup}
						isLoading={securityLoading}
						isChangingPassword={isChangingPassword}
						isTogglingTwoFactor={isTogglingTwoFactor}
						isLoggingOut={isLoggingOut}
						onChangePassword={changePassword}
						onInitiate2FA={initiate2FASetup}
						onVerify2FA={verify2FA}
						onDisable2FA={disable2FA}
						onCancel2FA={cancel2FASetup}
						onLogoutSession={logoutSession}
						onLogoutAll={logoutAllSessions}
					/>

					<AppearanceSection
						settings={appearanceSettings}
						theme={theme}
						isLoading={appearanceLoading}
						isSaving={appearanceSaving}
						onThemeChange={changeTheme}
						onToggleCompactMode={toggleCompactMode}
						onFontSizeChange={changeFontSize}
					/>
				</div>
			</div>
		</>
	)
}
