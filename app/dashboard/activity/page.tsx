'use client'

import { useState } from 'react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuditLogTable } from '@/components/audit/audit-log-table'
import { AuditLogFilters } from '@/components/audit/audit-log-filters'
import { useAuditLogs, useExportAuditLogs, useAuditStats } from '@/src/modules/audit/hooks'
import { AuditFilters } from '@/src/modules/audit/types'
import { Activity, Shield, Brain, AlertTriangle } from 'lucide-react'

export default function ActivityPage() {
	const [filters, setFilters] = useState<AuditFilters>({
		page: 1,
		pageSize: 20,
		sortOrder: 'desc',
		eventType: 'ALL',
		severity: 'ALL',
	})

	const { data, isLoading, error } = useAuditLogs(filters)
	const { data: statsData } = useAuditStats()
	const { exportLogs } = useExportAuditLogs()
	const [isExporting, setIsExporting] = useState(false)

	const handleFiltersChange = (newFilters: AuditFilters) => {
		setFilters(newFilters)
	}

	const handlePageChange = (page: number) => {
		setFilters({ ...filters, page })
	}

	const handleExport = async (format: 'json' | 'csv') => {
		setIsExporting(true)
		try {
			const today = new Date()
			const thirtyDaysAgo = new Date(today)
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

			await exportLogs({
				format,
				startDate: filters.startDate || thirtyDaysAgo.toISOString().split('T')[0],
				endDate: filters.endDate || today.toISOString().split('T')[0],
			})
		} catch (err) {
			console.error('Export failed:', err)
		} finally {
			setIsExporting(false)
		}
	}

	const stats = statsData?.stats

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
				<div className='space-y-2'>
					<h2 className='text-2xl sm:text-3xl font-bold tracking-tight'>Activity Log</h2>
					<p className='text-muted-foreground text-sm sm:text-base'>
						Track all system activity for HIPAA compliance and audit purposes.
					</p>
				</div>

				{stats && (
					<div className='grid gap-4 md:grid-cols-4'>
						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>Total Events</CardTitle>
								<Activity className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{stats.totalEvents}</div>
								<p className='text-xs text-muted-foreground'>
									{(stats.successRate * 100).toFixed(1)}% success rate
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>PHI Access</CardTitle>
								<Shield className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{stats.phiAccessCount}</div>
								<p className='text-xs text-muted-foreground'>
									Protected health info accessed
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>AI Interactions</CardTitle>
								<Brain className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{stats.aiInteractionCount}</div>
								<p className='text-xs text-muted-foreground'>
									AI analysis requests
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>Avg Response</CardTitle>
								<AlertTriangle className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>
									{stats.averageResponseTime > 0 
										? `${Math.round(stats.averageResponseTime)}ms`
										: 'N/A'
									}
								</div>
								<p className='text-xs text-muted-foreground'>
									Average response time
								</p>
							</CardContent>
						</Card>
					</div>
				)}

				<Card>
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
						<CardDescription>
							Your recent treatment plans and patient interactions
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<AuditLogFilters
							filters={filters}
							onFiltersChange={handleFiltersChange}
							onExport={handleExport}
							isExporting={isExporting}
						/>

						{error ? (
							<div className='rounded-md border border-red-200 bg-red-50 p-4 text-red-800'>
								Failed to load activity logs. Please try again.
							</div>
						) : (
							<AuditLogTable
								logs={data?.logs || []}
								total={data?.total || 0}
								page={data?.page || 1}
								pageSize={data?.pageSize || 20}
								totalPages={data?.totalPages || 1}
								isLoading={isLoading}
								onPageChange={handlePageChange}
							/>
						)}
					</CardContent>
				</Card>
			</div>
		</>
	)
}
