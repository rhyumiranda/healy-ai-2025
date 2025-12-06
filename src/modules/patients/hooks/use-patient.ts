'use client'

import { useState, useEffect, useCallback } from 'react'
import type { PatientWithPlans } from '../types'
import { PatientService } from '../services/patient.service'

export function usePatient(id: string) {
	const [patient, setPatient] = useState<PatientWithPlans | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchPatient = useCallback(async () => {
		if (!id) return

		try {
			setIsLoading(true)
			setError(null)
			const data = await PatientService.getPatient(id)
			setPatient(data)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load patient')
		} finally {
			setIsLoading(false)
		}
	}, [id])

	useEffect(() => {
		fetchPatient()
	}, [fetchPatient])

	const refetch = useCallback(() => {
		fetchPatient()
	}, [fetchPatient])

	return { patient, isLoading, error, refetch }
}

