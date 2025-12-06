import { Check } from 'lucide-react'
import type { WizardStep } from '@/src/modules/patients'

interface WizardProgressProps {
	currentStep: WizardStep
	totalSteps: number
}

const STEP_CONFIG = [
	{ id: 1, title: 'Demographics', description: 'Basic patient info' },
	{ id: 2, title: 'Medical History', description: 'Past conditions' },
	{ id: 3, title: 'Medications', description: 'Current meds & allergies' },
	{ id: 4, title: 'Vitals', description: 'Baseline measurements' },
	{ id: 5, title: 'Review', description: 'Confirm & submit' },
]

export function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
	return (
		<nav aria-label='Progress'>
			<ol className='flex items-center justify-between'>
				{STEP_CONFIG.slice(0, totalSteps).map((step, index) => {
					const isCompleted = step.id < currentStep
					const isCurrent = step.id === currentStep

					return (
						<li key={step.id} className='flex-1'>
							<div className='flex flex-col items-center'>
								<div className='flex items-center w-full'>
									{index > 0 && (
										<div
											className={`flex-1 h-0.5 ${
												isCompleted ? 'bg-primary' : 'bg-muted'
											}`}
										/>
									)}
									<div
										className={`
											flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors
											${isCompleted ? 'border-primary bg-primary text-primary-foreground' : ''}
											${isCurrent ? 'border-primary bg-background text-primary' : ''}
											${!isCompleted && !isCurrent ? 'border-muted bg-background text-muted-foreground' : ''}
										`}
									>
										{isCompleted ? (
											<Check className='h-5 w-5' />
										) : (
											<span className='text-sm font-medium'>{step.id}</span>
										)}
									</div>
									{index < totalSteps - 1 && (
										<div
											className={`flex-1 h-0.5 ${
												isCompleted ? 'bg-primary' : 'bg-muted'
											}`}
										/>
									)}
								</div>
								<div className='mt-2 text-center'>
									<p
										className={`text-sm font-medium ${
											isCurrent ? 'text-foreground' : 'text-muted-foreground'
										}`}
									>
										{step.title}
									</p>
									<p className='text-xs text-muted-foreground hidden sm:block'>
										{step.description}
									</p>
								</div>
							</div>
						</li>
					)
				})}
			</ol>
		</nav>
	)
}
