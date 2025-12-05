'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PasswordInputProps {
	id: string
	value: string
	onChange: (value: string) => void
	placeholder?: string
	className?: string
	disabled?: boolean
	autoComplete?: string
}

export function PasswordInput({
	id,
	value,
	onChange,
	placeholder = 'Enter password',
	className,
	disabled = false,
	autoComplete = 'new-password',
}: PasswordInputProps) {
	const [showPassword, setShowPassword] = useState(false)

	return (
		<div className='relative'>
			<Input
				id={id}
				type={showPassword ? 'text' : 'password'}
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className={cn('pr-10', className)}
				disabled={disabled}
				autoComplete={autoComplete}
			/>
			<button
				type='button'
				onClick={() => setShowPassword(!showPassword)}
				disabled={disabled}
				className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded'
				aria-label={showPassword ? 'Hide password' : 'Show password'}
			>
				{showPassword ? (
					<EyeOff className='h-4 w-4' />
				) : (
					<Eye className='h-4 w-4' />
				)}
			</button>
		</div>
	)
}

interface PasswordInputProps {
	id: string
	value: string
	onChange: (value: string) => void
	placeholder?: string
	className?: string
	disabled?: boolean
	autoComplete?: string
}
