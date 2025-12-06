'use client'

import { formatDistanceToNow } from 'date-fns'
import { Monitor, Smartphone, Globe, Loader2, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ActiveSession } from '@/src/modules/settings'

interface ActiveSessionsListProps {
	sessions: ActiveSession[]
	isLoading: boolean
	isLoggingOut: boolean
	onLogoutSession: (sessionId: string) => Promise<void>
	onLogoutAll: () => Promise<void>
}

function getDeviceIcon(device: string) {
	const lowercaseDevice = device.toLowerCase()
	if (lowercaseDevice.includes('iphone') || lowercaseDevice.includes('android') || lowercaseDevice.includes('mobile')) {
		return <Smartphone className='h-4 w-4' />
	}
	return <Monitor className='h-4 w-4' />
}

function SessionSkeleton() {
	return (
		<div className='space-y-3'>
			{[...Array(3)].map((_, i) => (
				<div key={i} className='flex items-center justify-between p-3 rounded-lg border'>
					<div className='flex items-center gap-3'>
						<div className='h-8 w-8 bg-muted animate-pulse rounded' />
						<div className='space-y-1'>
							<div className='h-4 w-32 bg-muted animate-pulse rounded' />
							<div className='h-3 w-48 bg-muted animate-pulse rounded' />
						</div>
					</div>
					<div className='h-8 w-16 bg-muted animate-pulse rounded' />
				</div>
			))}
		</div>
	)
}

export function ActiveSessionsList({
	sessions,
	isLoading,
	isLoggingOut,
	onLogoutSession,
	onLogoutAll,
}: ActiveSessionsListProps) {
	if (isLoading) {
		return <SessionSkeleton />
	}

	if (sessions.length === 0) {
		return (
			<div className='text-center py-6 text-muted-foreground'>
				No active sessions found
			</div>
		)
	}

	const otherSessions = sessions.filter(s => !s.isCurrent)

	return (
		<div className='space-y-4'>
			<div className='space-y-3'>
				{sessions.map((session) => (
					<div
						key={session.id}
						className={`flex items-center justify-between p-3 rounded-lg border ${
							session.isCurrent ? 'border-primary/50 bg-primary/5' : ''
						}`}
					>
						<div className='flex items-center gap-3'>
							<div className='h-8 w-8 rounded-lg bg-muted flex items-center justify-center'>
								{getDeviceIcon(session.device)}
							</div>
							<div className='space-y-0.5'>
								<div className='flex items-center gap-2'>
									<span className='text-sm font-medium'>{session.device}</span>
									<span className='text-sm text-muted-foreground'>• {session.browser}</span>
									{session.isCurrent && (
										<Badge variant='secondary' className='text-xs'>
											Current
										</Badge>
									)}
								</div>
								<div className='flex items-center gap-1 text-xs text-muted-foreground'>
									<Globe className='h-3 w-3' />
									<span>{session.location}</span>
									<span>•</span>
									<span>{session.ipAddress}</span>
									<span>•</span>
									<span>
										{formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}
									</span>
								</div>
							</div>
						</div>
						{!session.isCurrent && (
							<Button
								variant='ghost'
								size='sm'
								onClick={() => onLogoutSession(session.id)}
								disabled={isLoggingOut}
								className='text-destructive hover:text-destructive hover:bg-destructive/10'
							>
								{isLoggingOut ? (
									<Loader2 className='h-4 w-4 animate-spin' />
								) : (
									<LogOut className='h-4 w-4' />
								)}
							</Button>
						)}
					</div>
				))}
			</div>

			{otherSessions.length > 0 && (
				<Button
					variant='outline'
					className='w-full text-destructive hover:text-destructive hover:bg-destructive/10'
					onClick={onLogoutAll}
					disabled={isLoggingOut}
				>
					{isLoggingOut ? (
						<>
							<Loader2 className='h-4 w-4 mr-2 animate-spin' />
							Logging out...
						</>
					) : (
						<>
							<LogOut className='h-4 w-4 mr-2' />
							Logout All Other Devices
						</>
					)}
				</Button>
			)}
		</div>
	)
}
