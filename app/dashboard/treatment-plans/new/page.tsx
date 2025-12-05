'use client'

import { useState } from 'react'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
	Users, 
	ClipboardList, 
	Brain, 
	CheckCircle,
	ArrowRight,
	ArrowLeft,
} from 'lucide-react'

const steps = [
	{
		id: 1,
		title: 'Select Patient',
		description: 'Choose a patient for the treatment plan',
		icon: Users,
	},
	{
		id: 2,
		title: 'Intake',
		description: 'Document current condition and symptoms',
		icon: ClipboardList,
	},
	{
		id: 3,
		title: 'AI Analysis',
		description: 'Generate AI-powered recommendations',
		icon: Brain,
	},
	{
		id: 4,
		title: 'Review & Approve',
		description: 'Review, edit, and approve the plan',
		icon: CheckCircle,
	},
]

export default function NewTreatmentPlanPage() {
	const [currentStep, setCurrentStep] = useState(1)

	return (
		<>
			<header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
				<div className='flex items-center gap-2 px-4'>
					<SidebarTrigger className='-ml-1' />
					<Separator
						orientation='vertical'
						className='mr-2 data-[orientation=vertical]:h-4'
					/>
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem className='hidden md:block'>
								<BreadcrumbLink href='/dashboard'>Dashboard</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className='hidden md:block' />
							<BreadcrumbItem className='hidden md:block'>
								<BreadcrumbLink href='/dashboard/treatment-plans'>
									Treatment Plans
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className='hidden md:block' />
							<BreadcrumbItem>
								<BreadcrumbPage>New Treatment Plan</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>
			<div className='flex flex-1 flex-col gap-6 p-4 pt-0'>
				<div className='space-y-1'>
					<h2 className='text-3xl font-bold tracking-tight'>New Treatment Plan</h2>
					<p className='text-muted-foreground'>
						Create an AI-powered treatment plan for your patient
					</p>
				</div>

				<div className='flex items-center justify-between'>
					{steps.map((step, index) => {
						const Icon = step.icon
						const isActive = step.id === currentStep
						const isCompleted = step.id < currentStep

						return (
							<div key={step.id} className='flex items-center'>
								<div className='flex flex-col items-center'>
									<div
										className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
											isActive
												? 'border-primary bg-primary text-primary-foreground'
												: isCompleted
												? 'border-primary bg-primary/10 text-primary'
												: 'border-muted-foreground/30 text-muted-foreground'
										}`}
									>
										{isCompleted ? (
											<CheckCircle className='h-5 w-5' />
										) : (
											<Icon className='h-5 w-5' />
										)}
									</div>
									<div className='mt-2 text-center'>
										<p
											className={`text-sm font-medium ${
												isActive ? 'text-foreground' : 'text-muted-foreground'
											}`}
										>
											{step.title}
										</p>
										<p className='text-xs text-muted-foreground hidden lg:block'>
											{step.description}
										</p>
									</div>
								</div>
								{index < steps.length - 1 && (
									<div
										className={`h-0.5 w-16 mx-4 ${
											step.id < currentStep ? 'bg-primary' : 'bg-muted'
										}`}
									/>
								)}
							</div>
						)
					})}
				</div>

				<Card className='flex-1'>
					<CardHeader>
						<CardTitle>{steps[currentStep - 1].title}</CardTitle>
						<CardDescription>{steps[currentStep - 1].description}</CardDescription>
					</CardHeader>
					<CardContent>
						{currentStep === 1 && (
							<div className='space-y-4'>
								<p className='text-muted-foreground'>
									Select an existing patient or create a new one to begin the treatment plan.
								</p>
								<div className='grid gap-4 md:grid-cols-2'>
									{[
										{ name: 'John Doe', age: 45, condition: 'Hypertension' },
										{ name: 'Jane Smith', age: 32, condition: 'Type 2 Diabetes' },
										{ name: 'Robert Johnson', age: 58, condition: 'Cardiac' },
									].map((patient) => (
										<Card
											key={patient.name}
											className='cursor-pointer hover:border-primary transition-colors'
										>
											<CardHeader className='pb-2'>
												<CardTitle className='text-base'>{patient.name}</CardTitle>
												<CardDescription>
													{patient.age} years • {patient.condition}
												</CardDescription>
											</CardHeader>
										</Card>
									))}
								</div>
							</div>
						)}

						{currentStep === 2 && (
							<div className='space-y-4'>
								<p className='text-muted-foreground'>
									Document the patient&apos;s current condition, symptoms, and any relevant medical information.
								</p>
								<div className='h-48 rounded-lg border-2 border-dashed flex items-center justify-center'>
									<p className='text-muted-foreground'>Intake form will be displayed here</p>
								</div>
							</div>
						)}

						{currentStep === 3 && (
							<div className='space-y-4'>
								<p className='text-muted-foreground'>
									AI is analyzing patient data and generating treatment recommendations...
								</p>
								<div className='h-48 rounded-lg border-2 border-dashed flex items-center justify-center'>
									<div className='text-center'>
										<Brain className='h-12 w-12 mx-auto text-primary animate-pulse' />
										<p className='mt-2 text-muted-foreground'>Processing with Gemini AI...</p>
									</div>
								</div>
							</div>
						)}

						{currentStep === 4 && (
							<div className='space-y-4'>
								<p className='text-muted-foreground'>
									Review the AI-generated treatment plan and make any necessary modifications.
								</p>
								<div className='h-48 rounded-lg border-2 border-dashed flex items-center justify-center'>
									<p className='text-muted-foreground'>Treatment plan review will be displayed here</p>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				<div className='flex justify-between'>
					<Button
						variant='outline'
						onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
						disabled={currentStep === 1}
					>
						<ArrowLeft className='mr-2 h-4 w-4' />
						Previous
					</Button>
					<Button
						onClick={() => setCurrentStep((prev) => Math.min(steps.length, prev + 1))}
						disabled={currentStep === steps.length}
					>
						{currentStep === steps.length ? 'Complete' : 'Next'}
						{currentStep !== steps.length && <ArrowRight className='ml-2 h-4 w-4' />}
					</Button>
				</div>
			</div>
		</>
	)
}
