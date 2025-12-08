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
import { PatientsPageClient } from '@/components/patients/patients-page-client'
import { PatientService } from '@/src/modules/patients/services/patient.service'
import type { PatientFilters } from '@/src/modules/patients/types'

interface PatientsPageProps {
	searchParams: Promise<{
		search?: string
		gender?: string
		sortBy?: string
		sortOrder?: string
		page?: string
		pageSize?: string
	}>
}

export default async function PatientsPage({ searchParams }: PatientsPageProps) {
	const params = await searchParams

	const filters: PatientFilters = {
		search: params.search,
		gender: params.gender as 'MALE' | 'FEMALE' | 'OTHER' | undefined,
		sortBy: (params.sortBy as 'name' | 'createdAt' | 'updatedAt') || 'updatedAt',
		sortOrder: (params.sortOrder as 'asc' | 'desc') || 'desc',
		page: params.page ? parseInt(params.page, 10) : 1,
		pageSize: params.pageSize ? parseInt(params.pageSize, 10) : 10,
	}

	let data
	let error: string | null = null

	try {
		data = await PatientService.getPatientsServer(filters)
	} catch (err) {
		error = err instanceof Error ? err.message : 'Failed to load patients'
		data = {
			patients: [],
			total: 0,
			page: 1,
			pageSize: 10,
			totalPages: 0,
		}
	}

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
				{error ? (
					<div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4'>
						<p className='text-sm text-destructive'>{error}</p>
					</div>
				) : (
					<PatientsPageClient initialData={data} initialFilters={filters} />
				)}
			</div>
		</>
	)
}
