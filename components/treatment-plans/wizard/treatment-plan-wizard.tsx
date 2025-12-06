'use client'

import { ArrowLeft, ArrowRight, Loader2, Save, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTreatmentPlanWizard } from '@/src/modules/treatment-plans'
import { WizardProgress } from './wizard-progress'
import { StepSelectPatient } from './step-select-patient'
import { StepIntake } from './step-intake'
import { StepAIAnalysis } from './step-ai-analysis'
import { StepReview } from './step-review'

export function TreatmentPlanWizard() {
	const {
		currentStep,
		totalSteps,
		formData,
		updateFormData,
		setSelectedPatient,
		isCurrentStepValid,
		getStepErrors,
		nextStep,
		prevStep,
		runAIAnalysis,
		submitAsApproved,
		submitAsDraft,
		isFirstStep,
		isLastStep,
		isLoading,
		isAnalyzing,
		error,
		analysisError,
	} = useTreatmentPlanWizard()

	const errors = getStepErrors()

	const handleNext = async () => {
		if (currentStep === 2 && isCurrentStepValid()) {
			await runAIAnalysis()
			nextStep()
		} else if (isCurrentStepValid()) {
			nextStep()
		}
	}

	const handleApprove = async () => {
		await submitAsApproved()
	}

	const handleSaveDraft = async () => {
		await submitAsDraft()
	}

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return (
					<StepSelectPatient
						formData={formData}
						onSelectPatient={setSelectedPatient}
						errors={errors}
					/>
				)
			case 2:
				return (
					<StepIntake
						formData={formData}
						onUpdate={updateFormData}
						errors={errors}
					/>
				)
			case 3:
				return (
					<StepAIAnalysis
						formData={formData}
						isAnalyzing={isAnalyzing}
						analysisError={analysisError}
						onRunAnalysis={runAIAnalysis}
					/>
				)
			case 4:
				return (
					<StepReview
						formData={formData}
						onUpdate={updateFormData}
					/>
				)
			default:
				return null
		}
	}

	const getNextButtonText = () => {
		if (currentStep === 2) return 'Analyze with AI'
		return 'Next'
	}

	return (
		<div className='space-y-8'>
			<WizardProgress currentStep={currentStep} totalSteps={totalSteps} />

			{error && (
				<div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4'>
					<p className='text-sm text-destructive'>{error}</p>
				</div>
			)}

			<div className='min-h-[400px]'>{renderStep()}</div>

			<div className='flex justify-between pt-4 border-t'>
				<Button
					variant='outline'
					onClick={prevStep}
					disabled={isFirstStep || isLoading || isAnalyzing}
				>
					<ArrowLeft className='mr-2 h-4 w-4' />
					Previous
				</Button>

				<div className='flex gap-2'>
					{isLastStep ? (
						<>
							<Button
								variant='outline'
								onClick={handleSaveDraft}
								disabled={isLoading}
							>
								{isLoading ? (
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								) : (
									<Save className='mr-2 h-4 w-4' />
								)}
								Save as Draft
							</Button>
							<Button
								onClick={handleApprove}
								disabled={isLoading || !formData.aiAnalysis}
							>
								{isLoading ? (
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								) : (
									<Check className='mr-2 h-4 w-4' />
								)}
								Approve Plan
							</Button>
						</>
					) : (
						<Button
							onClick={handleNext}
							disabled={!isCurrentStepValid() || isAnalyzing}
						>
							{isAnalyzing ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Analyzing...
								</>
							) : (
								<>
									{getNextButtonText()}
									<ArrowRight className='ml-2 h-4 w-4' />
								</>
							)}
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}
