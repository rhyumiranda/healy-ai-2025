import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { AuditService } from '@/lib/services/audit.service'
import type { Prisma } from '@/lib/generated/prisma'

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const startTime = Date.now()
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { id } = await params

		const treatmentPlan = await prisma.treatmentPlan.findFirst({
			where: {
				id,
				doctorId: session.user.id,
			},
			include: {
				patient: true,
			},
		})

		if (!treatmentPlan) {
			return NextResponse.json(
				{ error: 'Treatment plan not found' },
				{ status: 404 }
			)
		}

		await AuditService.logTreatmentPlanAction('view', {
			userId: session.user.id,
			patientId: treatmentPlan.patientId,
			planId: id,
			success: true,
		}).catch(console.error)

		return NextResponse.json({ treatmentPlan })
	} catch (error) {
		console.error('Error fetching treatment plan:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch treatment plan' },
			{ status: 500 }
		)
	}
}

const updatePlanSchema = z.object({
	chiefComplaint: z.string().optional(),
	currentSymptoms: z.string().optional(),
	vitalSigns: z.unknown().optional(),
	physicalExamNotes: z.string().optional(),
	aiRecommendations: z.unknown().optional(),
	finalPlan: z.unknown().optional(),
	riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().nullable(),
	riskFactors: z.array(z.string()).optional(),
	riskJustification: z.string().optional().nullable(),
	drugInteractions: z.array(z.unknown()).optional(),
	contraindications: z.array(z.unknown()).optional(),
	alternatives: z.array(z.unknown()).optional(),
	status: z.enum(['DRAFT', 'APPROVED', 'REJECTED']).optional(),
	wasModified: z.boolean().optional(),
	modificationNotes: z.string().optional().nullable(),
})

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const startTime = Date.now()
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { id } = await params
		const body = await req.json()
		const data = updatePlanSchema.parse(body)

		const existing = await prisma.treatmentPlan.findFirst({
			where: {
				id,
				doctorId: session.user.id,
			},
		})

		if (!existing) {
			return NextResponse.json(
				{ error: 'Treatment plan not found' },
				{ status: 404 }
			)
		}

		const treatmentPlan = await prisma.treatmentPlan.update({
			where: { id },
			data: {
				chiefComplaint: data.chiefComplaint,
				currentSymptoms: data.currentSymptoms,
				vitalSigns: data.vitalSigns !== undefined ? (data.vitalSigns as Prisma.InputJsonValue) : undefined,
				physicalExamNotes: data.physicalExamNotes,
				aiRecommendations: data.aiRecommendations !== undefined ? (data.aiRecommendations as Prisma.InputJsonValue) : undefined,
				finalPlan: data.finalPlan !== undefined ? (data.finalPlan as Prisma.InputJsonValue) : undefined,
				riskLevel: data.riskLevel,
				riskFactors: data.riskFactors,
				riskJustification: data.riskJustification,
				drugInteractions: data.drugInteractions !== undefined ? (data.drugInteractions as Prisma.InputJsonValue[]) : undefined,
				contraindications: data.contraindications !== undefined ? (data.contraindications as Prisma.InputJsonValue[]) : undefined,
				alternatives: data.alternatives !== undefined ? (data.alternatives as Prisma.InputJsonValue[]) : undefined,
				status: data.status,
				wasModified: data.wasModified ?? (data.finalPlan ? true : existing.wasModified),
				modificationNotes: data.modificationNotes,
				approvedAt: data.status === 'APPROVED' ? new Date() : existing.approvedAt,
			},
			include: {
				patient: true,
			},
		})

		let action: 'update' | 'approve' | 'reject' = 'update'
		if (data.status === 'APPROVED' && existing.status !== 'APPROVED') {
			action = 'approve'
		} else if (data.status === 'REJECTED' && existing.status !== 'REJECTED') {
			action = 'reject'
		}

		await AuditService.logTreatmentPlanAction(action, {
			userId: session.user.id,
			patientId: existing.patientId,
			planId: id,
			modifications: Object.keys(data),
			success: true,
		}).catch(console.error)

		revalidatePath('/dashboard/treatment-plans')
		revalidatePath('/dashboard')

		return NextResponse.json({ treatmentPlan })
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: error.issues[0].message },
				{ status: 400 }
			)
		}

		console.error('Error updating treatment plan:', error)
		return NextResponse.json(
			{ error: 'Failed to update treatment plan' },
			{ status: 500 }
		)
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const startTime = Date.now()
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { id } = await params

		const existing = await prisma.treatmentPlan.findFirst({
			where: {
				id,
				doctorId: session.user.id,
			},
		})

		if (!existing) {
			return NextResponse.json(
				{ error: 'Treatment plan not found' },
				{ status: 404 }
			)
		}

		if (existing.status !== 'DRAFT') {
			return NextResponse.json(
				{ error: 'Only draft treatment plans can be deleted' },
				{ status: 400 }
			)
		}

		await prisma.treatmentPlan.delete({
			where: { id },
		})

		await AuditService.logTreatmentPlanAction('delete', {
			userId: session.user.id,
			patientId: existing.patientId,
			planId: id,
			success: true,
		}).catch(console.error)

		revalidatePath('/dashboard/treatment-plans')
		revalidatePath('/dashboard')

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error deleting treatment plan:', error)
		return NextResponse.json(
			{ error: 'Failed to delete treatment plan' },
			{ status: 500 }
		)
	}
}
