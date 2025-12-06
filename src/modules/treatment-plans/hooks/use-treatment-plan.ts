'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TreatmentPlan } from '../types'
import { TreatmentPlanService } from '../services/treatment-plan.service'

interface UseTreatmentPlanReturn {
	plan: TreatmentPlan | null
	isLoading: boolean
	error: string | null
	refetch: () => Promise<void>
}

export function useTreatmentPlan(id: string): UseTreatmentPlanReturn {
	const [plan, setPlan] = useState<TreatmentPlan | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchPlan = useCallback(async () => {
		if (!id) {
			setIsLoading(false)
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			const data = await TreatmentPlanService.getTreatmentPlan(id)
			setPlan(data)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch treatment plan')
		} finally {
			setIsLoading(false)
		}
	}, [id])

	useEffect(() => {
		fetchPlan()
	}, [fetchPlan])

	return {
		plan,
		isLoading,
		error,
		refetch: fetchPlan,
	}
}
