'use client'

import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { AuroraBackground } from '@/components/aurora-background'
import { NAV_LINKS } from './constants'

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.3
		}
	}
}

const itemVariants = {
	hidden: { y: 20, opacity: 0 },
	visible: {
		y: 0,
		opacity: 1,
		transition: {
			duration: 0.6,
			ease: [0.25, 0.1, 0.25, 1] as const
		}
	}
}

export function HeroSection() {
	return (
		<AuroraBackground showRadialGradient={false} className="relative h-screen">
			<section className="relative h-full px-6 lg:px-8 flex items-center">
				<div className="max-w-7xl mx-auto w-full relative z-10">
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						className="max-w-3xl mx-auto text-center"
					>
						<motion.div variants={itemVariants}>
							<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/90 dark:bg-blue-900/90 backdrop-blur-sm text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
								<Zap className="w-4 h-4" />
								Reduce medical errors by up to 80%
							</div>
						</motion.div>
						
						<motion.h1
							variants={itemVariants}
							className="text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-50 tracking-tight mb-6"
						>
							AI-Powered Clinical Decision Support
						</motion.h1>
						
						<motion.p
							variants={itemVariants}
							className="text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed"
						>
							Intelligent treatment plan recommendations with automated safety checks. 
							Flag drug interactions, contraindications, and dosage issues before they become critical.
						</motion.p>
						
						<motion.div
							variants={itemVariants}
							className="flex flex-col sm:flex-row items-center justify-center gap-4"
						>
							<Link
								href={NAV_LINKS.register}
								className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-blue-900/50 flex items-center justify-center gap-2"
							>
								Start Free Trial
								<ArrowRight className="w-5 h-5" />
							</Link>
							<button className="w-full sm:w-auto px-8 py-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-white dark:hover:bg-slate-800 transition-colors">
								Watch Demo
							</button>
						</motion.div>
						
						<motion.p
							variants={itemVariants}
							className="text-sm text-slate-500 dark:text-slate-400 mt-6"
						>
							No credit card required • Free 14-day trial • Cancel anytime
						</motion.p>
					</motion.div>
				</div>
			</section>
		</AuroraBackground>
	)
}

