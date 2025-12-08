import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { AuditService } from '@/lib/services/audit.service'

const createPatientSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	dateOfBirth: z.string().transform((str) => new Date(str)),
	gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
	weight: z.number().optional(),
	height: z.number().optional(),
	bloodType: z.string().optional(),
	medicalHistory: z.string().optional(),
	currentMedications: z.array(z.string()).optional().default([]),
	allergies: z.array(z.string()).optional().default([]),
	chronicConditions: z.array(z.string()).optional().default([]),
})

export async function GET(req: Request) {
	const startTime = Date.now()
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { searchParams } = new URL(req.url)
		const search = searchParams.get('search') || ''
		const gender = searchParams.get('gender')
		const sortBy = searchParams.get('sortBy') || 'updatedAt'
		const sortOrder = searchParams.get('sortOrder') || 'desc'
		const page = parseInt(searchParams.get('page') || '1')
		const pageSize = parseInt(searchParams.get('pageSize') || '10')

		const where = {
			doctorId: session.user.id,
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
		}).catch(console.error)

		return NextResponse.json({
			patients,
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		})
	} catch (error) {
		console.error('Error fetching patients:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch patients' },
			{ status: 500 }
		)
	}
}

export async function POST(req: Request) {
	const startTime = Date.now()
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const data = createPatientSchema.parse(body)

		const patient = await prisma.patient.create({
			data: {
				...data,
				doctorId: session.user.id,
			},
			include: {
				_count: {
					select: { treatmentPlans: true },
				},
			},
		})

		await AuditService.logPatientAccess('create', {
			userId: session.user.id,
			patientId: patient.id,
			success: true,
			fieldsAccessed: ['name', 'dateOfBirth', 'gender', 'medicalHistory'],
			durationMs: Date.now() - startTime,
		}).catch(console.error)

		revalidatePath('/dashboard/patients')
		revalidatePath('/dashboard')

		return NextResponse.json({ patient }, { status: 201 })
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: error.issues[0].message },
				{ status: 400 }
			)
		}

		console.error('Error creating patient:', error)
		return NextResponse.json(
			{ error: 'Failed to create patient' },
			{ status: 500 }
		)
	}
}
