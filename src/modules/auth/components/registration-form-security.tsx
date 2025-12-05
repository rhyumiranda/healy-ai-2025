'use client'

import { FormFieldWrapper } from './form-field-wrapper'
import { PasswordInput } from './password-input'
import { PasswordStrengthIndicator } from './password-strength-indicator'
import type { DoctorRegistrationForm, FormErrors } from '../types'

interface RegistrationFormSecurityProps {
	formData: Partial<DoctorRegistrationForm>
	errors: FormErrors
	onChange: (field: keyof DoctorRegistrationForm, value: string) => void
	disabled?: boolean
}

export function RegistrationFormSecurity({
	formData,
	errors,
	onChange,
	disabled = false,
}: RegistrationFormSecurityProps) {
	return (
		<div className='space-y-4'>
			<div className='space-y-1'>
				<h3 className='text-lg font-semibold'>Account Security</h3>
				<p className='text-sm text-muted-foreground'>
					Create a strong password to protect your account
				</p>
			</div>

			<FormFieldWrapper
				label='Password'
				htmlFor='password'
				error={errors.password?.message}
				required
			>
				<PasswordInput
					id='password'
					value={formData.password || ''}
					onChange={(value) => onChange('password', value)}
					placeholder='Create a strong password'
					className={errors.password && 'border-destructive'}
					disabled={disabled}
					autoComplete='new-password'
				/>
			</FormFieldWrapper>

			{formData.password && (
				<div className='rounded-lg border bg-muted/50 p-4'>
					<PasswordStrengthIndicator password={formData.password} />
				</div>
			)}

			<FormFieldWrapper
				label='Confirm Password'
				htmlFor='confirmPassword'
				error={errors.confirmPassword?.message}
				required
			>
				<PasswordInput
					id='confirmPassword'
					value={formData.confirmPassword || ''}
					onChange={(value) => onChange('confirmPassword', value)}
					placeholder='Re-enter your password'
					className={errors.confirmPassword && 'border-destructive'}
					disabled={disabled}
					autoComplete='new-password'
				/>
			</FormFieldWrapper>
		</div>
	)
}
