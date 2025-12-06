'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface TreatmentPlanPaginationProps {
	page: number
	pageSize: number
	total: number
	totalPages: number
	onPageChange: (page: number) => void
}

export function TreatmentPlanPagination({
	page,
	pageSize,
	total,
	totalPages,
	onPageChange,
}: TreatmentPlanPaginationProps) {
	const startItem = (page - 1) * pageSize + 1
	const endItem = Math.min(page * pageSize, total)

	if (total === 0) {
		return null
	}

	return (
		<div className="flex items-center justify-between px-2 py-4">
			<p className="text-sm text-muted-foreground">
				Showing {startItem} to {endItem} of {total} treatment plans
			</p>

			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(page - 1)}
					disabled={page <= 1}
				>
					<ChevronLeft className="h-4 w-4" />
					Previous
				</Button>

				<div className="flex items-center gap-1">
					{Array.from({ length: totalPages }, (_, i) => i + 1)
						.filter((p) => {
							if (totalPages <= 7) return true
							if (p === 1 || p === totalPages) return true
							if (p >= page - 1 && p <= page + 1) return true
							return false
						})
						.map((p, i, arr) => {
							const showEllipsis = i > 0 && arr[i - 1] !== p - 1

							return (
								<div key={p} className="flex items-center gap-1">
									{showEllipsis && (
										<span className="px-2 text-muted-foreground">...</span>
									)}
									<Button
										variant={page === p ? 'default' : 'outline'}
										size="sm"
										onClick={() => onPageChange(p)}
										className="min-w-[36px]"
									>
										{p}
									</Button>
								</div>
							)
						})}
				</div>

				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(page + 1)}
					disabled={page >= totalPages}
				>
					Next
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	)
}
