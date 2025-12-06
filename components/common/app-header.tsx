'use client'

import Link from 'next/link'
import { Shield, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AppHeaderProps {
	variant?: 'landing' | 'auth'
	showBackButton?: boolean
	backButtonHref?: string
	backButtonLabel?: string
}

export function AppHeader({
	variant = 'landing',
	showBackButton = false,
	backButtonHref = '/',
	backButtonLabel = 'Back to Home',
}: AppHeaderProps) {
	const isLanding = variant === 'landing'

	return (
		<motion.header
			initial={{ y: -100, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.6, ease: 'easeOut' }}
			className={cn(
				'w-full z-50 border-b',
				isLanding
					? 'fixed top-0 bg-white/60 backdrop-blur-xl border-white/20 shadow-sm shadow-slate-100/50'
					: 'bg-white border-slate-200'
			)}
		>
			<div className="max-w-7xl mx-auto px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					<motion.div
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ delay: 0.2, duration: 0.4 }}
						className="flex items-center gap-2"
					>
						<Link
							href="/"
							className="flex items-center gap-2 transition-opacity hover:opacity-80"
						>
							<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
								<Shield className="w-5 h-5 text-white" />
							</div>
							<span className="text-lg font-semibold text-slate-900">
								HealyAI
							</span>
						</Link>
					</motion.div>

					<motion.div
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ delay: 0.3, duration: 0.4 }}
						className="flex items-center gap-6"
					>
						{showBackButton && (
							<Link
								href={backButtonHref}
								className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
							>
								<ArrowLeft className="h-4 w-4" />
								{backButtonLabel}
							</Link>
						)}

						{isLanding && (
							<>
								<Link
									href="/auth/login"
									className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
								>
									Sign In
								</Link>
								<Link
									href="/auth/register"
									className="text-sm font-medium px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
								>
									Get Started
								</Link>
							</>
						)}
					</motion.div>
				</div>
			</div>
		</motion.header>
	)
}
