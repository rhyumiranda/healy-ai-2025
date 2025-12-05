'use client'

import { motion } from 'framer-motion'
import { STATS } from '../constants'
import { AnimatedCounter } from './animated-counter'

const containerVariants = {
	hidden: { opacity: 0, y: 40 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.8,
			ease: [0.25, 0.1, 0.25, 1] as const,
			staggerChildren: 0.15
		}
	}
}

const statVariants = {
	hidden: { scale: 0.9, opacity: 0, y: 20 },
	visible: {
		scale: 1,
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.6,
			ease: [0.25, 0.1, 0.25, 1] as const
		}
	}
}

export function StatsSection() {
	return (
		<div className="max-w-7xl mx-auto px-6 lg:px-8">
			<motion.div
				variants={containerVariants}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, margin: '-100px' }}
				className="mt-20 rounded-2xl bg-white/50 backdrop-blur-sm p-10 md:p-12 shadow-lg shadow-slate-100/50"
			>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
					{STATS.map((stat, index) => (
						<motion.div 
							key={index} 
							variants={statVariants}
							className="text-center space-y-3"
						>
							<div className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight">
								<AnimatedCounter 
									value={stat.numericValue} 
									suffix={stat.suffix}
									duration={2500}
								/>
							</div>
							<div className="text-base font-semibold text-slate-700">
								{stat.label}
							</div>
							<p className="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
								{stat.description}
							</p>
						</motion.div>
					))}
				</div>
			</motion.div>
		</div>
	)
}

