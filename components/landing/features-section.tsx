'use client'

import { motion } from 'framer-motion'
import { FEATURES } from './constants'

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.2
		}
	}
}

const cardVariants = {
	hidden: { y: 50, opacity: 0 },
	visible: {
		y: 0,
		opacity: 1,
		transition: {
			duration: 0.6,
			ease: [0.25, 0.1, 0.25, 1] as const
		}
	}
}

export function FeaturesSection() {
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
						Intelligent Safety at Every Step
					</h2>
					<p className="text-lg text-slate-600 max-w-2xl mx-auto">
						Comprehensive risk assessment and decision support powered by advanced AI
					</p>
				</motion.div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: '-50px' }}
					className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
				>
					{FEATURES.map((feature, index) => {
						const Icon = feature.icon
						return (
							<motion.div
								key={index}
								variants={cardVariants}
								whileHover={{ y: -8, transition: { duration: 0.3 } }}
								className="bg-white rounded-xl p-6 border border-slate-100 hover:shadow-lg transition-shadow"
							>
								<div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
									<Icon className={`w-6 h-6 ${feature.iconColor}`} />
								</div>
								<h3 className="text-lg font-semibold text-slate-900 mb-2">
									{feature.title}
								</h3>
								<p className="text-sm text-slate-600">
									{feature.description}
								</p>
							</motion.div>
						)
					})}
				</motion.div>
			</div>
		</section>
	)
}

