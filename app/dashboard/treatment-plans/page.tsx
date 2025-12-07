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
import { TreatmentPlansPageClient } from '@/components/treatment-plans/treatment-plans-page-client'
import { TreatmentPlanService } from '@/src/modules/treatment-plans/services/treatment-plan.service'
import type { TreatmentPlanFilters } from '@/src/modules/treatment-plans/types'

export const revalidate = 30

interface TreatmentPlansPageProps {
	searchParams: Promise<{
		search?: string
		status?: string
		riskLevel?: string
		patientId?: string
		page?: string
		pageSize?: string
		sortBy?: string
		sortOrder?: string
	}>
}

export default async function TreatmentPlansPage({ searchParams }: TreatmentPlansPageProps) {
	const params = await searchParams

	const filters: TreatmentPlanFilters = {
		search: params.search,
		status: (params.status as 'DRAFT' | 'APPROVED' | 'REJECTED' | 'ALL') || 'ALL',
		riskLevel: (params.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' | 'ALL') || 'ALL',
		patientId: params.patientId,
		page: params.page ? parseInt(params.page, 10) : 1,
		pageSize: params.pageSize ? parseInt(params.pageSize, 10) : 10,
		sortBy: (params.sortBy as 'createdAt' | 'updatedAt' | 'patientName' | 'status') || 'createdAt',
		sortOrder: (params.sortOrder as 'asc' | 'desc') || 'desc',
	}

	let data
	let error: string | null = null

	try {
		data = await TreatmentPlanService.getTreatmentPlansServer(filters)
	} catch (err) {
		error = err instanceof Error ? err.message : 'Failed to load treatment plans'
		data = {
			plans: [],
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
					<Separator orientation='vertical' className='mr-2 data-[orientation=vertical]:h-4' />
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem className='hidden md:block'>
								<BreadcrumbLink href='/dashboard'>Dashboard</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className='hidden md:block' />
							<BreadcrumbItem>
								<BreadcrumbPage>Treatment Plans</BreadcrumbPage>
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
					<TreatmentPlansPageClient initialData={data} initialFilters={filters} />
				)}
			</div>
		</>
	)
}
