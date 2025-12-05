'use client'

import { Input } from '@/components/ui/input'
import { FormFieldWrapper } from './form-field-wrapper'
import type { DoctorRegistrationForm, FormErrors } from '../types'

interface RegistrationFormPersonalProps {
	formData: Partial<DoctorRegistrationForm>
	errors: FormErrors
	onChange: (field: keyof DoctorRegistrationForm, value: string) => void
	disabled?: boolean
}

export function RegistrationFormPersonal({
	formData,
	errors,
	onChange,
	disabled = false,
}: RegistrationFormPersonalProps) {
	return (
		<div className='space-y-4'>
			<div className='space-y-1'>
				<h3 className='text-lg font-semibold'>Personal Information</h3>
				<p className='text-sm text-muted-foreground'>
					Enter your basic contact details
				</p>
			</div>

			<FormFieldWrapper
				label='Full Name'
				htmlFor='fullName'
				error={errors.fullName?.message}
				required
			>
				<Input
					id='fullName'
					type='text'
					placeholder='Dr. John Smith'
					value={formData.fullName || ''}
					onChange={(e) => onChange('fullName', e.target.value)}
					className={errors.fullName && 'border-destructive'}
					disabled={disabled}
					autoComplete='name'
				/>
			</FormFieldWrapper>

			<FormFieldWrapper
				label='Email Address'
				htmlFor='email'
				error={errors.email?.message}
				required
				description='Your professional email address'
			>
				<Input
					id='email'
					type='email'
					placeholder='john.smith@hospital.com'
					value={formData.email || ''}
					onChange={(e) => onChange('email', e.target.value)}
					className={errors.email && 'border-destructive'}
					disabled={disabled}
					autoComplete='email'
				/>
			</FormFieldWrapper>

			<FormFieldWrapper
				label='Phone Number'
				htmlFor='phoneNumber'
				error={errors.phoneNumber?.message}
				required
				description='Include country code (e.g., +1 234-567-8900)'
			>
				<Input
					id='phoneNumber'
					type='tel'
					placeholder='+1 (555) 123-4567'
					value={formData.phoneNumber || ''}
					onChange={(e) => onChange('phoneNumber', e.target.value)}
					className={errors.phoneNumber && 'border-destructive'}
					disabled={disabled}
					autoComplete='tel'
				/>
			</FormFieldWrapper>
		</div>
	)
}
