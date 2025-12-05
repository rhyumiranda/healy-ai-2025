'use client'

import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PasswordValidation, PasswordStrength } from '../types'
import { validatePassword, getPasswordStrength } from '../utils/validation'

interface PasswordStrengthIndicatorProps {
	password: string
}

const strengthConfig: Record<
	PasswordStrength,
	{ label: string; color: string; barColor: string }
> = {
	weak: {
		label: 'Weak',
		color: 'text-red-600',
		barColor: 'bg-red-600',
	},
	medium: {
		label: 'Medium',
		color: 'text-orange-600',
		barColor: 'bg-orange-600',
	},
	strong: {
		label: 'Strong',
		color: 'text-blue-600',
		barColor: 'bg-blue-600',
	},
	'very-strong': {
		label: 'Very Strong',
		color: 'text-green-600',
		barColor: 'bg-green-600',
	},
}

export function PasswordStrengthIndicator({
	password,
}: PasswordStrengthIndicatorProps) {
	if (!password) return null

	const validation = validatePassword(password)
	const strength = getPasswordStrength(password)
	const config = strengthConfig[strength]

	const requirements: Array<{
		key: keyof PasswordValidation
		label: string
	}> = [
		{ key: 'hasMinLength', label: 'At least 8 characters' },
		{ key: 'hasUpperCase', label: 'One uppercase letter' },
		{ key: 'hasLowerCase', label: 'One lowercase letter' },
		{ key: 'hasNumber', label: 'One number' },
		{ key: 'hasSpecialChar', label: 'One special character' },
	]

	const validCount = Object.values(validation).filter(Boolean).length
	const strengthPercentage = (validCount / requirements.length) * 100

	return (
		<div className="space-y-3">
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<span className="text-xs font-medium text-muted-foreground">
						Password strength
					</span>
					<span className={cn('text-xs font-semibold', config.color)}>
						{config.label}
					</span>
				</div>
				<div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
					<div
						className={cn(
							'h-full transition-all duration-300',
							config.barColor
						)}
						style={{ width: `${strengthPercentage}%` }}
					/>
				</div>
			</div>

			<div className="space-y-1.5">
				{requirements.map(({ key, label }) => {
					const isValid = validation[key]
					return (
						<div key={key} className="flex items-center gap-2">
							{isValid ? (
								<CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
							) : (
								<Circle className="h-3.5 w-3.5 text-muted-foreground/50" />
							)}
							<span
								className={cn(
									'text-xs',
									isValid
										? 'text-muted-foreground'
										: 'text-muted-foreground/70'
								)}
							>
								{label}
							</span>
						</div>
					)
				})}
			</div>
		</div>
	)
}
