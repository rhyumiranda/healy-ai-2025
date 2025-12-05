'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PatientPaginationProps {
	page: number
	totalPages: number
	total: number
	pageSize: number
	onPageChange: (page: number) => void
}

export function PatientPagination({
	page,
	totalPages,
	total,
	pageSize,
	onPageChange,
}: PatientPaginationProps) {
	const start = (page - 1) * pageSize + 1
	const end = Math.min(page * pageSize, total)

	if (total === 0) return null

	return (
		<div className='flex items-center justify-between'>
			<p className='text-sm text-muted-foreground'>
				Showing <span className='font-medium'>{start}</span> to{' '}
				<span className='font-medium'>{end}</span> of{' '}
				<span className='font-medium'>{total}</span> patients
			</p>
			<div className='flex items-center gap-2'>
				<Button
					variant='outline'
					size='sm'
					onClick={() => onPageChange(page - 1)}
					disabled={page <= 1}
				>
					<ChevronLeft className='h-4 w-4 mr-1' />
					Previous
				</Button>
				<div className='flex items-center gap-1'>
					{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
						let pageNum: number
						if (totalPages <= 5) {
							pageNum = i + 1
						} else if (page <= 3) {
							pageNum = i + 1
						} else if (page >= totalPages - 2) {
							pageNum = totalPages - 4 + i
						} else {
							pageNum = page - 2 + i
						}
						return (
							<Button
								key={pageNum}
								variant={pageNum === page ? 'default' : 'outline'}
								size='sm'
								className='w-8 h-8 p-0'
								onClick={() => onPageChange(pageNum)}
							>
								{pageNum}
							</Button>
						)
					})}
				</div>
				<Button
					variant='outline'
					size='sm'
					onClick={() => onPageChange(page + 1)}
					disabled={page >= totalPages}
				>
					Next
					<ChevronRight className='h-4 w-4 ml-1' />
				</Button>
			</div>
		</div>
	)
}
