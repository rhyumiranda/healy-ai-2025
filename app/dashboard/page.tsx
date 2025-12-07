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
import { DashboardContentClient } from '@/components/dashboard/dashboard-content-client'
import { DashboardService } from '@/src/modules/dashboard/services/dashboard.service'
import type { DashboardStats, RecentActivity } from '@/src/modules/dashboard/types'
import { AlertTriangle } from 'lucide-react'

export const revalidate = 30

export default async function DashboardPage() {
	let stats: DashboardStats
	let recentActivity: RecentActivity[]
	let error: string | null = null

	try {
		const data = await DashboardService.getDashboardStatsServer()
		stats = data.stats
		recentActivity = data.recentActivity
	} catch (err) {
		error = err instanceof Error ? err.message : 'Failed to load dashboard data'
		stats = {
			totalPatients: 0,
			patientChange: 0,
			activeTreatmentPlans: 0,
			planChange: 0,
			safetyAlerts: 0,
		}
		recentActivity = []
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
								<BreadcrumbPage>Dashboard</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>
			<div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
				<div className='space-y-2'>
					<h2 className='text-2xl sm:text-3xl font-bold tracking-tight'>Dashboard</h2>
					<p className='text-muted-foreground text-sm sm:text-base'>
						Welcome back! Here&apos;s an overview of your practice.
					</p>
				</div>

				{error ? (
					<div className='flex flex-col items-center justify-center p-8 text-center'>
						<AlertTriangle className='h-12 w-12 text-destructive mb-4' />
						<h3 className='text-lg font-semibold'>Failed to load dashboard</h3>
						<p className='text-muted-foreground'>{error}</p>
					</div>
				) : (
					<DashboardContentClient stats={stats} recentActivity={recentActivity} />
				)}
			</div>
		</>
	)
}
