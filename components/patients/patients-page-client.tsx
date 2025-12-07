'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { PatientFilters, PatientsResponse } from '@/src/modules/patients/types'
import {
	PatientTable,
	PatientFilters as PatientFiltersComponent,
	PatientPagination,
} from '@/components/patients'

interface PatientsPageClientProps {
	initialData: PatientsResponse
	initialFilters: PatientFilters
}

export function PatientsPageClient({ initialData, initialFilters }: PatientsPageClientProps) {
	const router = useRouter()
	const [filters, setFilters] = useState<PatientFilters>(initialFilters)
	const [isRefreshing, setIsRefreshing] = useState(false)

	const updateFilters = (newFilters: Partial<PatientFilters>) => {
		const updatedFilters = { ...filters, ...newFilters }
		setFilters(updatedFilters)

		const params = new URLSearchParams()
		if (updatedFilters.search) params.set('search', updatedFilters.search)
		if (updatedFilters.gender) params.set('gender', updatedFilters.gender)
		if (updatedFilters.sortBy) params.set('sortBy', updatedFilters.sortBy)
		if (updatedFilters.sortOrder) params.set('sortOrder', updatedFilters.sortOrder)
		if (updatedFilters.page && updatedFilters.page > 1) params.set('page', updatedFilters.page.toString())
		if (updatedFilters.pageSize && updatedFilters.pageSize !== 10) params.set('pageSize', updatedFilters.pageSize.toString())

		router.push(`/dashboard/patients?${params.toString()}`)
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
					<h1 className='text-2xl font-semibold tracking-tight'>Patients</h1>
					<p className='text-sm text-muted-foreground'>
						Manage patient records and medical histories
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
						<RefreshCw
							className={`h-4 w-4 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
						/>
						<span className='hidden sm:inline'>Refresh</span>
					</Button>
					<Link href='/dashboard/patients/new' className='flex-1 sm:flex-none'>
						<Button size='sm' className='w-full'>
							<Plus className='h-4 w-4 sm:mr-2' />
							<span className='hidden sm:inline'>Add Patient</span>
							<span className='sm:hidden'>Add</span>
						</Button>
					</Link>
				</div>
			</div>

			<PatientFiltersComponent filters={filters} onFilterChange={updateFilters} />

			<PatientTable patients={initialData.patients} isLoading={isRefreshing} />

			<PatientPagination
				page={initialData.page}
				totalPages={initialData.totalPages}
				total={initialData.total}
				pageSize={initialData.pageSize}
				onPageChange={(newPage) => updateFilters({ page: newPage })}
			/>
		</>
	)
}

