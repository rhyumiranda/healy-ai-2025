'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardService } from '../services/dashboard.service'
import type { DashboardStats, RecentActivity } from '../types'

interface UseDashboardReturn {
	stats: DashboardStats | null
	recentActivity: RecentActivity[]
	isLoading: boolean
	error: string | null
	refetch: () => Promise<void>
}

export function useDashboard(): UseDashboardReturn {
	const [stats, setStats] = useState<DashboardStats | null>(null)
	const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchDashboardData = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)

			const data = await DashboardService.getDashboardStats()
			setStats(data.stats)
			setRecentActivity(data.recentActivity)
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to fetch dashboard data'
			setError(message)
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchDashboardData()
	}, [fetchDashboardData])

	return {
		stats,
		recentActivity,
		isLoading,
		error,
		refetch: fetchDashboardData,
	}
}
