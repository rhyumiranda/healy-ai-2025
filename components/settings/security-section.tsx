'use client'

import { useState } from 'react'
import { Shield, Key, ShieldCheck, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ChangePasswordDialog } from './change-password-dialog'
import { TwoFactorDialog } from './two-factor-dialog'
import { ActiveSessionsList } from './active-sessions-list'
import type { ActiveSession, TwoFactorSetupResponse, ChangePasswordInput } from '@/src/modules/settings'

interface SecuritySectionProps {
	sessions: ActiveSession[]
	twoFactorEnabled: boolean
	twoFactorSetup: TwoFactorSetupResponse | null
	isLoading: boolean
	isChangingPassword: boolean
	isTogglingTwoFactor: boolean
	isLoggingOut: boolean
	onChangePassword: (input: ChangePasswordInput) => Promise<void>
	onInitiate2FA: () => Promise<TwoFactorSetupResponse>
	onVerify2FA: (code: string) => Promise<boolean>
	onDisable2FA: () => Promise<void>
	onCancel2FA: () => void
	onLogoutSession: (sessionId: string) => Promise<void>
	onLogoutAll: () => Promise<void>
}

function SecuritySkeleton() {
	return (
		<Card>
			<CardHeader>
				<div className='flex items-center gap-2'>
					<div className='h-5 w-5 bg-muted animate-pulse rounded' />
					<div className='h-5 w-20 bg-muted animate-pulse rounded' />
				</div>
				<div className='h-4 w-48 bg-muted animate-pulse rounded' />
			</CardHeader>
			<CardContent className='space-y-4'>
				{[...Array(2)].map((_, i) => (
					<div key={i}>
						<div className='flex items-center justify-between'>
							<div className='space-y-1'>
								<div className='h-4 w-32 bg-muted animate-pulse rounded' />
								<div className='h-3 w-48 bg-muted animate-pulse rounded' />
							</div>
							<div className='h-8 w-20 bg-muted animate-pulse rounded' />
						</div>
						<Separator className='mt-4' />
					</div>
				))}
				<div className='space-y-3'>
					{[...Array(2)].map((_, i) => (
						<div key={i} className='h-16 bg-muted animate-pulse rounded-lg' />
					))}
				</div>
			</CardContent>
		</Card>
	)
}

export function SecuritySection({
	sessions,
	twoFactorEnabled,
	twoFactorSetup,
	isLoading,
	isChangingPassword,
	isTogglingTwoFactor,
	isLoggingOut,
	onChangePassword,
	onInitiate2FA,
	onVerify2FA,
	onDisable2FA,
	onCancel2FA,
	onLogoutSession,
	onLogoutAll,
}: SecuritySectionProps) {
	const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
	const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false)

	if (isLoading) {
		return <SecuritySkeleton />
	}

	const handle2FAClick = async () => {
		if (twoFactorEnabled) {
			await onDisable2FA()
		} else {
			await onInitiate2FA()
			setTwoFactorDialogOpen(true)
		}
	}

	return (
		<>
			<Card>
				<CardHeader>
					<div className='flex items-center gap-2'>
						<Shield className='h-5 w-5 text-primary' />
						<CardTitle className='text-lg'>Security</CardTitle>
					</div>
					<CardDescription>
						Manage your security settings and active sessions
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
						<div className='space-y-0.5'>
							<div className='flex items-center gap-2'>
								<Key className='h-4 w-4 text-muted-foreground' />
								<span className='text-sm font-medium'>Password</span>
							</div>
							<p className='text-sm text-muted-foreground'>
								Update your account password
							</p>
						</div>
						<Button
							variant='outline'
							size='sm'
							onClick={() => setPasswordDialogOpen(true)}
							className='w-full sm:w-auto'
						>
							Change
						</Button>
					</div>
					<Separator />
					<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
						<div className='space-y-0.5'>
							<div className='flex items-center gap-2 flex-wrap'>
								<ShieldCheck className='h-4 w-4 text-muted-foreground' />
								<span className='text-sm font-medium'>Two-Factor Authentication</span>
								{twoFactorEnabled && (
									<span className='text-xs text-green-600 font-medium'>Enabled</span>
								)}
							</div>
							<p className='text-sm text-muted-foreground'>
								Add an extra layer of security to your account
							</p>
						</div>
						<Button
							variant={twoFactorEnabled ? 'outline' : 'default'}
							size='sm'
							onClick={handle2FAClick}
							disabled={isTogglingTwoFactor}
							className='w-full sm:w-auto'
						>
							{isTogglingTwoFactor ? (
								<Loader2 className='h-4 w-4 animate-spin' />
							) : twoFactorEnabled ? (
								'Disable'
							) : (
								'Enable'
							)}
						</Button>
					</div>
					<Separator />
					<div className='space-y-3'>
						<div className='flex items-center justify-between'>
							<h4 className='text-sm font-medium'>Active Sessions</h4>
							<span className='text-xs text-muted-foreground'>
								{sessions.length} device{sessions.length !== 1 ? 's' : ''}
							</span>
						</div>
						<ActiveSessionsList
							sessions={sessions}
							isLoading={false}
							isLoggingOut={isLoggingOut}
							onLogoutSession={onLogoutSession}
							onLogoutAll={onLogoutAll}
						/>
					</div>
				</CardContent>
			</Card>

			<ChangePasswordDialog
				open={passwordDialogOpen}
				onOpenChange={setPasswordDialogOpen}
				onSubmit={onChangePassword}
				isLoading={isChangingPassword}
			/>

			<TwoFactorDialog
				open={twoFactorDialogOpen}
				onOpenChange={setTwoFactorDialogOpen}
				setupData={twoFactorSetup}
				onVerify={onVerify2FA}
				onCancel={onCancel2FA}
				isLoading={isTogglingTwoFactor}
			/>
		</>
	)
}
