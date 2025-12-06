'use client'

import { Button } from '@/components/ui/button'
import type { SeverityLevel } from '@/src/modules/treatment-plans'

interface SeverityScaleProps {
	value?: SeverityLevel
	onChange: (level: SeverityLevel) => void
}

const SEVERITY_OPTIONS: { value: SeverityLevel; label: string; color: string }[] = [
	{ value: 'LOW', label: 'Low', color: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' },
	{ value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200' },
	{ value: 'HIGH', label: 'High', color: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' },
]

export function SeverityScale({ value, onChange }: SeverityScaleProps) {
	return (
		<div className='flex gap-2'>
			{SEVERITY_OPTIONS.map((option) => (
				<Button
					key={option.value}
					type='button'
					variant='outline'
					size='sm'
					className={`flex-1 ${value === option.value ? option.color : ''}`}
					onClick={() => onChange(option.value)}
				>
					{option.label}
				</Button>
			))}
		</div>
	)
}
