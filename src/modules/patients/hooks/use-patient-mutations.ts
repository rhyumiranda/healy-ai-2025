'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { CreatePatientInput, UpdatePatientInput, Patient } from '../types'
import { PatientService } from '../services/patient.service'

export function useCreatePatient() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const createPatient = useCallback(
		async (input: CreatePatientInput): Promise<Patient | null> => {
			try {
				setIsLoading(true)
				setError(null)
				const patient = await PatientService.createPatient(input)
				toast.success('Patient created successfully')
				router.push(`/dashboard/patients/${patient.id}`)
				return patient
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : 'Failed to create patient'
				setError(errorMessage)
				return null
			} finally {
				setIsLoading(false)
			}
		},
		[router]
	)

	return { createPatient, isLoading, error }
}

export function useUpdatePatient() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const updatePatient = useCallback(
		async (
			id: string,
			input: UpdatePatientInput
		): Promise<Patient | null> => {
			try {
				setIsLoading(true)
				setError(null)
				const patient = await PatientService.updatePatient(id, input)
				toast.success('Patient updated successfully')
				router.refresh()
				return patient
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : 'Failed to update patient'
				setError(errorMessage)
				return null
			} finally {
				setIsLoading(false)
			}
		},
		[router]
	)

	return { updatePatient, isLoading, error }
}

export function useDeletePatient() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const deletePatient = useCallback(
		async (id: string): Promise<boolean> => {
			try {
				setIsLoading(true)
				setError(null)
				await PatientService.deletePatient(id)
				toast.success('Patient deleted successfully')
				router.push('/dashboard/patients')
				return true
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : 'Failed to delete patient'
				setError(errorMessage)
				return false
			} finally {
				setIsLoading(false)
			}
		},
		[router]
	)

	return { deletePatient, isLoading, error }
}

