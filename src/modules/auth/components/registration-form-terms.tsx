'use client'

import Link from 'next/link'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { DoctorRegistrationForm, FormErrors } from '../types'

interface RegistrationFormTermsProps {
	formData: Partial<DoctorRegistrationForm>
	errors: FormErrors
	onChange: (field: keyof DoctorRegistrationForm, value: boolean) => void
	disabled?: boolean
}

export function RegistrationFormTerms({
	formData,
	errors,
	onChange,
	disabled = false,
}: RegistrationFormTermsProps) {
	return (
		<div className='space-y-2'>
			<div className='flex items-start gap-3 rounded-lg border bg-muted/50 p-4'>
				<Checkbox
					id='acceptTerms'
					checked={formData.acceptTerms || false}
					onCheckedChange={(checked) =>
						onChange('acceptTerms', checked === true)
					}
					disabled={disabled}
					className='mt-0.5'
					aria-invalid={!!errors.acceptTerms}
					aria-describedby={
						errors.acceptTerms ? 'acceptTerms-error' : undefined
					}
				/>
				<div className='flex-1 space-y-1'>
					<Label
						htmlFor='acceptTerms'
						className='text-sm leading-relaxed cursor-pointer'
					>
						I agree to the{' '}
						<Link
							href='/terms'
							className='font-medium text-primary hover:underline'
							tabIndex={disabled ? -1 : 0}
						>
							Terms of Service
						</Link>{' '}
						and{' '}
						<Link
							href='/privacy'
							className='font-medium text-primary hover:underline'
							tabIndex={disabled ? -1 : 0}
						>
							Privacy Policy
						</Link>
					</Label>
					<p className='text-xs text-muted-foreground'>
						By creating an account, you confirm that you are a licensed
						medical professional
					</p>
				</div>
			</div>
			{errors.acceptTerms && (
				<p
					id='acceptTerms-error'
					className='text-sm font-medium text-destructive'
					role='alert'
				>
					{errors.acceptTerms.message}
				</p>
			)}
		</div>
	)
}
