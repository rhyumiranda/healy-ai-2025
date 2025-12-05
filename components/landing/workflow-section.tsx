'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { WORKFLOW_STEPS } from './constants'

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
			duration: 0.5,
			ease: [0.25, 0.1, 0.25, 1] as const
		}
	}
}

export function WorkflowSection() {
	return (
		<section className="py-20 px-6 lg:px-8 bg-slate-50">
			<div className="max-w-7xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center mb-16"
				>
					<h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
						How It Works
					</h2>
					<p className="text-lg text-slate-600 max-w-2xl mx-auto">
						A streamlined clinical workflow from patient intake to final treatment decision
					</p>
					<p className="text-sm text-slate-500 mt-2 font-mono">
						Intake → AI Analysis → Doctor Review/Edit → Final Summary
					</p>
				</motion.div>

				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
					<motion.div
						initial={{ scaleX: 0 }}
						whileInView={{ scaleX: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 1, delay: 0.5 }}
						className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200"
					/>
					
					<motion.div
						variants={containerVariants}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: '-50px' }}
						className="contents"
					>
						{WORKFLOW_STEPS.map((step, index) => (
							<motion.div key={index} variants={stepVariants} className="relative">
								<motion.div
									whileHover={{ y: -8, transition: { duration: 0.3 } }}
									className="bg-white rounded-xl p-6 border-2 border-blue-100 relative z-10 h-full shadow-sm hover:shadow-md transition-shadow"
								>
									<motion.div
										whileHover={{ scale: 1.1, rotate: 360 }}
										transition={{ duration: 0.6 }}
										className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4"
									>
										{step.step}
									</motion.div>
									<h3 className="text-base font-bold text-slate-900 mb-1">
										{step.title}
									</h3>
									<p className="text-sm text-slate-600 mb-4">
										{step.description}
									</p>
									<ul className="space-y-2">
										{step.details.map((detail, detailIndex) => (
											<li key={detailIndex} className="flex items-start gap-2 text-xs text-slate-600">
												<Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
												<span>{detail}</span>
											</li>
										))}
									</ul>
								</motion.div>
							</motion.div>
						))}
					</motion.div>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.8 }}
					className="mt-16 text-center"
				>
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
						<Check className="w-4 h-4" />
						Seamless integration with existing clinical workflows
					</div>
				</motion.div>
			</div>
		</section>
	)
}

