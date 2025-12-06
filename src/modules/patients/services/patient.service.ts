import type {
	Patient,
	PatientWithPlans,
	CreatePatientInput,
	UpdatePatientInput,
	PatientsResponse,
	PatientFilters,
} from '../types'

export class PatientService {
	static async getPatients(filters: PatientFilters = {}): Promise<PatientsResponse> {
		const params = new URLSearchParams()

		if (filters.search) params.append('search', filters.search)
		if (filters.gender) params.append('gender', filters.gender)
		if (filters.sortBy) params.append('sortBy', filters.sortBy)
		if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)
		if (filters.page) params.append('page', filters.page.toString())
		if (filters.pageSize) params.append('pageSize', filters.pageSize.toString())

		const response = await fetch(`/api/patients?${params.toString()}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to fetch patients')
		}

		return response.json()
	}

	static async getPatient(id: string): Promise<PatientWithPlans> {
		const response = await fetch(`/api/patients/${id}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to fetch patient')
		}

		const data = await response.json()
		return data.patient
	}

	static async createPatient(input: CreatePatientInput): Promise<Patient> {
		console.log('[Service] createPatient input:', input)
		console.log('[Service] JSON payload:', JSON.stringify(input))
		const response = await fetch('/api/patients', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to create patient')
		}

		const data = await response.json()
		return data.patient
	}

	static async updatePatient(
		id: string,
		input: UpdatePatientInput
	): Promise<Patient> {
		const response = await fetch(`/api/patients/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to update patient')
		}

		const data = await response.json()
		return data.patient
	}

	static async deletePatient(id: string): Promise<void> {
		const response = await fetch(`/api/patients/${id}`, {
			method: 'DELETE',
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to delete patient')
		}
	}
}

