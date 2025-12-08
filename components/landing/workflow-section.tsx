'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { WORKFLOW_STEPS } from '@/src/modules/landing/constants'
import type { LucideIcon } from 'lucide-react'

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.2,
			delayChildren: 0.1
		}
	}
}

const cardVariants = {
	hidden: { opacity: 0, y: 30 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			type: 'spring',
			stiffness: 100,
			damping: 15,
			duration: 0.6
		}
	}
}

interface AnimatedStepIconProps {
	Icon: LucideIcon
	stepIndex: number
	color: string
	bgColor: string
}

function AnimatedStepIcon({ Icon, stepIndex, color, bgColor }: AnimatedStepIconProps) {
	return (
		<div className="relative flex items-center justify-center">
			<motion.div
				className="relative flex items-center justify-center rounded-full h-20 w-20"
				initial={{ scale: 0.8, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ duration: 0.5, delay: stepIndex * 0.2 }}
			>
				<div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-blue-500/20" />

				<motion.div
					className="absolute inset-0 rounded-full border-2 border-violet-500/30"
					animate={{ rotate: 360 }}
					transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
				/>
				<motion.div
					className="absolute inset-2 rounded-full border-2 border-purple-500/20 border-dashed"
					animate={{ rotate: -360 }}
					transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
				/>
				<motion.div
					className="absolute inset-4 rounded-full border border-blue-500/20"
					animate={{ rotate: 360 }}
					transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
				/>

				<motion.div
					className={`relative z-10 p-4 rounded-full ${bgColor}`}
					animate={{
						scale: [1, 1.05, 1],
					}}
					transition={{
						duration: 2,
						repeat: Infinity,
						ease: 'easeInOut'
					}}
				>
					<Icon className={`h-8 w-8 ${color}`} />
				</motion.div>

				{[...Array(6)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute h-2 w-2 rounded-full bg-violet-400"
						style={{
							top: '50%',
							left: '50%',
						}}
						animate={{
							x: [0, Math.cos((i * 60 * Math.PI) / 180) * 50],
							y: [0, Math.sin((i * 60 * Math.PI) / 180) * 50],
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
				className="absolute -top-1 -right-1"
				animate={{ scale: [1, 1.2, 1] }}
				transition={{ duration: 1.5, repeat: Infinity }}
			>
				<Sparkles className="h-5 w-5 text-violet-400" />
			</motion.div>
			<motion.div
				className="absolute -bottom-1 -left-1"
				animate={{ scale: [1.2, 1, 1.2] }}
				transition={{ duration: 1.5, repeat: Infinity }}
			>
				<Sparkles className="h-4 w-4 text-purple-400" />
			</motion.div>
		</div>
	)
}

export function WorkflowSection() {
	const stepColors = [
		{ color: 'text-violet-500', bgColor: 'bg-violet-500/10' },
		{ color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
		{ color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
		{ color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
	]

	return (
		<section className="py-20 px-6 lg:px-8 bg-slate-50 dark:bg-slate-900">
			<div className="max-w-7xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center mb-16"
				>
					<h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-4">
						How It Works
					</h2>
					<p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
						A streamlined clinical workflow from patient intake to final treatment decision
					</p>
				</motion.div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: '-100px' }}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
				>
					{WORKFLOW_STEPS.map((step, index) => {
						const Icon = step.icon
						const colors = stepColors[index] || stepColors[0]

						return (
							<motion.div
								key={index}
								variants={cardVariants}
								whileHover={{
									y: -8,
									transition: {
										type: 'spring',
										stiffness: 300,
										damping: 20
									}
								}}
								className="relative"
							>
								<div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-shadow h-full flex flex-col items-center text-center">
									<div className="mb-6">
										<AnimatedStepIcon
											Icon={Icon}
											stepIndex={index}
											color={colors.color}
											bgColor={colors.bgColor}
										/>
									</div>

									<div className="mb-2">
										<span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
											Step {step.step}
										</span>
									</div>

									<h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-3">
										{step.title}
									</h3>

									<p className="text-sm text-slate-600 dark:text-slate-300 mb-6 flex-1">
										{step.description}
									</p>

									<div className="w-full space-y-3">
										<ul className="space-y-2 text-left">
											{step.details.map((detail, detailIndex) => (
												<motion.li
													key={detailIndex}
													initial={{ opacity: 0, x: -10 }}
													whileInView={{ opacity: 1, x: 0 }}
													viewport={{ once: true }}
													transition={{ delay: index * 0.2 + detailIndex * 0.1 }}
													className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400"
												>
													<span className="text-blue-500 mt-0.5">•</span>
													<span>{detail}</span>
												</motion.li>
											))}
										</ul>

										{step.benefits && step.benefits.length > 0 && (
											<div className="pt-4 border-t border-slate-200 dark:border-slate-700">
												<p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
													Benefits
												</p>
												<ul className="space-y-1.5 text-left">
													{step.benefits.map((benefit, benefitIndex) => (
														<motion.li
															key={benefitIndex}
															initial={{ opacity: 0, x: -10 }}
															whileInView={{ opacity: 1, x: 0 }}
															viewport={{ once: true }}
															transition={{ delay: index * 0.2 + step.details.length * 0.1 + benefitIndex * 0.1 }}
															className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400"
														>
															<Sparkles className="h-3 w-3 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
															<span>{benefit}</span>
														</motion.li>
													))}
												</ul>
											</div>
										)}
									</div>
								</div>

								{index < WORKFLOW_STEPS.length - 1 && (
									<div className="hidden lg:block absolute top-1/2 -right-4 z-10">
										<motion.div
											initial={{ opacity: 0, scale: 0 }}
											whileInView={{ opacity: 1, scale: 1 }}
											viewport={{ once: true }}
											transition={{ delay: index * 0.2 + 0.3 }}
											className="w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg border border-slate-200 dark:border-slate-700"
										>
											<motion.div
												animate={{
													x: [0, 4, 0]
												}}
												transition={{
													duration: 1.5,
													repeat: Infinity,
													ease: 'easeInOut'
												}}
											>
												<ArrowRight className="w-4 h-4 text-blue-500" />
											</motion.div>
										</motion.div>
									</div>
								)}
							</motion.div>
						)
					})}
				</motion.div>
			</div>
		</section>
	)
}
