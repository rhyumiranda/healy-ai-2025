'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { WORKFLOW_STEPS } from './constants'
import type { LucideIcon } from 'lucide-react'

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.15,
			delayChildren: 0.2
		}
	}
}

const stepVariants = {
	hidden: { scale: 0.8, opacity: 0 },
	visible: {
		scale: 1,
		opacity: 1,
		transition: {
			type: 'spring' as const,
			stiffness: 100,
			damping: 15,
			duration: 0.5
		}
	}
}

const iconContinuousVariants = {
	animate: {
		y: [0, -8, 0],
		transition: {
			duration: 3,
			repeat: Infinity,
			ease: 'easeInOut' as const
		}
	}
}

const checkMarkVariants = {
	hidden: { scale: 0, opacity: 0 },
	visible: (index: number) => ({
		scale: 1,
		opacity: 1,
		transition: {
			delay: index * 0.1,
			type: 'spring' as const,
			stiffness: 200,
			damping: 15
		}
	})
}

function AnimatedIcon({ Icon, stepIndex }: { Icon: LucideIcon; stepIndex: number }) {
	const iconHoverVariants = {
		hover: {
			scale: 1.15,
			transition: {
				type: 'spring' as const,
				stiffness: 300,
				damping: 20
			}
		}
	}

	const getIconSpecificAnimation = () => {
		switch (stepIndex) {
			case 0:
				return {
					animate: {
						scale: [1, 1.05, 1],
						transition: {
							duration: 2,
							repeat: Infinity,
							ease: 'easeInOut' as const
						}
					}
				}
			case 1:
				return {
					animate: {
						boxShadow: [
							'0 0 4px rgba(59, 130, 246, 0.3)',
							'0 0 8px rgba(59, 130, 246, 0.6)',
							'0 0 4px rgba(59, 130, 246, 0.3)'
						],
						transition: {
							duration: 2,
							repeat: Infinity,
							ease: 'easeInOut' as const
						}
					}
				}
			case 2:
				return {
					whileHover: {
						rotate: 15,
						transition: {
							type: 'spring' as const,
							stiffness: 300,
							damping: 20
						}
					}
				}
			case 3:
				return {}
			default:
				return {}
		}
	}

	return (
		<div className="relative">
			<motion.div
				variants={iconContinuousVariants}
				{...getIconSpecificAnimation()}
				whileHover={iconHoverVariants.hover}
				className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-full flex items-center justify-center shadow-lg"
			>
				<Icon className="w-6 h-6" />
			</motion.div>
		</div>
	)
}

export function WorkflowSection() {
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
					<p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-mono">
						Intake → AI Analysis → Doctor Review/Edit → Final Summary
					</p>
				</motion.div>

				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
					<motion.div
						initial={{ scaleX: 0 }}
						whileInView={{ scaleX: 1 }}
						viewport={{ once: true }}
						transition={{ 
							duration: 1.2, 
							delay: 0.5,
							type: 'spring',
							stiffness: 50,
							damping: 20
						}}
						className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 dark:from-blue-800 dark:via-blue-600 dark:to-blue-800 overflow-hidden"
					>
						<motion.div
							animate={{
								x: ['-100%', '100%']
							}}
							transition={{
								duration: 3,
								repeat: Infinity,
								ease: 'linear'
							}}
							className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/3"
						/>
					</motion.div>
					
					<motion.div
						variants={containerVariants}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: '-50px' }}
						className="contents"
					>
						{WORKFLOW_STEPS.map((step, index) => {
							const Icon = step.icon
							return (
								<motion.div key={index} variants={stepVariants} className="relative">
									<motion.div
										whileHover={{ 
											y: -8,
											scale: 1.02,
											transition: { 
												type: 'spring',
												stiffness: 300,
												damping: 20
											} 
										}}
										className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-blue-100 dark:border-slate-700 relative z-10 h-full shadow-sm hover:shadow-xl dark:hover:shadow-blue-900/20 transition-shadow"
									>
										<div className="mb-4 relative">
											<motion.div
												initial={{ scale: 0.8, opacity: 0 }}
												whileInView={{ scale: 1, opacity: 1 }}
												viewport={{ once: true }}
												transition={{
													type: 'spring' as const,
													stiffness: 200,
													damping: 15,
													delay: 0.2
												}}
											>
												<AnimatedIcon Icon={Icon} stepIndex={index} />
											</motion.div>
										</div>
										<h3 className="text-base font-bold text-slate-900 dark:text-slate-50 mb-1">
											{step.title}
										</h3>
										<p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
											{step.description}
										</p>
										<ul className="space-y-2">
											{step.details.map((detail, detailIndex) => (
												<motion.li 
													key={detailIndex} 
													variants={checkMarkVariants}
													custom={detailIndex}
													initial="hidden"
													whileInView="visible"
													viewport={{ once: true }}
													className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"
												>
													<Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
													<span>{detail}</span>
												</motion.li>
											))}
										</ul>
									</motion.div>
								</motion.div>
							)
						})}
					</motion.div>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.8 }}
					className="mt-16 text-center"
				>
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium">
						<Check className="w-4 h-4" />
						Seamless integration with existing clinical workflows
					</div>
				</motion.div>
			</div>
		</section>
	)
}

