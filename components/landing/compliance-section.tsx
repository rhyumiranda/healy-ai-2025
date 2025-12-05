'use client'

import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { COMPLIANCE_FEATURES } from './constants'

const containerVariants = {
	hidden: { opacity: 0, y: 40 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.6,
			staggerChildren: 0.1
		}
	}
}

const itemVariants = {
	hidden: { x: -20, opacity: 0 },
	visible: {
		x: 0,
		opacity: 1,
		transition: {
			duration: 0.4
		}
	}
}

export function ComplianceSection() {
	return (
		<section className="py-20 px-6 lg:px-8 bg-slate-50">
			<div className="max-w-7xl mx-auto">
				<div className="max-w-4xl mx-auto">
					<motion.div
						variants={containerVariants}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: '-100px' }}
						className="bg-white rounded-2xl p-8 lg:p-12 border border-slate-200"
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
							className="flex items-start gap-4 mb-8"
						>
							<div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
								<AlertTriangle className="w-6 h-6 text-red-600" />
							</div>
							<div>
								<h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
									Built for Safety & Compliance
								</h2>
								<p className="text-slate-600">
									Enterprise-grade security and compliance standards for healthcare
								</p>
							</div>
						</motion.div>

						<motion.div
							variants={containerVariants}
							className="grid md:grid-cols-2 gap-6"
						>
							{COMPLIANCE_FEATURES.map((feature, index) => (
								<motion.div
									key={index}
									variants={itemVariants}
									whileHover={{ x: 4 }}
									className="flex items-start gap-3"
								>
									<CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
									<div>
										<div className="font-semibold text-slate-900 mb-1">{feature.title}</div>
										<p className="text-sm text-slate-600">{feature.description}</p>
									</div>
								</motion.div>
							))}
						</motion.div>
					</motion.div>
				</div>
			</div>
		</section>
	)
}

