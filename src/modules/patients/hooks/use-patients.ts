'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Patient, PatientsResponse, PatientFilters } from '../types'
import { PatientService } from '../services/patient.service'

export function usePatients(initialFilters: PatientFilters = {}) {
	const [data, setData] = useState<PatientsResponse | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [filters, setFilters] = useState<PatientFilters>(initialFilters)

	const fetchPatients = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)
			const response = await PatientService.getPatients(filters)
			setData(response)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load patients')
		} finally {
			setIsLoading(false)
		}
	}, [filters])

	useEffect(() => {
		fetchPatients()
	}, [fetchPatients])

	const updateFilters = useCallback((newFilters: Partial<PatientFilters>) => {
		setFilters((prev) => ({ ...prev, ...newFilters }))
	}, [])

	const refetch = useCallback(() => {
		fetchPatients()
	}, [fetchPatients])

	return {
		patients: data?.patients || [],
		total: data?.total || 0,
		page: data?.page || 1,
		pageSize: data?.pageSize || 10,
		totalPages: data?.totalPages || 0,
		isLoading,
		error,
		filters,
		updateFilters,
		refetch,
	}
}
