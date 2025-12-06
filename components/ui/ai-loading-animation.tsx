'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
	Sparkles,
	Brain,
	Pill,
	ShieldCheck,
	FileSearch,
	Database,
	Activity,
	CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AILoadingAnimationProps {
	size?: 'sm' | 'md' | 'lg'
	className?: string
	label?: string
	sublabel?: string
}

const analysisSteps = [
	{
		icon: Brain,
		label: 'Analyzing patient data',
		description: 'Processing medical history and symptoms',
		color: 'text-violet-500',
		bgColor: 'bg-violet-500/10',
	},
	{
		icon: Database,
		label: 'Searching knowledge base',
		description: 'Retrieving clinical guidelines and protocols',
		color: 'text-blue-500',
		bgColor: 'bg-blue-500/10',
	},
	{
		icon: Pill,
		label: 'Evaluating medications',
		description: 'Checking FDA database for drug information',
		color: 'text-emerald-500',
		bgColor: 'bg-emerald-500/10',
	},
	{
		icon: ShieldCheck,
		label: 'Safety validation',
		description: 'Checking for drug interactions and contraindications',
		color: 'text-amber-500',
		bgColor: 'bg-amber-500/10',
	},
	{
		icon: FileSearch,
		label: 'Fetching references',
		description: 'Gathering clinical evidence from PubMed',
		color: 'text-purple-500',
		bgColor: 'bg-purple-500/10',
	},
	{
		icon: Activity,
		label: 'Generating recommendations',
		description: 'Creating personalized treatment plan',
		color: 'text-pink-500',
		bgColor: 'bg-pink-500/10',
	},
]

export function AILoadingAnimation({
	size = 'md',
	className,
}: AILoadingAnimationProps) {
	const [currentStep, setCurrentStep] = useState(0)
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		const stepInterval = setInterval(() => {
			setCurrentStep((prev) => (prev + 1) % analysisSteps.length)
		}, 3000)

		const progressInterval = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 95) return prev
				return prev + Math.random() * 2
			})
		}, 200)

		return () => {
			clearInterval(stepInterval)
			clearInterval(progressInterval)
		}
	}, [])

	const sizeClasses = {
		sm: { container: 'w-64', icon: 'h-6 w-6', orb: 'h-20 w-20' },
		md: { container: 'w-80', icon: 'h-8 w-8', orb: 'h-28 w-28' },
		lg: { container: 'w-96', icon: 'h-10 w-10', orb: 'h-36 w-36' },
	}

	const CurrentIcon = analysisSteps[currentStep].icon

	return (
		<div className={cn('flex flex-col items-center gap-6', sizeClasses[size].container, className)}>
			<div className='relative'>
				<motion.div
					className={cn('relative flex items-center justify-center rounded-full', sizeClasses[size].orb)}
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.5 }}
				>
					<div className='absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-blue-500/20' />

					<motion.div
						className='absolute inset-0 rounded-full border-2 border-violet-500/30'
						animate={{ rotate: 360 }}
						transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
					/>
					<motion.div
						className='absolute inset-2 rounded-full border-2 border-purple-500/20 border-dashed'
						animate={{ rotate: -360 }}
						transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
					/>
					<motion.div
						className='absolute inset-4 rounded-full border border-blue-500/20'
						animate={{ rotate: 360 }}
						transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
					/>

					<AnimatePresence mode='wait'>
						<motion.div
							key={currentStep}
							initial={{ scale: 0, opacity: 0, rotate: -180 }}
							animate={{ scale: 1, opacity: 1, rotate: 0 }}
							exit={{ scale: 0, opacity: 0, rotate: 180 }}
							transition={{ duration: 0.5, ease: 'easeInOut' }}
							className={cn(
								'relative z-10 p-4 rounded-full',
								analysisSteps[currentStep].bgColor
							)}
						>
							<CurrentIcon className={cn(sizeClasses[size].icon, analysisSteps[currentStep].color)} />
						</motion.div>
					</AnimatePresence>

					{[...Array(6)].map((_, i) => (
						<motion.div
							key={i}
							className='absolute h-2 w-2 rounded-full bg-violet-400'
							style={{
								top: '50%',
								left: '50%',
							}}
							animate={{
								x: [0, Math.cos((i * 60 * Math.PI) / 180) * 60],
								y: [0, Math.sin((i * 60 * Math.PI) / 180) * 60],
								scale: [0, 1, 0],
								opacity: [0, 1, 0],
							}}
							transition={{
								duration: 2,
								repeat: Infinity,
								delay: i * 0.3,
								ease: 'easeInOut',
							}}
						/>
					))}
				</motion.div>

				<motion.div
					className='absolute -top-1 -right-1'
					animate={{ scale: [1, 1.2, 1] }}
					transition={{ duration: 1.5, repeat: Infinity }}
				>
					<Sparkles className='h-5 w-5 text-violet-400' />
				</motion.div>
				<motion.div
					className='absolute -bottom-1 -left-1'
					animate={{ scale: [1.2, 1, 1.2] }}
					transition={{ duration: 1.5, repeat: Infinity }}
				>
					<Sparkles className='h-4 w-4 text-purple-400' />
				</motion.div>
			</div>

			<div className='text-center space-y-2'>
				<AnimatePresence mode='wait'>
					<motion.div
						key={currentStep}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.3 }}
					>
						<h3 className='text-lg font-semibold text-foreground'>
							{analysisSteps[currentStep].label}
						</h3>
						<p className='text-sm text-muted-foreground'>
							{analysisSteps[currentStep].description}
						</p>
					</motion.div>
				</AnimatePresence>
			</div>

			<div className='w-full space-y-2'>
				<div className='h-2 w-full bg-muted rounded-full overflow-hidden'>
					<motion.div
						className='h-full bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500 rounded-full'
						initial={{ width: '0%' }}
						animate={{ width: `${progress}%` }}
						transition={{ duration: 0.3 }}
					/>
				</div>
				<div className='flex justify-between text-xs text-muted-foreground'>
					<span>Processing...</span>
					<span>{Math.round(progress)}%</span>
				</div>
			</div>

			<div className='flex gap-2'>
				{analysisSteps.map((step, index) => {
					const StepIcon = step.icon
					const isCompleted = index < currentStep
					const isCurrent = index === currentStep

					return (
						<motion.div
							key={index}
							className={cn(
								'flex items-center justify-center h-8 w-8 rounded-full transition-all duration-300',
								isCompleted ? 'bg-green-100' : isCurrent ? step.bgColor : 'bg-muted'
							)}
							animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
							transition={{ duration: 1, repeat: Infinity }}
						>
							{isCompleted ? (
								<CheckCircle2 className='h-4 w-4 text-green-600' />
							) : (
								<StepIcon
									className={cn(
										'h-4 w-4',
										isCurrent ? step.color : 'text-muted-foreground'
									)}
								/>
							)}
						</motion.div>
					)
				})}
			</div>
		</div>
	)
}

export function AISparkleIcon({ className }: { className?: string }) {
	return (
		<motion.div
			className={cn('relative inline-flex', className)}
			animate={{ rotate: [0, 10, -10, 0] }}
			transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
		>
			<Sparkles className='h-5 w-5 text-violet-500' />
			<motion.div
				className='absolute inset-0'
				animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
				transition={{ duration: 1.5, repeat: Infinity }}
			>
				<Sparkles className='h-5 w-5 text-purple-400' />
			</motion.div>
		</motion.div>
	)
}

interface AIAnalyzingOverlayProps {
	isVisible: boolean
}

export function AIAnalyzingOverlay({ isVisible }: AIAnalyzingOverlayProps) {
	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'
				>
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.9, opacity: 0 }}
						transition={{ type: 'spring', duration: 0.5 }}
						className='bg-card rounded-2xl p-8 shadow-2xl border'
					>
						<AILoadingAnimation size='lg' />
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
