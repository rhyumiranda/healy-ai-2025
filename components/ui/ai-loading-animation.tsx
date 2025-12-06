'use client'

import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AILoadingAnimationProps {
	size?: 'sm' | 'md' | 'lg'
	className?: string
	label?: string
	sublabel?: string
}

export function AILoadingAnimation({
	size = 'md',
	className,
	label = 'AI is analyzing...',
	sublabel,
}: AILoadingAnimationProps) {
	const sizeClasses = {
		sm: 'h-8 w-8',
		md: 'h-12 w-12',
		lg: 'h-16 w-16',
	}

	const containerSizeClasses = {
		sm: 'h-16 w-16',
		md: 'h-24 w-24',
		lg: 'h-32 w-32',
	}

	return (
		<div className={cn('flex flex-col items-center gap-4', className)}>
			<div className={cn('relative', containerSizeClasses[size])}>
				<div className='absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-blue-500/20 animate-spin-slow' />
				<div className='absolute inset-2 rounded-full bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-blue-500/10 animate-spin-slow-reverse' />
				<div className='absolute inset-0 flex items-center justify-center'>
					<div className='relative'>
						<Sparkles
							className={cn(
								sizeClasses[size],
								'text-violet-500 animate-ai-sparkle'
							)}
						/>
						<div className='absolute inset-0 flex items-center justify-center'>
							<Sparkles
								className={cn(
									sizeClasses[size],
									'text-purple-400 animate-ai-sparkle-delayed opacity-50'
								)}
							/>
						</div>
					</div>
				</div>
				<div className='absolute -top-1 -right-1'>
					<span className='relative flex h-3 w-3'>
						<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75' />
						<span className='relative inline-flex rounded-full h-3 w-3 bg-violet-500' />
					</span>
				</div>
				<div className='absolute -bottom-1 -left-1'>
					<span className='relative flex h-2 w-2'>
						<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75 animation-delay-500' />
						<span className='relative inline-flex rounded-full h-2 w-2 bg-purple-500' />
					</span>
				</div>
			</div>

			{label && (
				<div className='text-center'>
					<p className='font-medium text-foreground animate-pulse'>{label}</p>
					{sublabel && (
						<p className='text-sm text-muted-foreground mt-1'>{sublabel}</p>
					)}
				</div>
			)}

			<div className='flex items-center gap-1'>
				<div className='h-2 w-2 rounded-full bg-violet-500 animate-bounce' style={{ animationDelay: '0ms' }} />
				<div className='h-2 w-2 rounded-full bg-purple-500 animate-bounce' style={{ animationDelay: '150ms' }} />
				<div className='h-2 w-2 rounded-full bg-blue-500 animate-bounce' style={{ animationDelay: '300ms' }} />
			</div>
		</div>
	)
}

export function AISparkleIcon({ className }: { className?: string }) {
	return (
		<div className={cn('relative inline-flex', className)}>
			<Sparkles className='h-5 w-5 text-violet-500 animate-ai-sparkle' />
			<Sparkles className='absolute inset-0 h-5 w-5 text-purple-400 animate-ai-sparkle-delayed opacity-40' />
		</div>
	)
}
