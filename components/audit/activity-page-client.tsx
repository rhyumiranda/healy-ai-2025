'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuditLogTable } from '@/components/audit/audit-log-table'
import { AuditLogFilters } from '@/components/audit/audit-log-filters'
import type { AuditFilters, AuditLogsResponse, AuditStatsResponse } from '@/src/modules/audit/types'
import { Activity, Shield, Brain, AlertTriangle } from 'lucide-react'
import { useExportAuditLogs } from '@/src/modules/audit/hooks'

interface ActivityPageClientProps {
	initialLogsData: AuditLogsResponse
	initialStatsData: AuditStatsResponse | null
	initialFilters: AuditFilters
}

export function ActivityPageClient({ initialLogsData, initialStatsData, initialFilters }: ActivityPageClientProps) {
	const router = useRouter()
	const [filters, setFilters] = useState<AuditFilters>(initialFilters)
	const [isRefreshing, setIsRefreshing] = useState(false)
	const { exportLogs } = useExportAuditLogs()
	const [isExporting, setIsExporting] = useState(false)

	const handleFiltersChange = (newFilters: AuditFilters) => {
		setFilters(newFilters)

		const params = new URLSearchParams()
		if (newFilters.page && newFilters.page > 1) params.set('page', newFilters.page.toString())
		if (newFilters.pageSize && newFilters.pageSize !== 20) params.set('pageSize', newFilters.pageSize.toString())
		if (newFilters.search) params.set('search', newFilters.search)
		if (newFilters.eventType && newFilters.eventType !== 'ALL') params.set('eventType', newFilters.eventType)
		if (newFilters.severity && newFilters.severity !== 'ALL') params.set('severity', newFilters.severity)
		if (newFilters.startDate) params.set('startDate', newFilters.startDate)
		if (newFilters.endDate) params.set('endDate', newFilters.endDate)
		if (newFilters.success !== undefined && newFilters.success !== 'ALL') {
			params.set('success', newFilters.success.toString())
		}
		if (newFilters.patientId) params.set('patientId', newFilters.patientId)
		if (newFilters.sortOrder && newFilters.sortOrder !== 'desc') params.set('sortOrder', newFilters.sortOrder)

		router.push(`/dashboard/activity?${params.toString()}`)
	}

	const handlePageChange = (page: number) => {
		handleFiltersChange({ ...filters, page })
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
			// Export failed
		} finally {
			setIsExporting(false)
		}
	}

	const stats = initialStatsData?.stats

	return (
		<>
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

					<AuditLogTable
						logs={initialLogsData.logs}
						total={initialLogsData.total}
						page={initialLogsData.page}
						pageSize={initialLogsData.pageSize}
						totalPages={initialLogsData.totalPages}
						isLoading={isRefreshing}
						onPageChange={handlePageChange}
					/>
				</CardContent>
			</Card>
		</>
	)
}

