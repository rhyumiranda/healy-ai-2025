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
import { ActivityPageClient } from '@/components/audit/activity-page-client'
import { AuditService } from '@/src/modules/audit/services/audit.service'
import type { AuditFilters } from '@/src/modules/audit/types'

interface ActivityPageProps {
	searchParams: Promise<{
		search?: string
		eventType?: string
		severity?: string
		startDate?: string
		endDate?: string
		success?: string
		patientId?: string
		sortOrder?: string
		page?: string
		pageSize?: string
	}>
}

export default async function ActivityPage({ searchParams }: ActivityPageProps) {
	const params = await searchParams

	const filters: AuditFilters = {
		search: params.search,
		eventType: (params.eventType as AuditFilters['eventType']) || 'ALL',
		severity: (params.severity as AuditFilters['severity']) || 'ALL',
		startDate: params.startDate,
		endDate: params.endDate,
		success: params.success === 'true' ? true : params.success === 'false' ? false : 'ALL',
		patientId: params.patientId,
		sortOrder: (params.sortOrder as 'asc' | 'desc') || 'desc',
		page: params.page ? parseInt(params.page, 10) : 1,
		pageSize: params.pageSize ? parseInt(params.pageSize, 10) : 20,
	}

	let logsData
	let statsData
	let error: string | null = null

	try {
		[logsData, statsData] = await Promise.all([
			AuditService.getAuditLogsServer(filters),
			AuditService.getAuditStatsServer(filters.startDate, filters.endDate).catch(() => null),
		])
	} catch (err) {
		error = err instanceof Error ? err.message : 'Failed to load activity logs'
		logsData = {
			logs: [],
			total: 0,
			page: 1,
			pageSize: 20,
			totalPages: 0,
		}
		statsData = null
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
								<BreadcrumbLink href='/dashboard'>
									HealyAI
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className='hidden md:block' />
							<BreadcrumbItem>
								<BreadcrumbPage>Activity Log</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>

			<div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
				{error ? (
					<div className='rounded-md border border-red-200 bg-red-50 p-4 text-red-800'>
						Failed to load activity logs. Please try again.
					</div>
				) : (
					<ActivityPageClient
						initialLogsData={logsData}
						initialStatsData={statsData}
						initialFilters={filters}
					/>
				)}
			</div>
		</>
	)
}
