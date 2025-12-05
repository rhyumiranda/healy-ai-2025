'use client'

import { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface TagInputProps {
	value: string[]
	onChange: (tags: string[]) => void
	placeholder?: string
	disabled?: boolean
}

export function TagInput({
	value,
	onChange,
	placeholder = 'Type and press Enter',
	disabled = false,
}: TagInputProps) {
	const [inputValue, setInputValue] = useState('')

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && inputValue.trim()) {
			e.preventDefault()
			if (!value.includes(inputValue.trim())) {
				onChange([...value, inputValue.trim()])
			}
			setInputValue('')
		} else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
			onChange(value.slice(0, -1))
		}
	}

	const removeTag = (tagToRemove: string) => {
		onChange(value.filter((tag) => tag !== tagToRemove))
	}

	return (
		<div className='space-y-2'>
			<div className='flex flex-wrap gap-1.5'>
				{value.map((tag) => (
					<Badge
						key={tag}
						variant='secondary'
						className='gap-1 pr-1 font-normal'
					>
						{tag}
						<button
							type='button'
							onClick={() => removeTag(tag)}
							disabled={disabled}
							className='ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors'
						>
							<X className='h-3 w-3' />
						</button>
					</Badge>
				))}
			</div>
			<Input
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				disabled={disabled}
				className='h-9'
			/>
		</div>
	)
}
