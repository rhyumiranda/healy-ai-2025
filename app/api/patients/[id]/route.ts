import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { AuditService } from '@/lib/services/audit.service'

const updatePatientSchema = z.object({
	name: z.string().min(2).optional(),
	dateOfBirth: z
		.string()
		.transform((str) => new Date(str))
		.optional(),
	gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
	weight: z.number().optional().nullable(),
	height: z.number().optional().nullable(),
	bloodType: z.string().optional().nullable(),
	medicalHistory: z.string().optional().nullable(),
	currentMedications: z.array(z.string()).optional(),
	allergies: z.array(z.string()).optional(),
	chronicConditions: z.array(z.string()).optional(),
})

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const startTime = Date.now()
	try {
		const session = await getServerSession(authOptions)
		const { id } = await params

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const patient = await prisma.patient.findUnique({
			where: { id },
			include: {
				treatmentPlans: {
					orderBy: { createdAt: 'desc' },
					select: {
						id: true,
						chiefComplaint: true,
						status: true,
						riskLevel: true,
						createdAt: true,
						updatedAt: true,
					},
				},
				_count: {
					select: { treatmentPlans: true },
				},
			},
		})

		if (!patient) {
			return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
		}

		if (patient.doctorId !== session.user.id) {
			await AuditService.log('authorization_failure', 'Unauthorized patient access attempt', {
				userId: session.user.id,
				patientId: id,
				success: false,
				errorMessage: 'User does not own this patient record',
			}).catch(console.error)
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		await AuditService.logPatientAccess('view', {
			userId: session.user.id,
			patientId: id,
			success: true,
			fieldsAccessed: ['name', 'dateOfBirth', 'gender', 'medicalHistory', 'treatmentPlans'],
		}).catch(console.error)

		return NextResponse.json({ patient })
	} catch (error) {
		console.error('Error fetching patient:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch patient' },
			{ status: 500 }
		)
	}
}

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const startTime = Date.now()
	try {
		const session = await getServerSession(authOptions)
		const { id } = await params

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const existingPatient = await prisma.patient.findUnique({
			where: { id },
		})

		if (!existingPatient) {
			return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
		}

		if (existingPatient.doctorId !== session.user.id) {
			await AuditService.log('authorization_failure', 'Unauthorized patient update attempt', {
				userId: session.user.id,
				patientId: id,
				success: false,
				errorMessage: 'User does not own this patient record',
			}).catch(console.error)
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const body = await req.json()
		const data = updatePatientSchema.parse(body)

		const patient = await prisma.patient.update({
			where: { id },
			data,
			include: {
				_count: {
					select: { treatmentPlans: true },
				},
			},
		})

		await AuditService.logPatientAccess('update', {
			userId: session.user.id,
			patientId: id,
			success: true,
			fieldsAccessed: Object.keys(data),
		}).catch(console.error)

		return NextResponse.json({ patient })
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: error.issues[0].message },
				{ status: 400 }
			)
		}

		console.error('Error updating patient:', error)
		return NextResponse.json(
			{ error: 'Failed to update patient' },
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
		const { id } = await params

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const patient = await prisma.patient.findUnique({
			where: { id },
		})

		if (!patient) {
			return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
		}

		if (patient.doctorId !== session.user.id) {
			await AuditService.log('authorization_failure', 'Unauthorized patient delete attempt', {
				userId: session.user.id,
				patientId: id,
				success: false,
				errorMessage: 'User does not own this patient record',
			}).catch(console.error)
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		await prisma.patient.delete({
			where: { id },
		})

		await AuditService.logPatientAccess('delete', {
			userId: session.user.id,
			patientId: id,
			success: true,
		}).catch(console.error)

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error deleting patient:', error)
		return NextResponse.json(
			{ error: 'Failed to delete patient' },
			{ status: 500 }
		)
	}
}
