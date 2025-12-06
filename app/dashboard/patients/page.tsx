'use client'

import Link from 'next/link'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCw } from 'lucide-react'
import { usePatients } from '@/src/modules/patients'
import {
	PatientTable,
	PatientFilters,
	PatientPagination,
} from '@/components/patients'

export default function PatientsPage() {
	const {
		patients,
		total,
		page,
		pageSize,
		totalPages,
		isLoading,
		error,
		filters,
		updateFilters,
		refetch,
	} = usePatients({ pageSize: 10 })

	return (
		<>
			<header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
				<div className='flex items-center gap-2 px-4'>
					<SidebarTrigger className='-ml-1' />
					<Separator
						orientation='vertical'
						className='mr-2 data-[orientation=vertical]:h-4'
					/>
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem className='hidden md:block'>
								<BreadcrumbLink href='/dashboard'>Dashboard</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className='hidden md:block' />
							<BreadcrumbItem>
								<BreadcrumbPage>Patients</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>

			<div className='flex flex-1 flex-col gap-6 p-4 pt-0'>
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
							disabled={isLoading}
							className='flex-1 sm:flex-none'
						>
							<RefreshCw
								className={`h-4 w-4 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`}
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

				<PatientFilters filters={filters} onFilterChange={updateFilters} />

				{error && (
					<div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4'>
						<p className='text-sm text-destructive'>{error}</p>
					</div>
				)}

				<PatientTable patients={patients} isLoading={isLoading} />

				<PatientPagination
					page={page}
					totalPages={totalPages}
					total={total}
					pageSize={pageSize}
					onPageChange={(newPage) => updateFilters({ page: newPage })}
				/>
			</div>
		</>
	)
}
