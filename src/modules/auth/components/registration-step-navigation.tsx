'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface RegistrationStepNavigationProps {
	currentStep: number
	totalSteps: number
	canGoNext: boolean
	isSubmitting: boolean
	onBack: () => void
	onNext: () => void
	onSubmit: () => void
}

export function RegistrationStepNavigation({
	currentStep,
	totalSteps,
	canGoNext,
	isSubmitting,
	onBack,
	onNext,
	onSubmit,
}: RegistrationStepNavigationProps) {
	const isFirstStep = currentStep === 1
	const isLastStep = currentStep === totalSteps

	return (
		<div className='flex items-center justify-between gap-4 pt-6'>
			<Button
				type='button'
				variant='outline'
				onClick={onBack}
				disabled={isFirstStep || isSubmitting}
				className='gap-2'
			>
				<ChevronLeft className='h-4 w-4' />
				Back
			</Button>

			{isLastStep ? (
				<Button
					type='button'
					onClick={onSubmit}
					disabled={!canGoNext || isSubmitting}
					className='gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all'
				>
					{isSubmitting ? (
						<>
							<Loader2 className='h-4 w-4 animate-spin' />
							Creating Account...
						</>
					) : (
						'Create Account'
					)}
				</Button>
			) : (
				<Button
					type='button'
					onClick={onNext}
					disabled={!canGoNext || isSubmitting}
					className='gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all'
				>
					Next
					<ChevronRight className='h-4 w-4' />
				</Button>
			)}
		</div>
	)
}
