'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { TreatmentPlan, CreateTreatmentPlanInput, UpdateTreatmentPlanInput } from '../types'
import { TreatmentPlanService } from '../services/treatment-plan.service'

interface UseCreateTreatmentPlanReturn {
	createTreatmentPlan: (input: CreateTreatmentPlanInput) => Promise<TreatmentPlan | null>
	isLoading: boolean
	error: string | null
}

export function useCreateTreatmentPlan(): UseCreateTreatmentPlanReturn {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const createTreatmentPlan = useCallback(
		async (input: CreateTreatmentPlanInput): Promise<TreatmentPlan | null> => {
			setIsLoading(true)
			setError(null)

			try {
				const plan = await TreatmentPlanService.createTreatmentPlan(input)
				toast.success('Treatment plan created successfully')
				router.push(`/dashboard/treatment-plans/${plan.id}`)
				return plan
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to create treatment plan')
				return null
			} finally {
				setIsLoading(false)
			}
		},
		[router]
	)

	return {
		createTreatmentPlan,
		isLoading,
		error,
	}
}

interface UseUpdateTreatmentPlanReturn {
	updatePlan: (id: string, input: UpdateTreatmentPlanInput) => Promise<TreatmentPlan | null>
	isLoading: boolean
	error: string | null
}

export function useUpdateTreatmentPlan(): UseUpdateTreatmentPlanReturn {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const updatePlan = useCallback(
		async (id: string, input: UpdateTreatmentPlanInput): Promise<TreatmentPlan | null> => {
			setIsLoading(true)
			setError(null)

			try {
				const plan = await TreatmentPlanService.updateTreatmentPlan(id, input)
				toast.success('Treatment plan updated successfully')
				return plan
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to update treatment plan')
				return null
			} finally {
				setIsLoading(false)
			}
		},
		[]
	)

	return {
		updatePlan,
		isLoading,
		error,
	}
}

interface UseDeleteTreatmentPlanReturn {
	deletePlan: (id: string) => Promise<boolean>
	isLoading: boolean
	error: string | null
}

export function useDeleteTreatmentPlan(): UseDeleteTreatmentPlanReturn {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const deletePlan = useCallback(
		async (id: string): Promise<boolean> => {
			setIsLoading(true)
			setError(null)

			try {
				await TreatmentPlanService.deleteTreatmentPlan(id)
				toast.success('Treatment plan deleted successfully')
				router.push('/dashboard/treatment-plans')
				return true
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to delete treatment plan')
				return false
			} finally {
				setIsLoading(false)
			}
		},
		[router]
	)

	return {
		deletePlan,
		isLoading,
		error,
	}
}

interface UseCloneTreatmentPlanReturn {
	clonePlan: (id: string, newPatientId: string) => Promise<TreatmentPlan | null>
	isLoading: boolean
	error: string | null
}

export function useCloneTreatmentPlan(): UseCloneTreatmentPlanReturn {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const clonePlan = useCallback(
		async (id: string, newPatientId: string): Promise<TreatmentPlan | null> => {
			setIsLoading(true)
			setError(null)

			try {
				const plan = await TreatmentPlanService.cloneTreatmentPlan(id, newPatientId)
				toast.success('Treatment plan cloned successfully')
				router.push(`/dashboard/treatment-plans/${plan.id}`)
				return plan
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to clone treatment plan')
				return null
			} finally {
				setIsLoading(false)
			}
		},
		[router]
	)

	return {
		clonePlan,
		isLoading,
		error,
	}
}
