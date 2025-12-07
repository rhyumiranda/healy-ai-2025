import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { OpenAIService } from '@/lib/services/openai.service'
import { z } from 'zod'
import { AuditService } from '@/lib/services/audit.service'
import type { LabResults } from '@/src/modules/treatment-plans/types'

const analyzeRequestSchema = z.object({
	patient: z.object({
		id: z.string(),
		name: z.string(),
		dateOfBirth: z.string(),
		gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
		allergies: z.array(z.string()),
		chronicConditions: z.array(z.string()),
	}),
	chiefComplaint: z.string().min(1),
	currentSymptoms: z.array(z.string()),
	currentMedications: z.array(z.string()),
	vitalSigns: z.object({
		bloodPressureSystolic: z.number().optional(),
		bloodPressureDiastolic: z.number().optional(),
		heartRate: z.number().optional(),
		temperature: z.number().optional(),
		respiratoryRate: z.number().optional(),
		oxygenSaturation: z.number().optional(),
	}).optional(),
	labResults: z.unknown().optional(),
	additionalNotes: z.string().optional(),
	useRAG: z.boolean().optional(),
})

export async function POST(req: Request) {
	const startTime = Date.now()
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const { useRAG, ...requestData } = analyzeRequestSchema.parse(body)

		const analysis = await OpenAIService.analyzeTreatment({
			...requestData,
			labResults: requestData.labResults as LabResults | undefined,
		}, { useRAG })

		await AuditService.logAIAnalysis({
			userId: session.user.id,
			patientId: requestData.patient.id,
			analysisType: 'treatment_recommendation',
			durationMs: Date.now() - startTime,
			success: true,
		}).catch(() => {
			// Failed to log audit event
		})

		return NextResponse.json({ analysis, usedRAG: useRAG ?? false })
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: error.issues[0].message },
				{ status: 400 }
			)
		}

		return NextResponse.json(
			{ error: 'Failed to analyze treatment' },
			{ status: 500 }
		)
	}
}
