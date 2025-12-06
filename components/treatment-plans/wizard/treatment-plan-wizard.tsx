'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Loader2, Save, Check, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useTreatmentPlanWizard } from '@/src/modules/treatment-plans'
import { WizardProgress } from './wizard-progress'
import { StepSelectPatient } from './step-select-patient'
import { StepIntake } from './step-intake'
import { StepAIAnalysis } from './step-ai-analysis'
import { StepReview } from './step-review'
import { StepTransitionLoader } from './step-transition-loader'
import { AISparkleIcon } from '@/components/ui/ai-loading-animation'

export function TreatmentPlanWizard() {
	const [isTransitioning, setIsTransitioning] = useState(false)
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
			setIsTransitioning(true)
			await runAIAnalysis()
			setIsTransitioning(false)
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
		if (isTransitioning) {
			return (
				<StepTransitionLoader
					patientName={formData.selectedPatient?.name}
				/>
			)
		}

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

			<AnimatePresence mode='wait'>
				<motion.div
					key={isTransitioning ? 'transition' : currentStep}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					transition={{ duration: 0.3, ease: 'easeInOut' }}
					className='min-h-[400px]'
				>
					{renderStep()}
				</motion.div>
			</AnimatePresence>

			<motion.div
				className='flex flex-col-reverse gap-4 sm:flex-row sm:justify-between pt-4 border-t'
				animate={{
					opacity: isTransitioning ? 0 : 1,
					y: isTransitioning ? 20 : 0,
				}}
				transition={{ duration: 0.2 }}
			>
				<Button
					variant='outline'
					onClick={prevStep}
					disabled={isFirstStep || isLoading || isAnalyzing || isTransitioning}
					className='w-full sm:w-auto'
				>
					<ArrowLeft className='mr-2 h-4 w-4' />
					Previous
				</Button>

				<div className='flex flex-col sm:flex-row gap-2'>
					{isLastStep ? (
						<>
							<Button
								variant='outline'
								onClick={handleSaveDraft}
								disabled={isLoading}
								className='w-full sm:w-auto'
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
								className='w-full sm:w-auto'
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
							disabled={!isCurrentStepValid() || isAnalyzing || isTransitioning}
							className={`w-full sm:w-auto ${currentStep === 2 ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white' : ''}`}
						>
							{isAnalyzing || isTransitioning ? (
								<>
									<Sparkles className='mr-2 h-4 w-4 animate-ai-sparkle text-white' />
									Analyzing...
								</>
							) : (
								<>
									{currentStep === 2 && <AISparkleIcon className='mr-2' />}
									{getNextButtonText()}
									{currentStep !== 2 && <ArrowRight className='ml-2 h-4 w-4' />}
								</>
							)}
						</Button>
					)}
				</div>
			</motion.div>
		</div>
	)
}
