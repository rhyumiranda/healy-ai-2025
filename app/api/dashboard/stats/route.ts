import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const doctorId = session.user.id

		const now = new Date()
		const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
		const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

		const [
			totalPatients,
			patientsLastMonth,
			activeTreatmentPlans,
			plansLastMonth,
			recentPatients,
			recentTreatmentPlans,
			safetyAlerts,
		] = await Promise.all([
			prisma.patient.count({
				where: { doctorId },
			}),
			prisma.patient.count({
				where: {
					doctorId,
					createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
				},
			}),
			prisma.treatmentPlan.count({
				where: {
					doctorId,
					status: { in: ['DRAFT', 'APPROVED'] },
				},
			}),
			prisma.treatmentPlan.count({
				where: {
					doctorId,
					status: { in: ['DRAFT', 'APPROVED'] },
					createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
				},
			}),
			prisma.patient.findMany({
				where: { doctorId },
				orderBy: { createdAt: 'desc' },
				take: 5,
				select: {
					id: true,
					name: true,
					createdAt: true,
					updatedAt: true,
				},
			}),
			prisma.treatmentPlan.findMany({
				where: { doctorId },
				orderBy: { updatedAt: 'desc' },
				take: 5,
				include: {
					patient: {
						select: { id: true, name: true },
					},
				},
			}),
			prisma.treatmentPlan.count({
				where: {
					doctorId,
					riskLevel: 'HIGH',
					status: { in: ['DRAFT', 'APPROVED'] },
				},
			}),
		])

		const currentPatientsInPeriod = await prisma.patient.count({
			where: {
				doctorId,
				createdAt: { gte: thirtyDaysAgo },
			},
		})

		const currentPlansInPeriod = await prisma.treatmentPlan.count({
			where: {
				doctorId,
				status: { in: ['DRAFT', 'APPROVED'] },
				createdAt: { gte: thirtyDaysAgo },
			},
		})

		const patientChange = patientsLastMonth > 0
			? Math.round(((currentPatientsInPeriod - patientsLastMonth) / patientsLastMonth) * 100)
			: currentPatientsInPeriod > 0 ? 100 : 0

		const planChange = plansLastMonth > 0
			? Math.round(((currentPlansInPeriod - plansLastMonth) / plansLastMonth) * 100)
			: currentPlansInPeriod > 0 ? 100 : 0

		const recentActivity = [
			...recentTreatmentPlans.map((plan) => ({
				id: plan.id,
				type: 'treatment_plan' as const,
				patientId: plan.patient.id,
				patientName: plan.patient.name,
				action: plan.status === 'APPROVED'
					? 'Treatment plan approved'
					: plan.status === 'REJECTED'
						? 'Treatment plan rejected'
						: 'Treatment plan created',
				timestamp: plan.updatedAt,
			})),
			...recentPatients.map((patient) => ({
				id: patient.id,
				type: 'patient' as const,
				patientId: patient.id,
				patientName: patient.name,
				action: 'New patient added',
				timestamp: patient.createdAt,
			})),
		]
			.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
			.slice(0, 5)

		return NextResponse.json({
			stats: {
				totalPatients,
				patientChange,
				activeTreatmentPlans,
				planChange,
				safetyAlerts,
			},
			recentActivity,
		})
	} catch (error) {
		console.error('Error fetching dashboard stats:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch dashboard stats' },
			{ status: 500 }
		)
	}
}
