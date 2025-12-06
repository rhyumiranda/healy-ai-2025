import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// GET - Get single treatment plan
export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
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

		return NextResponse.json({ treatmentPlan })
	} catch (error) {
		console.error('Error fetching treatment plan:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch treatment plan' },
			{ status: 500 }
		)
	}
}

// PATCH - Update treatment plan
const updatePlanSchema = z.object({
	chiefComplaint: z.string().optional(),
	currentSymptoms: z.string().optional(),
	vitalSigns: z.any().optional(),
	physicalExamNotes: z.string().optional(),
	aiRecommendations: z.any().optional(),
	finalPlan: z.any().optional(),
	riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().nullable(),
	riskFactors: z.array(z.string()).optional(),
	riskJustification: z.string().optional().nullable(),
	drugInteractions: z.array(z.any()).optional(),
	contraindications: z.array(z.any()).optional(),
	alternatives: z.array(z.any()).optional(),
	status: z.enum(['DRAFT', 'APPROVED', 'REJECTED']).optional(),
	wasModified: z.boolean().optional(),
	modificationNotes: z.string().optional().nullable(),
})

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { id } = await params
		const body = await req.json()
		const data = updatePlanSchema.parse(body)

		// Verify ownership
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
				...data,
				wasModified: data.wasModified ?? (data.finalPlan ? true : existing.wasModified),
				approvedAt: data.status === 'APPROVED' ? new Date() : existing.approvedAt,
			},
			include: {
				patient: true,
			},
		})

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

// DELETE - Delete treatment plan (only drafts)
export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
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

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error deleting treatment plan:', error)
		return NextResponse.json(
			{ error: 'Failed to delete treatment plan' },
			{ status: 500 }
		)
	}
}
