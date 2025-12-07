'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { TreatmentPlanFilters, TreatmentPlansResponse } from '@/src/modules/treatment-plans/types'
import {
	TreatmentPlanTable,
	TreatmentPlanFilters as TreatmentPlanFiltersComponent,
	TreatmentPlanPagination,
} from '@/components/treatment-plans'

interface TreatmentPlansPageClientProps {
	initialData: TreatmentPlansResponse
	initialFilters: TreatmentPlanFilters
}

export function TreatmentPlansPageClient({ initialData, initialFilters }: TreatmentPlansPageClientProps) {
	const router = useRouter()
	const [filters, setFilters] = useState<TreatmentPlanFilters>(initialFilters)
	const [isRefreshing, setIsRefreshing] = useState(false)

	const updateFilters = (newFilters: TreatmentPlanFilters) => {
		setFilters(newFilters)

		const params = new URLSearchParams()
		if (newFilters.search) params.set('search', newFilters.search)
		if (newFilters.status && newFilters.status !== 'ALL') params.set('status', newFilters.status)
		if (newFilters.riskLevel && newFilters.riskLevel !== 'ALL') params.set('riskLevel', newFilters.riskLevel)
		if (newFilters.patientId) params.set('patientId', newFilters.patientId)
		if (newFilters.page && newFilters.page > 1) params.set('page', newFilters.page.toString())
		if (newFilters.pageSize && newFilters.pageSize !== 10) params.set('pageSize', newFilters.pageSize.toString())
		if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy)
		if (newFilters.sortOrder) params.set('sortOrder', newFilters.sortOrder)

		router.push(`/dashboard/treatment-plans?${params.toString()}`)
	}

	const refetch = async () => {
		setIsRefreshing(true)
		router.refresh()
		setTimeout(() => setIsRefreshing(false), 500)
	}

	return (
		<>
			<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<h1 className='text-2xl font-semibold tracking-tight'>Treatment Plans</h1>
					<p className='text-sm text-muted-foreground'>
						View and manage patient treatment plans
					</p>
				</div>
				<div className='flex items-center gap-2 w-full sm:w-auto'>
					<Button
						variant='outline'
						size='sm'
						onClick={refetch}
						disabled={isRefreshing}
						className='flex-1 sm:flex-none'
					>
						<RefreshCw className={`h-4 w-4 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
						<span className='hidden sm:inline'>Refresh</span>
					</Button>
					<Link href='/dashboard/treatment-plans/new' className='flex-1 sm:flex-none'>
						<Button size='sm' className='w-full'>
							<Plus className='h-4 w-4 sm:mr-2' />
							<span className='hidden sm:inline'>New Treatment Plan</span>
							<span className='sm:hidden'>New Plan</span>
						</Button>
					</Link>
				</div>
			</div>

			<TreatmentPlanFiltersComponent filters={filters} onFiltersChange={updateFilters} />

			<TreatmentPlanTable plans={initialData.plans} isLoading={isRefreshing} />

			<TreatmentPlanPagination
				page={initialData.page}
				totalPages={initialData.totalPages}
				total={initialData.total}
				pageSize={initialData.pageSize}
				onPageChange={(newPage) => updateFilters({ ...filters, page: newPage })}
			/>
		</>
	)
}

