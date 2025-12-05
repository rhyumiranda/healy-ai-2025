'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { LoginFormData, LoginFormErrors } from '../types'

interface LoginFormFieldsProps {
	data: LoginFormData
	errors: LoginFormErrors
	isSubmitting: boolean
	onChange: (field: keyof LoginFormData, value: string | boolean) => void
}

export function LoginFormFields({
	data,
	errors,
	isSubmitting,
	onChange,
}: LoginFormFieldsProps) {
	return (
		<div className='space-y-4'>
			<div className='space-y-2'>
				<Label htmlFor='email' className='text-sm font-medium'>
					Email Address
				</Label>
				<Input
					id='email'
					type='email'
					placeholder='doctor@hospital.com'
					value={data.email}
					onChange={(e) => onChange('email', e.target.value)}
					disabled={isSubmitting}
					className={errors.email ? 'border-destructive' : ''}
					autoComplete='email'
					required
					aria-invalid={!!errors.email}
					aria-describedby={errors.email ? 'email-error' : undefined}
				/>
				{errors.email && (
					<p
						id='email-error'
						className='text-sm font-medium text-destructive'
						role='alert'
					>
						{errors.email}
					</p>
				)}
			</div>

			<div className='space-y-2'>
				<div className='flex items-center justify-between'>
					<Label htmlFor='password' className='text-sm font-medium'>
						Password
					</Label>
					<a
						href='/auth/forgot-password'
						className='text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded'
						tabIndex={isSubmitting ? -1 : 0}
					>
						Forgot password?
					</a>
				</div>
				<Input
					id='password'
					type='password'
					placeholder='Enter your password'
					value={data.password}
					onChange={(e) => onChange('password', e.target.value)}
					disabled={isSubmitting}
					className={errors.password ? 'border-destructive' : ''}
					autoComplete='current-password'
					required
					aria-invalid={!!errors.password}
					aria-describedby={errors.password ? 'password-error' : undefined}
				/>
				{errors.password && (
					<p
						id='password-error'
						className='text-sm font-medium text-destructive'
						role='alert'
					>
						{errors.password}
					</p>
				)}
			</div>

			<div className='flex items-center space-x-2'>
				<input
					id='rememberMe'
					type='checkbox'
					checked={data.rememberMe}
					onChange={(e) => onChange('rememberMe', e.target.checked)}
					disabled={isSubmitting}
					className='h-4 w-4 rounded border-input focus:ring-2 focus:ring-primary focus:ring-offset-2'
					aria-label='Remember me for 30 days'
				/>
				<Label
					htmlFor='rememberMe'
					className='text-sm font-normal cursor-pointer select-none'
				>
					Remember me for 30 days
				</Label>
			</div>
		</div>
	)
}
