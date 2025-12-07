import type {
	Patient,
	PatientWithPlans,
	CreatePatientInput,
	UpdatePatientInput,
	PatientsResponse,
	PatientFilters,
} from '../types'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AuditService } from '@/lib/services/audit.service'

export class PatientService {
	static async getPatientsServer(filters: PatientFilters = {}): Promise<PatientsResponse> {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			throw new Error('Unauthorized')
		}

		const startTime = Date.now()
		const doctorId = session.user.id

		const search = filters.search || ''
		const gender = filters.gender
		const sortBy = filters.sortBy || 'updatedAt'
		const sortOrder = filters.sortOrder || 'desc'
		const page = filters.page || 1
		const pageSize = filters.pageSize || 10

		const where = {
			doctorId,
			...(search && {
				name: {
					contains: search,
					mode: 'insensitive' as const,
				},
			}),
			...(gender && { gender: gender as 'MALE' | 'FEMALE' | 'OTHER' }),
		}

		const [patients, total] = await Promise.all([
			prisma.patient.findMany({
				where,
				orderBy: {
					[sortBy]: sortOrder,
				},
				skip: (page - 1) * pageSize,
				take: pageSize,
				include: {
					_count: {
						select: { treatmentPlans: true },
					},
				},
			}),
			prisma.patient.count({ where }),
		])

		await AuditService.logPatientAccess('list', {
			userId: session.user.id,
			success: true,
			durationMs: Date.now() - startTime,
		}).catch(() => {
			// Failed to log audit event
		})

		return {
			patients,
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		}
	}
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

