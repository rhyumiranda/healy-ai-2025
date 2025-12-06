'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
	id: number
	title: string
	description: string
}

interface RegistrationStepIndicatorProps {
	steps: Step[]
	currentStep: number
}

export function RegistrationStepIndicator({
	steps,
	currentStep,
}: RegistrationStepIndicatorProps) {
	return (
		<nav aria-label='Registration progress' className='mb-8'>
			<ol className='flex items-center justify-between gap-2'>
				{steps.map((step, index) => {
					const stepNumber = index + 1
					const isCompleted = stepNumber < currentStep
					const isCurrent = stepNumber === currentStep
					const isUpcoming = stepNumber > currentStep

					return (
						<li key={step.id} className='flex flex-1 flex-col items-center'>
							<div className='flex w-full items-center'>
								{index > 0 && (
									<div
										className={cn(
											'h-0.5 w-full transition-all duration-500',
											isCompleted
												? 'bg-blue-600'
												: 'bg-slate-200'
										)}
									/>
								)}

								<div className='relative flex flex-col items-center'>
									<div className='relative'>
										{isCurrent && (
											<>
												<span className='absolute inset-0 h-10 w-10 animate-ping rounded-full bg-blue-400 opacity-75' />
												<span className='absolute inset-0 h-10 w-10 animate-pulse rounded-full bg-blue-300 opacity-50' />
											</>
										)}
										<div
											className={cn(
												'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
												isCompleted &&
													'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200',
												isCurrent &&
													'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110',
												isUpcoming &&
													'border-slate-300 bg-white text-slate-400'
											)}
											aria-current={isCurrent ? 'step' : undefined}
										>
											{isCompleted ? (
												<Check className='h-5 w-5 animate-in zoom-in duration-300' />
											) : (
												<span className='text-sm font-semibold'>
													{stepNumber}
												</span>
											)}
										</div>
									</div>

									<div className='absolute top-12 hidden w-32 flex-col items-center text-center md:flex'>
										<span
											className={cn(
												'text-xs font-medium transition-colors',
												isCurrent && 'text-blue-600',
												isCompleted && 'text-slate-900',
												isUpcoming && 'text-slate-400'
											)}
										>
											{step.title}
										</span>
									</div>
								</div>

								{index < steps.length - 1 && (
									<div
										className={cn(
											'h-0.5 w-full transition-all duration-500',
											isCompleted
												? 'bg-blue-600'
												: 'bg-slate-200'
										)}
									/>
								)}
							</div>
						</li>
					)
				})}
			</ol>

			<div className='mt-4 text-center md:hidden'>
				<p className='text-sm font-semibold text-blue-600'>
					{steps[currentStep - 1]?.title}
				</p>
				<p className='text-xs text-slate-500'>
					Step {currentStep} of {steps.length}
				</p>
			</div>
		</nav>
	)
}
