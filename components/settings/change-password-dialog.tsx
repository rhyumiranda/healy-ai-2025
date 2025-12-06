'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { ChangePasswordInput } from '@/src/modules/settings'

interface ChangePasswordDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit: (input: ChangePasswordInput) => Promise<void>
	isLoading: boolean
}

export function ChangePasswordDialog({
	open,
	onOpenChange,
	onSubmit,
	isLoading,
}: ChangePasswordDialogProps) {
	const [formData, setFormData] = useState<ChangePasswordInput>({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	})
	const [showPasswords, setShowPasswords] = useState({
		current: false,
		new: false,
		confirm: false,
	})
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		if (formData.newPassword !== formData.confirmPassword) {
			setError('Passwords do not match')
			return
		}

		if (formData.newPassword.length < 8) {
			setError('Password must be at least 8 characters')
			return
		}

		try {
			await onSubmit(formData)
			handleClose()
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to change password')
		}
	}

	const handleClose = () => {
		setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
		setShowPasswords({ current: false, new: false, confirm: false })
		setError(null)
		onOpenChange(false)
	}

	const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
		setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Change Password</DialogTitle>
					<DialogDescription>
						Enter your current password and choose a new password.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4'>
					{error && (
						<div className='rounded-lg border border-destructive/50 bg-destructive/10 p-3'>
							<p className='text-sm text-destructive'>{error}</p>
						</div>
					)}
					<div className='space-y-2'>
						<Label htmlFor='currentPassword'>Current Password</Label>
						<div className='relative'>
							<Input
								id='currentPassword'
								type={showPasswords.current ? 'text' : 'password'}
								value={formData.currentPassword}
								onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
								placeholder='Enter current password'
								required
							/>
							<button
								type='button'
								onClick={() => togglePasswordVisibility('current')}
								className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
							>
								{showPasswords.current ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
							</button>
						</div>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='newPassword'>New Password</Label>
						<div className='relative'>
							<Input
								id='newPassword'
								type={showPasswords.new ? 'text' : 'password'}
								value={formData.newPassword}
								onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
								placeholder='Enter new password'
								required
							/>
							<button
								type='button'
								onClick={() => togglePasswordVisibility('new')}
								className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
							>
								{showPasswords.new ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
							</button>
						</div>
						<p className='text-xs text-muted-foreground'>Must be at least 8 characters</p>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='confirmPassword'>Confirm New Password</Label>
						<div className='relative'>
							<Input
								id='confirmPassword'
								type={showPasswords.confirm ? 'text' : 'password'}
								value={formData.confirmPassword}
								onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
								placeholder='Confirm new password'
								required
							/>
							<button
								type='button'
								onClick={() => togglePasswordVisibility('confirm')}
								className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
							>
								{showPasswords.confirm ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
							</button>
						</div>
					</div>
					<DialogFooter>
						<Button type='button' variant='outline' onClick={handleClose} disabled={isLoading}>
							Cancel
						</Button>
						<Button type='submit' disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className='h-4 w-4 mr-2 animate-spin' />
									Changing...
								</>
							) : (
								'Change Password'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
