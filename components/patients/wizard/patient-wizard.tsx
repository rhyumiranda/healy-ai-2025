'use client'

import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePatientWizard } from '@/src/modules/patients'
import { WizardProgress } from './wizard-progress'
import { StepDemographics } from './step-demographics'
import { StepMedicalHistory } from './step-medical-history'
import { StepMedications } from './step-medications'
import { StepReview } from './step-review'

export function PatientWizard() {
	const {
		currentStep,
		totalSteps,
		formData,
		updateFormData,
		isCurrentStepValid,
		getStepErrors,
		nextStep,
		prevStep,
		submitForm,
		isFirstStep,
		isLastStep,
		isLoading,
		error,
	} = usePatientWizard()

	const errors = getStepErrors()

	const handleNext = () => {
		if (isCurrentStepValid()) {
			nextStep()
		}
	}

	const handleSubmit = async () => {
		await submitForm()
	}

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return <StepDemographics formData={formData} onUpdate={updateFormData} errors={errors} />
			case 2:
				return <StepMedicalHistory formData={formData} onUpdate={updateFormData} errors={errors} />
			case 3:
				return <StepMedications formData={formData} onUpdate={updateFormData} errors={errors} />
			case 4:
				return <StepReview formData={formData} />
			default:
				return null
		}
	}

	return (
		<div className="space-y-8">
			<WizardProgress currentStep={currentStep} totalSteps={totalSteps} />

			{error && (
				<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
					<p className="text-sm text-destructive">{error}</p>
				</div>
			)}

			<div className="min-h-[400px]">{renderStep()}</div>

			<div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-between pt-4 border-t">
				<Button variant="outline" onClick={prevStep} disabled={isFirstStep || isLoading} className="w-full sm:w-auto">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Previous
				</Button>
				{isLastStep ? (
					<Button onClick={handleSubmit} disabled={isLoading} className="w-full sm:w-auto">
						{isLoading ? (
							<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
						) : (
							'Create Patient'
						)}
					</Button>
				) : (
					<Button onClick={handleNext} disabled={!isCurrentStepValid()} className="w-full sm:w-auto">
						Next
						<ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	)
}
