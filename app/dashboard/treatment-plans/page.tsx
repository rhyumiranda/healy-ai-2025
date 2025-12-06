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
import { useTreatmentPlans } from '@/src/modules/treatment-plans'
import {
	TreatmentPlanTable,
	TreatmentPlanFilters,
	TreatmentPlanPagination,
} from '@/components/treatment-plans'

export default function TreatmentPlansPage() {
	const {
		plans,
		total,
		page,
		pageSize,
		totalPages,
		isLoading,
		error,
		filters,
		setFilters,
		refetch,
	} = useTreatmentPlans({ pageSize: 10 })

	return (
		<>
			<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
				<div className="flex items-center gap-2 px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem className="hidden md:block">
								<BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className="hidden md:block" />
							<BreadcrumbItem>
								<BreadcrumbPage>Treatment Plans</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>

			<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-semibold tracking-tight">Treatment Plans</h1>
						<p className="text-sm text-muted-foreground">
							View and manage patient treatment plans
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={refetch}
							disabled={isLoading}
						>
							<RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
							Refresh
						</Button>
						<Link href="/dashboard/treatment-plans/new">
							<Button size="sm">
								<Plus className="h-4 w-4 mr-2" />
								New Treatment Plan
							</Button>
						</Link>
					</div>
				</div>

				<TreatmentPlanFilters filters={filters} onFiltersChange={setFilters} />

				{error && (
					<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
						<p className="text-sm text-destructive">{error}</p>
					</div>
				)}

				<TreatmentPlanTable plans={plans} isLoading={isLoading} />

				<TreatmentPlanPagination
					page={page}
					totalPages={totalPages}
					total={total}
					pageSize={pageSize}
					onPageChange={(newPage) => setFilters({ page: newPage })}
				/>
			</div>
		</>
	)
}
