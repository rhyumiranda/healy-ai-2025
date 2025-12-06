import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// GET - List treatment plans
export async function GET(req: Request) {
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { searchParams } = new URL(req.url)
		const page = parseInt(searchParams.get('page') || '1')
		const pageSize = parseInt(searchParams.get('pageSize') || '10')
		const search = searchParams.get('search') || ''
		const status = searchParams.get('status')
		const riskLevel = searchParams.get('riskLevel')
		const patientId = searchParams.get('patientId')

		const where = {
			doctorId: session.user.id,
			...(search && {
				OR: [
					{ chiefComplaint: { contains: search, mode: 'insensitive' as const } },
					{ patient: { name: { contains: search, mode: 'insensitive' as const } } },
				],
			}),
			...(status && status !== 'ALL' && { status: status as 'DRAFT' | 'APPROVED' | 'REJECTED' }),
			...(riskLevel && riskLevel !== 'ALL' && { riskLevel: riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' }),
			...(patientId && { patientId }),
		}

		const [plans, total] = await Promise.all([
			prisma.treatmentPlan.findMany({
				where,
				include: {
					patient: {
						select: { id: true, name: true },
					},
				},
				orderBy: { createdAt: 'desc' },
				skip: (page - 1) * pageSize,
				take: pageSize,
			}),
			prisma.treatmentPlan.count({ where }),
		])

		return NextResponse.json({
			plans,
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		})
	} catch (error) {
		console.error('Error fetching treatment plans:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch treatment plans' },
			{ status: 500 }
		)
	}
}

// POST - Create new treatment plan with AI analysis
const createPlanSchema = z.object({
	patientId: z.string(),
	chiefComplaint: z.string().min(1),
	currentSymptoms: z.string(),
	vitalSigns: z.any().optional(),
	physicalExamNotes: z.string().optional(),
	aiRecommendations: z.any().optional(),
	riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
	riskFactors: z.array(z.string()).optional(),
	riskJustification: z.string().optional(),
	drugInteractions: z.array(z.any()).optional(),
	contraindications: z.array(z.any()).optional(),
	alternatives: z.array(z.any()).optional(),
	status: z.enum(['DRAFT', 'APPROVED', 'REJECTED']).optional(),
})

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const data = createPlanSchema.parse(body)

		// Verify patient belongs to this doctor
		const patient = await prisma.patient.findFirst({
			where: {
				id: data.patientId,
				doctorId: session.user.id,
			},
		})

		if (!patient) {
			return NextResponse.json(
				{ error: 'Patient not found' },
				{ status: 404 }
			)
		}

		const treatmentPlan = await prisma.treatmentPlan.create({
			data: {
				patientId: data.patientId,
				doctorId: session.user.id,
				chiefComplaint: data.chiefComplaint,
				currentSymptoms: data.currentSymptoms,
				vitalSigns: data.vitalSigns || null,
				physicalExamNotes: data.physicalExamNotes || null,
				aiRecommendations: data.aiRecommendations || null,
				riskLevel: data.riskLevel || null,
				riskFactors: data.riskFactors || [],
				riskJustification: data.riskJustification || null,
				drugInteractions: data.drugInteractions || [],
				contraindications: data.contraindications || [],
				alternatives: data.alternatives || [],
				status: data.status || 'DRAFT',
			},
			include: {
				patient: true,
			},
		})

		return NextResponse.json({ treatmentPlan }, { status: 201 })
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: error.issues[0].message },
				{ status: 400 }
			)
		}

		console.error('Error creating treatment plan:', error)
		return NextResponse.json(
			{ error: 'Failed to create treatment plan' },
			{ status: 500 }
		)
	}
}
