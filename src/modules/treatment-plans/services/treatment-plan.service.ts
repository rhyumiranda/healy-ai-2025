import type {
	TreatmentPlan,
	TreatmentPlanListItem,
	TreatmentPlansResponse,
	TreatmentPlanFilters,
	CreateTreatmentPlanInput,
	UpdateTreatmentPlanInput,
} from '../types'
import { MOCK_TREATMENT_PLANS, MOCK_TREATMENT_PLAN_LIST } from '../constants'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class TreatmentPlanService {
	private static plans: TreatmentPlan[] = [...MOCK_TREATMENT_PLANS]
	private static planList: TreatmentPlanListItem[] = [...MOCK_TREATMENT_PLAN_LIST]

	static async getTreatmentPlans(
		filters: TreatmentPlanFilters = {}
	): Promise<TreatmentPlansResponse> {
		await delay(300)

		let filtered = [...this.planList]

		if (filters.search) {
			const searchLower = filters.search.toLowerCase()
			filtered = filtered.filter(
				(plan) =>
					plan.patient.name.toLowerCase().includes(searchLower) ||
					plan.chiefComplaint.toLowerCase().includes(searchLower)
			)
		}

		if (filters.status && filters.status !== 'ALL') {
			filtered = filtered.filter((plan) => plan.status === filters.status)
		}

		if (filters.riskLevel && filters.riskLevel !== 'ALL') {
			filtered = filtered.filter((plan) => plan.riskLevel === filters.riskLevel)
		}

		if (filters.patientId) {
			filtered = filtered.filter((plan) => plan.patientId === filters.patientId)
		}

		if (filters.dateFrom) {
			const fromDate = new Date(filters.dateFrom)
			filtered = filtered.filter(
				(plan) => new Date(plan.createdAt) >= fromDate
			)
		}

		if (filters.dateTo) {
			const toDate = new Date(filters.dateTo)
			filtered = filtered.filter((plan) => new Date(plan.createdAt) <= toDate)
		}

		const sortBy = filters.sortBy || 'createdAt'
		const sortOrder = filters.sortOrder || 'desc'

		filtered.sort((a, b) => {
			let comparison = 0

			switch (sortBy) {
				case 'patientName':
					comparison = a.patient.name.localeCompare(b.patient.name)
					break
				case 'status':
					comparison = a.status.localeCompare(b.status)
					break
				case 'updatedAt':
					comparison =
						new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
					break
				case 'createdAt':
				default:
					comparison =
						new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
					break
			}

			return sortOrder === 'desc' ? -comparison : comparison
		})

		const page = filters.page || 1
		const pageSize = filters.pageSize || 10
		const total = filtered.length
		const totalPages = Math.ceil(total / pageSize)
		const startIndex = (page - 1) * pageSize
		const plans = filtered.slice(startIndex, startIndex + pageSize)

		return {
			plans,
			total,
			page,
			pageSize,
			totalPages,
		}
	}

	static async getTreatmentPlan(id: string): Promise<TreatmentPlan> {
		await delay(300)

		const plan = this.plans.find((p) => p.id === id)

		if (!plan) {
			throw new Error('Treatment plan not found')
		}

		return plan
	}

	static async createTreatmentPlan(
		input: CreateTreatmentPlanInput
	): Promise<TreatmentPlan> {
		await delay(500)

		const newPlan: TreatmentPlan = {
			id: `plan-${Date.now()}`,
			patientId: input.patientId,
			patient: {
				id: input.patientId,
				name: 'New Patient',
				dateOfBirth: '1990-01-01',
				gender: 'OTHER',
				allergies: [],
				chronicConditions: [],
			},
			doctorId: 'doctor-1',
			chiefComplaint: input.chiefComplaint,
			currentSymptoms: input.currentSymptoms,
			vitalSigns: input.vitalSigns,
			physicalExamNotes: input.physicalExamNotes,
			riskLevel: null,
			riskFactors: [],
			drugInteractions: [],
			contraindications: [],
			alternatives: [],
			status: 'DRAFT',
			wasModified: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}

		this.plans.unshift(newPlan)
		this.planList.unshift({
			id: newPlan.id,
			patientId: newPlan.patientId,
			patient: {
				id: newPlan.patient.id,
				name: newPlan.patient.name,
			},
			chiefComplaint: newPlan.chiefComplaint,
			status: newPlan.status,
			riskLevel: newPlan.riskLevel,
			createdAt: newPlan.createdAt,
			updatedAt: newPlan.updatedAt,
		})

		return newPlan
	}

	static async updateTreatmentPlan(
		id: string,
		input: UpdateTreatmentPlanInput
	): Promise<TreatmentPlan> {
		await delay(400)

		const planIndex = this.plans.findIndex((p) => p.id === id)

		if (planIndex === -1) {
			throw new Error('Treatment plan not found')
		}

		const existingPlan = this.plans[planIndex]

		const updatedPlan: TreatmentPlan = {
			...existingPlan,
			...input,
			wasModified: true,
			updatedAt: new Date().toISOString(),
			approvedAt:
				input.status === 'APPROVED' ? new Date().toISOString() : existingPlan.approvedAt,
		}

		this.plans[planIndex] = updatedPlan

		const listIndex = this.planList.findIndex((p) => p.id === id)
		if (listIndex !== -1) {
			this.planList[listIndex] = {
				...this.planList[listIndex],
				chiefComplaint: updatedPlan.chiefComplaint,
				status: updatedPlan.status,
				riskLevel: updatedPlan.riskLevel,
				updatedAt: updatedPlan.updatedAt,
			}
		}

		return updatedPlan
	}

	static async deleteTreatmentPlan(id: string): Promise<void> {
		await delay(300)

		const planIndex = this.plans.findIndex((p) => p.id === id)

		if (planIndex === -1) {
			throw new Error('Treatment plan not found')
		}

		const plan = this.plans[planIndex]

		if (plan.status !== 'DRAFT') {
			throw new Error('Only draft plans can be deleted')
		}

		this.plans.splice(planIndex, 1)

		const listIndex = this.planList.findIndex((p) => p.id === id)
		if (listIndex !== -1) {
			this.planList.splice(listIndex, 1)
		}
	}

	static async cloneTreatmentPlan(
		id: string,
		newPatientId: string
	): Promise<TreatmentPlan> {
		await delay(500)

		const originalPlan = await this.getTreatmentPlan(id)

		const clonedPlan: TreatmentPlan = {
			...originalPlan,
			id: `plan-${Date.now()}`,
			patientId: newPatientId,
			patient: {
				...originalPlan.patient,
				id: newPatientId,
			},
			status: 'DRAFT',
			wasModified: false,
			modificationNotes: `Cloned from plan ${id}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			approvedAt: undefined,
		}

		this.plans.unshift(clonedPlan)
		this.planList.unshift({
			id: clonedPlan.id,
			patientId: clonedPlan.patientId,
			patient: {
				id: clonedPlan.patient.id,
				name: clonedPlan.patient.name,
			},
			chiefComplaint: clonedPlan.chiefComplaint,
			status: clonedPlan.status,
			riskLevel: clonedPlan.riskLevel,
			createdAt: clonedPlan.createdAt,
			updatedAt: clonedPlan.updatedAt,
		})

		return clonedPlan
	}
}
