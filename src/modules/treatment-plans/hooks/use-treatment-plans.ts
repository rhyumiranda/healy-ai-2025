'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TreatmentPlanListItem, TreatmentPlanFilters } from '../types'
import { TreatmentPlanService } from '../services/treatment-plan.service'

interface UseTreatmentPlansReturn {
	plans: TreatmentPlanListItem[]
	isLoading: boolean
	error: string | null
	total: number
	page: number
	pageSize: number
	totalPages: number
	filters: TreatmentPlanFilters
	setFilters: (filters: TreatmentPlanFilters) => void
	refetch: () => Promise<void>
}

export function useTreatmentPlans(
	initialFilters: TreatmentPlanFilters = {}
): UseTreatmentPlansReturn {
	const [plans, setPlans] = useState<TreatmentPlanListItem[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [total, setTotal] = useState(0)
	const [page, setPage] = useState(initialFilters.page || 1)
	const [pageSize, setPageSize] = useState(initialFilters.pageSize || 10)
	const [totalPages, setTotalPages] = useState(0)
	const [filters, setFiltersState] = useState<TreatmentPlanFilters>(initialFilters)

	const fetchPlans = useCallback(async () => {
		setIsLoading(true)
		setError(null)

		try {
			const response = await TreatmentPlanService.getTreatmentPlans(filters)
			setPlans(response.plans)
			setTotal(response.total)
			setPage(response.page)
			setPageSize(response.pageSize)
			setTotalPages(response.totalPages)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch treatment plans')
		} finally {
			setIsLoading(false)
		}
	}, [filters])

	useEffect(() => {
		fetchPlans()
	}, [fetchPlans])

	const setFilters = useCallback((newFilters: TreatmentPlanFilters) => {
		setFiltersState((prev) => ({ ...prev, ...newFilters }))
	}, [])

	return {
		plans,
		isLoading,
		error,
		total,
		page,
		pageSize,
		totalPages,
		filters,
		setFilters,
		refetch: fetchPlans,
	}
}
