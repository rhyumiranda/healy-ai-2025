'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
	Brain,
	Sparkles,
	Activity,
	Dna,
	HeartPulse,
	Pill,
} from 'lucide-react'

interface StepTransitionLoaderProps {
	patientName?: string
}

const processingSteps = [
	'Analyzing clinical data',
	'Cross-referencing symptoms',
	'Evaluating treatment options',
	'Checking drug interactions',
	'Generating recommendations',
]

const floatingIcons = [
	{ Icon: Brain, delay: 0, x: -120, y: -80 },
	{ Icon: HeartPulse, delay: 0.2, x: 120, y: -60 },
	{ Icon: Dna, delay: 0.4, x: -100, y: 80 },
	{ Icon: Pill, delay: 0.6, x: 100, y: 100 },
	{ Icon: Activity, delay: 0.8, x: 0, y: -120 },
]

export function StepTransitionLoader({ patientName }: StepTransitionLoaderProps) {
	const [currentStep, setCurrentStep] = useState(0)
	const [dots, setDots] = useState('')

	useEffect(() => {
		const stepInterval = setInterval(() => {
			setCurrentStep((prev) => (prev + 1) % processingSteps.length)
		}, 2500)

		const dotsInterval = setInterval(() => {
			setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
		}, 400)

		return () => {
			clearInterval(stepInterval)
			clearInterval(dotsInterval)
		}
	}, [])

	return (
		<div className='relative flex flex-col items-center justify-center min-h-[500px] overflow-hidden'>
			<div className='absolute inset-0 overflow-hidden'>
				<motion.div
					className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full'
					style={{
						background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
					}}
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.5, 0.8, 0.5],
					}}
					transition={{
						duration: 4,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
				/>
				<motion.div
					className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full'
					style={{
						background: 'radial-gradient(circle, rgba(147, 51, 234, 0.06) 0%, transparent 70%)',
					}}
					animate={{
						scale: [1.2, 1, 1.2],
						opacity: [0.6, 0.4, 0.6],
					}}
					transition={{
						duration: 3,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
				/>
			</div>

			{floatingIcons.map(({ Icon, delay, x, y }, index) => (
				<motion.div
					key={index}
					className='absolute top-1/2 left-1/2'
					initial={{ opacity: 0, scale: 0 }}
					animate={{
						opacity: [0, 0.4, 0],
						scale: [0.5, 1, 0.5],
						x: [0, x * 0.5, x],
						y: [0, y * 0.5, y],
					}}
					transition={{
						duration: 3,
						repeat: Infinity,
						delay,
						ease: 'easeInOut',
					}}
				>
					<Icon className='h-6 w-6 text-violet-400/50' />
				</motion.div>
			))}

			<div className='relative z-10'>
				<motion.div
					className='relative flex items-center justify-center'
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.5 }}
				>
					<motion.div
						className='absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 blur-xl'
						animate={{
							scale: [1, 1.3, 1],
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							ease: 'easeInOut',
						}}
					/>

					<svg className='w-32 h-32' viewBox='0 0 100 100'>
						<motion.circle
							cx='50'
							cy='50'
							r='45'
							fill='none'
							stroke='currentColor'
							strokeWidth='1'
							className='text-violet-200/30'
						/>
						<motion.circle
							cx='50'
							cy='50'
							r='45'
							fill='none'
							stroke='url(#gradient)'
							strokeWidth='2'
							strokeLinecap='round'
							strokeDasharray='283'
							animate={{
								strokeDashoffset: [283, 0],
								rotate: [0, 360],
							}}
							transition={{
								strokeDashoffset: {
									duration: 2,
									repeat: Infinity,
									ease: 'easeInOut',
								},
								rotate: {
									duration: 3,
									repeat: Infinity,
									ease: 'linear',
								},
							}}
							style={{ transformOrigin: 'center' }}
						/>
						<defs>
							<linearGradient id='gradient' x1='0%' y1='0%' x2='100%' y2='100%'>
								<stop offset='0%' stopColor='#8B5CF6' />
								<stop offset='50%' stopColor='#A855F7' />
								<stop offset='100%' stopColor='#7C3AED' />
							</linearGradient>
						</defs>
					</svg>

					<motion.div
						className='absolute inset-0 flex items-center justify-center'
						animate={{
							scale: [1, 1.1, 1],
						}}
						transition={{
							duration: 1.5,
							repeat: Infinity,
							ease: 'easeInOut',
						}}
					>
						<div className='p-4 rounded-full bg-gradient-to-br from-violet-500/10 to-purple-500/10'>
							<Sparkles className='h-8 w-8 text-violet-500' />
						</div>
					</motion.div>
				</motion.div>

				<div className='flex justify-center gap-1.5 mt-8'>
					{[0, 1, 2, 3, 4].map((i) => (
						<motion.div
							key={i}
							className='w-1.5 h-1.5 rounded-full bg-violet-500'
							animate={{
								y: [0, -8, 0],
								opacity: [0.3, 1, 0.3],
							}}
							transition={{
								duration: 0.8,
								repeat: Infinity,
								delay: i * 0.1,
								ease: 'easeInOut',
							}}
						/>
					))}
				</div>
			</div>

			<div className='relative z-10 mt-8 text-center space-y-3'>
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<h3 className='text-xl font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent'>
						AI Analysis in Progress
					</h3>
					{patientName && (
						<p className='text-sm text-muted-foreground mt-1'>
							Processing data for {patientName}
						</p>
					)}
				</motion.div>

				<div className='h-6 flex items-center justify-center'>
					<motion.p
						key={currentStep}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className='text-sm text-muted-foreground'
					>
						{processingSteps[currentStep]}{dots}
					</motion.p>
				</div>
			</div>

			<motion.div
				className='relative z-10 mt-8 w-64'
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5 }}
			>
				<div className='h-1 w-full bg-muted/50 rounded-full overflow-hidden'>
					<motion.div
						className='h-full bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 rounded-full'
						animate={{
							x: ['-100%', '100%'],
						}}
						transition={{
							duration: 1.5,
							repeat: Infinity,
							ease: 'easeInOut',
						}}
						style={{ width: '50%' }}
					/>
				</div>
			</motion.div>

			<motion.p
				className='relative z-10 mt-6 text-xs text-muted-foreground/70 max-w-sm text-center'
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.8 }}
			>
				Our AI is analyzing symptoms, checking medical databases, and preparing personalized treatment recommendations
			</motion.p>
		</div>
	)
}
