'use client'

import { Bell, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import type { NotificationPreferences, NotificationFrequency } from '@/src/modules/settings'
import { NOTIFICATION_FREQUENCIES } from '@/src/modules/settings'

interface NotificationsSectionProps {
	preferences: NotificationPreferences | null
	isLoading: boolean
	isSaving: boolean
	onToggle: (key: keyof Omit<NotificationPreferences, 'frequency'>) => Promise<void>
	onFrequencyChange: (frequency: NotificationFrequency) => Promise<NotificationPreferences | void>
}

function NotificationsSkeleton() {
	return (
		<Card>
			<CardHeader>
				<div className='flex items-center gap-2'>
					<div className='h-5 w-5 bg-muted animate-pulse rounded' />
					<div className='h-5 w-28 bg-muted animate-pulse rounded' />
				</div>
				<div className='h-4 w-56 bg-muted animate-pulse rounded' />
			</CardHeader>
			<CardContent className='space-y-4'>
				{[...Array(5)].map((_, i) => (
					<div key={i}>
						<div className='flex items-center justify-between'>
							<div className='space-y-1'>
								<div className='h-4 w-32 bg-muted animate-pulse rounded' />
								<div className='h-3 w-48 bg-muted animate-pulse rounded' />
							</div>
							<div className='h-5 w-9 bg-muted animate-pulse rounded-full' />
						</div>
						{i < 4 && <Separator className='mt-4' />}
					</div>
				))}
			</CardContent>
		</Card>
	)
}

interface NotificationItemProps {
	title: string
	description: string
	checked: boolean
	disabled?: boolean
	onToggle: () => void
}

function NotificationItem({ title, description, checked, disabled, onToggle }: NotificationItemProps) {
	return (
		<div className='flex items-center justify-between'>
			<div className='space-y-0.5'>
				<Label className='text-sm font-medium'>{title}</Label>
				<p className='text-sm text-muted-foreground'>{description}</p>
			</div>
			<Switch
				checked={checked}
				onCheckedChange={onToggle}
				disabled={disabled}
			/>
		</div>
	)
}

export function NotificationsSection({
	preferences,
	isLoading,
	isSaving,
	onToggle,
	onFrequencyChange,
}: NotificationsSectionProps) {
	if (isLoading) {
		return <NotificationsSkeleton />
	}

	return (
		<Card>
			<CardHeader>
				<div className='flex items-center gap-2'>
					<Bell className='h-5 w-5 text-primary' />
					<CardTitle className='text-lg'>Notifications</CardTitle>
				</div>
				<CardDescription>
					Configure how you receive notifications
				</CardDescription>
			</CardHeader>
			<CardContent className='space-y-4'>
				<NotificationItem
					title='Safety Alerts'
					description='Get notified about drug interactions and risks'
					checked={preferences?.safetyAlerts ?? true}
					disabled={isSaving}
					onToggle={() => onToggle('safetyAlerts')}
				/>
				<Separator />
				<NotificationItem
					title='Treatment Plan Updates'
					description='Notifications when plans are approved or modified'
					checked={preferences?.treatmentPlanUpdates ?? true}
					disabled={isSaving}
					onToggle={() => onToggle('treatmentPlanUpdates')}
				/>
				<Separator />
				<NotificationItem
					title='Email Notifications'
					description='Receive updates via email'
					checked={preferences?.emailNotifications ?? false}
					disabled={isSaving}
					onToggle={() => onToggle('emailNotifications')}
				/>
				<Separator />
				<NotificationItem
					title='Push Notifications'
					description='Receive push notifications on your devices'
					checked={preferences?.pushNotifications ?? false}
					disabled={isSaving}
					onToggle={() => onToggle('pushNotifications')}
				/>
				<Separator />
				<div className='flex items-center justify-between'>
					<div className='space-y-0.5'>
						<Label className='text-sm font-medium'>Notification Frequency</Label>
						<p className='text-sm text-muted-foreground'>
							How often you want to receive notification digests
						</p>
					</div>
					<Select
						value={preferences?.frequency || 'immediate'}
						onValueChange={(value) => onFrequencyChange(value as NotificationFrequency)}
						disabled={isSaving}
					>
						<SelectTrigger className='w-[160px]'>
							{isSaving ? (
								<Loader2 className='h-4 w-4 animate-spin' />
							) : (
								<SelectValue />
							)}
						</SelectTrigger>
						<SelectContent>
							{NOTIFICATION_FREQUENCIES.map((freq) => (
								<SelectItem key={freq.value} value={freq.value}>
									{freq.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</CardContent>
		</Card>
	)
}
