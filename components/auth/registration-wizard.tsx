'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RegistrationStepIndicator } from './registration-step-indicator'
import { RegistrationStepNavigation } from './registration-step-navigation'
import { RegistrationFormPersonal } from './registration-form-personal'
import { RegistrationFormProfessional } from './registration-form-professional'
import { RegistrationFormSecurity } from './registration-form-security'
import { RegistrationFormTerms } from './registration-form-terms'
import { useRegistrationWizard } from '@/src/modules/auth'
import { REGISTRATION_STEPS } from '@/src/modules/auth'

export function RegistrationWizard() {
	const {
		currentStep,
		formData,
		errors,
		isSubmitting,
		totalSteps,
		handleChange,
		handleNext,
		handleBack,
		handleSubmit,
		canProceedToNextStep,
	} = useRegistrationWizard()

	const currentStepConfig = REGISTRATION_STEPS[currentStep - 1]

	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return (
					<RegistrationFormPersonal
						formData={formData}
						errors={errors}
						onChange={handleChange}
						disabled={isSubmitting}
					/>
				)
			case 2:
				return (
					<RegistrationFormProfessional
						formData={formData}
						errors={errors}
						onChange={handleChange}
						disabled={isSubmitting}
					/>
				)
			case 3:
				return (
					<RegistrationFormSecurity
						formData={formData}
						errors={errors}
						onChange={handleChange}
						disabled={isSubmitting}
					/>
				)
			case 4:
				return (
					<div className='space-y-6'>
						<div className='rounded-lg border bg-muted/50 p-4 space-y-3'>
							<h4 className='text-sm font-semibold'>Review Your Information</h4>
							<dl className='space-y-2 text-sm'>
								<div className='flex justify-between'>
									<dt className='text-muted-foreground'>Name:</dt>
									<dd className='font-medium'>{formData.fullName}</dd>
								</div>
								<div className='flex justify-between'>
									<dt className='text-muted-foreground'>Email:</dt>
									<dd className='font-medium'>{formData.email}</dd>
								</div>
								<div className='flex justify-between'>
									<dt className='text-muted-foreground'>Phone:</dt>
									<dd className='font-medium'>{formData.phoneNumber}</dd>
								</div>
								<div className='flex justify-between'>
									<dt className='text-muted-foreground'>License:</dt>
									<dd className='font-medium'>{formData.medicalLicenseNumber}</dd>
								</div>
								<div className='flex justify-between'>
									<dt className='text-muted-foreground'>Specialty:</dt>
									<dd className='font-medium'>{formData.specialty}</dd>
								</div>
							</dl>
						</div>

						<RegistrationFormTerms
							formData={formData}
							errors={errors}
							onChange={handleChange}
							disabled={isSubmitting}
						/>
					</div>
				)
			default:
				return null
		}
	}

	return (
		<div className='w-full space-y-6'>
			<RegistrationStepIndicator
				steps={REGISTRATION_STEPS}
				currentStep={currentStep}
			/>

			{errors.general && (
				<div
					className='rounded-lg border border-destructive/50 bg-destructive/10 p-4'
					role='alert'
				>
					<p className='text-sm font-medium text-destructive'>
						{errors.general.message}
					</p>
				</div>
			)}

			<Card>
				<CardHeader>
					<CardTitle>{currentStepConfig?.title}</CardTitle>
					<CardDescription>{currentStepConfig?.description}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='space-y-6'>
						{renderStepContent()}

						<RegistrationStepNavigation
							currentStep={currentStep}
							totalSteps={totalSteps}
							canGoNext={canProceedToNextStep}
							isSubmitting={isSubmitting}
							onBack={handleBack}
							onNext={handleNext}
							onSubmit={handleSubmit}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
