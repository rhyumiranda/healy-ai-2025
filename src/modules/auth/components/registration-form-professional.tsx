'use client'

import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { FormFieldWrapper } from './form-field-wrapper'
import type { DoctorRegistrationForm, FormErrors } from '../types'
import { MEDICAL_SPECIALTIES } from '../constants'

interface RegistrationFormProfessionalProps {
	formData: Partial<DoctorRegistrationForm>
	errors: FormErrors
	onChange: (field: keyof DoctorRegistrationForm, value: string) => void
	disabled?: boolean
}

export function RegistrationFormProfessional({
	formData,
	errors,
	onChange,
	disabled = false,
}: RegistrationFormProfessionalProps) {
	return (
		<div className='space-y-4'>
			<div className='space-y-1'>
				<h3 className='text-lg font-semibold'>Professional Details</h3>
				<p className='text-sm text-muted-foreground'>
					Verify your medical credentials
				</p>
			</div>

			<div className='grid gap-4 md:grid-cols-2'>
				<FormFieldWrapper
					label='Medical License Number'
					htmlFor='medicalLicenseNumber'
					error={errors.medicalLicenseNumber?.message}
					required
				>
					<Input
						id='medicalLicenseNumber'
						type='text'
						placeholder='ML-123456'
						value={formData.medicalLicenseNumber || ''}
						onChange={(e) =>
							onChange('medicalLicenseNumber', e.target.value)
						}
						className={
							errors.medicalLicenseNumber && 'border-destructive'
						}
						disabled={disabled}
					/>
				</FormFieldWrapper>

				<FormFieldWrapper
					label='Medical Specialty'
					htmlFor='specialty'
					error={errors.specialty?.message}
					required
				>
					<Select
						value={formData.specialty || ''}
						onValueChange={(value) => onChange('specialty', value)}
						disabled={disabled}
					>
						<SelectTrigger
							id='specialty'
							className={errors.specialty && 'border-destructive'}
						>
							<SelectValue placeholder='Select your specialty' />
						</SelectTrigger>
						<SelectContent>
							{MEDICAL_SPECIALTIES.map((specialty) => (
								<SelectItem key={specialty} value={specialty}>
									{specialty}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</FormFieldWrapper>
			</div>
		</div>
	)
}
