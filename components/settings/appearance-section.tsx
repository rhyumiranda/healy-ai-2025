'use client'

import { Palette, Sun, Moon, Monitor, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import type { AppearanceSettings, Theme, FontSize } from '@/src/modules/settings'
import { FONT_SIZES } from '@/src/modules/settings'

interface AppearanceSectionProps {
	settings: AppearanceSettings | null
	theme: Theme | undefined
	isLoading: boolean
	isSaving: boolean
	onThemeChange: (theme: Theme) => Promise<void>
	onToggleCompactMode: () => Promise<void>
	onFontSizeChange: (fontSize: FontSize) => Promise<void>
}

function AppearanceSkeleton() {
	return (
		<Card>
			<CardHeader>
				<div className='flex items-center gap-2'>
					<div className='h-5 w-5 bg-muted animate-pulse rounded' />
					<div className='h-5 w-28 bg-muted animate-pulse rounded' />
				</div>
				<div className='h-4 w-64 bg-muted animate-pulse rounded' />
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='flex items-center justify-between'>
					<div className='space-y-1'>
						<div className='h-4 w-16 bg-muted animate-pulse rounded' />
						<div className='h-3 w-48 bg-muted animate-pulse rounded' />
					</div>
					<div className='flex gap-2'>
						{[...Array(3)].map((_, i) => (
							<div key={i} className='h-9 w-20 bg-muted animate-pulse rounded' />
						))}
					</div>
				</div>
				<Separator />
				<div className='flex items-center justify-between'>
					<div className='space-y-1'>
						<div className='h-4 w-24 bg-muted animate-pulse rounded' />
						<div className='h-3 w-56 bg-muted animate-pulse rounded' />
					</div>
					<div className='h-5 w-9 bg-muted animate-pulse rounded-full' />
				</div>
				<Separator />
				<div className='flex items-center justify-between'>
					<div className='space-y-1'>
						<div className='h-4 w-20 bg-muted animate-pulse rounded' />
						<div className='h-3 w-40 bg-muted animate-pulse rounded' />
					</div>
					<div className='h-9 w-32 bg-muted animate-pulse rounded' />
				</div>
			</CardContent>
		</Card>
	)
}

interface ThemeButtonProps {
	theme: Theme
	currentTheme: Theme | undefined
	icon: React.ReactNode
	label: string
	onClick: () => void
	disabled?: boolean
}

function ThemeButton({ theme, currentTheme, icon, label, onClick, disabled }: ThemeButtonProps) {
	const isActive = currentTheme === theme
	return (
		<Button
			variant={isActive ? 'default' : 'outline'}
			size='sm'
			onClick={onClick}
			disabled={disabled}
			className='flex items-center gap-2'
		>
			{icon}
			{label}
		</Button>
	)
}

export function AppearanceSection({
	settings,
	theme,
	isLoading,
	isSaving,
	onThemeChange,
	onToggleCompactMode,
	onFontSizeChange,
}: AppearanceSectionProps) {
	if (isLoading) {
		return <AppearanceSkeleton />
	}

	return (
		<Card>
			<CardHeader>
				<div className='flex items-center gap-2'>
					<Palette className='h-5 w-5 text-primary' />
					<CardTitle className='text-lg'>Appearance</CardTitle>
				</div>
				<CardDescription>
					Customize the look and feel of the application
				</CardDescription>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='flex items-center justify-between'>
					<div className='space-y-0.5'>
						<Label className='text-sm font-medium'>Theme</Label>
						<p className='text-sm text-muted-foreground'>
							Choose between light and dark mode
						</p>
					</div>
					<div className='flex gap-2'>
						<ThemeButton
							theme='light'
							currentTheme={theme}
							icon={<Sun className='h-4 w-4' />}
							label='Light'
							onClick={() => onThemeChange('light')}
							disabled={isSaving}
						/>
						<ThemeButton
							theme='dark'
							currentTheme={theme}
							icon={<Moon className='h-4 w-4' />}
							label='Dark'
							onClick={() => onThemeChange('dark')}
							disabled={isSaving}
						/>
						<ThemeButton
							theme='system'
							currentTheme={theme}
							icon={<Monitor className='h-4 w-4' />}
							label='System'
							onClick={() => onThemeChange('system')}
							disabled={isSaving}
						/>
					</div>
				</div>
				<Separator />
				<div className='flex items-center justify-between'>
					<div className='space-y-0.5'>
						<Label className='text-sm font-medium'>Compact Mode</Label>
						<p className='text-sm text-muted-foreground'>
							Use a more condensed layout with smaller spacing
						</p>
					</div>
					<Switch
						checked={settings?.compactMode ?? false}
						onCheckedChange={onToggleCompactMode}
						disabled={isSaving}
					/>
				</div>
				<Separator />
				<div className='flex items-center justify-between'>
					<div className='space-y-0.5'>
						<Label className='text-sm font-medium'>Font Size</Label>
						<p className='text-sm text-muted-foreground'>
							Adjust the base font size for readability
						</p>
					</div>
					<Select
						value={settings?.fontSize || 'medium'}
						onValueChange={(value) => onFontSizeChange(value as FontSize)}
						disabled={isSaving}
					>
						<SelectTrigger className='w-[140px]'>
							{isSaving ? (
								<Loader2 className='h-4 w-4 animate-spin' />
							) : (
								<SelectValue />
							)}
						</SelectTrigger>
						<SelectContent>
							{FONT_SIZES.map((size) => (
								<SelectItem key={size.value} value={size.value}>
									<div className='flex flex-col'>
										<span>{size.label}</span>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</CardContent>
		</Card>
	)
}
