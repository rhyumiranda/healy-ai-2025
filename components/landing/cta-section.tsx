'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { NAV_LINKS } from './constants'

export function CtaSection() {
	return (
		<section className="py-20 px-6 lg:px-8">
			<motion.div
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6 }}
				className="max-w-4xl mx-auto text-center"
			>
				<motion.h2
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2, duration: 0.6 }}
					className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6"
				>
					Ready to Reduce Medical Errors?
				</motion.h2>
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.3, duration: 0.6 }}
					className="text-lg text-slate-600 mb-10"
				>
					Join leading healthcare professionals using AI-powered clinical decision support
				</motion.p>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.4, duration: 0.6 }}
					className="flex flex-col sm:flex-row items-center justify-center gap-4"
				>
					<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
						<Link
							href={NAV_LINKS.register}
							className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2"
						>
							Start Free Trial
							<ArrowRight className="w-5 h-5" />
						</Link>
					</motion.div>
					<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
						<Link
							href={NAV_LINKS.login}
							className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
						>
							Sign In
						</Link>
					</motion.div>
				</motion.div>
			</motion.div>
		</section>
	)
}

