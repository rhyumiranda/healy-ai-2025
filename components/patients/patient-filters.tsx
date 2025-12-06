'use client'

import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import type { PatientFilters as FilterType } from '@/src/modules/patients'

interface PatientFiltersProps {
	filters: FilterType
	onFilterChange: (filters: Partial<FilterType>) => void
}

export function PatientFilters({ filters, onFilterChange }: PatientFiltersProps) {
	return (
		<div className='flex items-center gap-3'>
			<div className='relative flex-1 max-w-sm'>
				<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
				<Input
					placeholder='Search patients...'
					value={filters.search || ''}
					onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
					className='pl-9 h-9'
				/>
			</div>

			<Select
				value={filters.gender || 'all'}
				onValueChange={(value) =>
					onFilterChange({
						gender: value === 'all' ? undefined : (value as 'MALE' | 'FEMALE' | 'OTHER'),
						page: 1,
					})
				}
			>
				<SelectTrigger className='w-[130px] h-9'>
					<SlidersHorizontal className='h-4 w-4 mr-2' />
					<SelectValue placeholder='Gender' />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value='all'>All Genders</SelectItem>
					<SelectItem value='MALE'>Male</SelectItem>
					<SelectItem value='FEMALE'>Female</SelectItem>
					<SelectItem value='OTHER'>Other</SelectItem>
				</SelectContent>
			</Select>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant='outline' size='sm' className='h-9'>
						<ArrowUpDown className='h-4 w-4 mr-2' />
						Sort
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end' className='w-48'>
					<DropdownMenuLabel>Sort by</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuRadioGroup
						value={`${filters.sortBy || 'updatedAt'}-${filters.sortOrder || 'desc'}`}
						onValueChange={(value) => {
							const [sortBy, sortOrder] = value.split('-') as [
								'name' | 'createdAt' | 'updatedAt',
								'asc' | 'desc'
							]
							onFilterChange({ sortBy, sortOrder })
						}}
					>
						<DropdownMenuRadioItem value='name-asc'>
							Name (A-Z)
						</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value='name-desc'>
							Name (Z-A)
						</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value='updatedAt-desc'>
							Recently Updated
						</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value='createdAt-desc'>
							Recently Added
						</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value='createdAt-asc'>
							Oldest First
						</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}

