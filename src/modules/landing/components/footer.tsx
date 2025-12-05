'use client'

import Link from 'next/link'
import { Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { FOOTER_LINKS } from '../constants'

export function Footer() {
	return (
		<footer className="border-t border-slate-100 py-12 px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="flex flex-col md:flex-row items-center justify-between gap-4"
				>
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
							<Shield className="w-5 h-5 text-white" />
						</div>
						<span className="text-lg font-semibold text-slate-900">MedAssist AI</span>
					</div>
					<p className="text-sm text-slate-600">
						© 2025 MedAssist AI. All rights reserved.
					</p>
					<div className="flex items-center gap-6 text-sm text-slate-600">
						{FOOTER_LINKS.map((link, index) => (
							<Link
								key={index}
								href={link.href}
								className="hover:text-slate-900 transition-colors"
							>
								{link.label}
							</Link>
						))}
					</div>
				</motion.div>
			</div>
		</footer>
	)
}

