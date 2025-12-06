import { Check, Users, ClipboardList, Brain, CheckCircle } from 'lucide-react'
import type { TreatmentWizardStep } from '@/src/modules/treatment-plans'

interface WizardProgressProps {
	currentStep: TreatmentWizardStep
	totalSteps: number
}

const STEP_CONFIG = [
	{ id: 1, title: 'Select Patient', description: 'Choose patient', icon: Users },
	{ id: 2, title: 'Clinical Intake', description: 'Document symptoms', icon: ClipboardList },
	{ id: 3, title: 'AI Analysis', description: 'Get recommendations', icon: Brain },
	{ id: 4, title: 'Review & Approve', description: 'Finalize plan', icon: CheckCircle },
]

export function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
	return (
		<nav aria-label='Progress'>
			<ol className='flex items-center justify-between'>
				{STEP_CONFIG.slice(0, totalSteps).map((step, index) => {
					const isCompleted = step.id < currentStep
					const isCurrent = step.id === currentStep
					const Icon = step.icon

					return (
						<li key={step.id} className='flex-1'>
							<div className='flex flex-col items-center'>
								<div className='flex items-center w-full'>
									{index > 0 && (
										<div className={`flex-1 h-0.5 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
									)}
									<div
										className={`
											flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors
											${isCompleted ? 'border-primary bg-primary text-primary-foreground' : ''}
											${isCurrent ? 'border-primary bg-background text-primary' : ''}
											${!isCompleted && !isCurrent ? 'border-muted bg-background text-muted-foreground' : ''}
										`}
									>
										{isCompleted ? <Check className='h-5 w-5' /> : <Icon className='h-5 w-5' />}
									</div>
									{index < totalSteps - 1 && (
										<div className={`flex-1 h-0.5 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
									)}
								</div>
								<div className='mt-2 text-center'>
									<p className={`text-sm font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
										{step.title}
									</p>
									<p className='text-xs text-muted-foreground hidden sm:block'>{step.description}</p>
								</div>
							</div>
						</li>
					)
				})}
			</ol>
		</nav>
	)
}
