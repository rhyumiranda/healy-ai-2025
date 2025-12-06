import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const severeConditions = [
	{
		conditionName: 'Acute Myocardial Infarction',
		keywords: ['heart attack', 'myocardial infarction', 'mi', 'stemi', 'nstemi', 'chest pain radiating', 'crushing chest pain', 'cardiac arrest'],
		vitalThresholds: { systolicBpMin: 90, systolicBpMax: 180, heartRateMin: 50, heartRateMax: 120, oxygenSaturationMin: 92 },
		riskCategory: 'CRITICAL',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE', 'PUBMED'],
		autoEscalate: true,
	},
	{
		conditionName: 'Stroke / CVA',
		keywords: ['stroke', 'cva', 'cerebrovascular accident', 'tia', 'facial drooping', 'sudden numbness', 'slurred speech'],
		vitalThresholds: { systolicBpMax: 220, diastolicBpMax: 120 },
		riskCategory: 'CRITICAL',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE', 'PUBMED'],
		autoEscalate: true,
	},
	{
		conditionName: 'Anaphylaxis',
		keywords: ['anaphylaxis', 'anaphylactic shock', 'severe allergic reaction', 'throat swelling'],
		vitalThresholds: { systolicBpMin: 90, heartRateMax: 150, oxygenSaturationMin: 90 },
		riskCategory: 'CRITICAL',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE'],
		autoEscalate: true,
	},
	{
		conditionName: 'Sepsis / Septic Shock',
		keywords: ['sepsis', 'septic shock', 'severe infection', 'systemic infection'],
		vitalThresholds: { systolicBpMin: 90, heartRateMax: 130, temperatureMax: 104, respiratoryRateMax: 30 },
		riskCategory: 'CRITICAL',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE', 'PUBMED'],
		autoEscalate: true,
	},
	{
		conditionName: 'Acute Respiratory Failure',
		keywords: ['respiratory failure', 'acute respiratory distress', 'ards', 'severe shortness of breath'],
		vitalThresholds: { oxygenSaturationMin: 88, respiratoryRateMin: 8, respiratoryRateMax: 35 },
		riskCategory: 'CRITICAL',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE'],
		autoEscalate: true,
	},
	{
		conditionName: 'Status Epilepticus',
		keywords: ['status epilepticus', 'prolonged seizure', 'continuous seizure'],
		vitalThresholds: {},
		riskCategory: 'CRITICAL',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE'],
		autoEscalate: true,
	},
	{
		conditionName: 'Suicidal Ideation',
		keywords: ['suicidal ideation', 'suicidal thoughts', 'want to kill myself', 'self harm'],
		vitalThresholds: {},
		riskCategory: 'CRITICAL',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE'],
		autoEscalate: true,
	},
	{
		conditionName: 'Diabetic Ketoacidosis',
		keywords: ['diabetic ketoacidosis', 'dka', 'ketoacidosis'],
		vitalThresholds: { heartRateMax: 120, respiratoryRateMax: 30 },
		riskCategory: 'CRITICAL',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE', 'PUBMED'],
		autoEscalate: true,
	},
	{
		conditionName: 'Pulmonary Embolism',
		keywords: ['pulmonary embolism', 'pe', 'blood clot lung'],
		vitalThresholds: { oxygenSaturationMin: 90, heartRateMax: 130, systolicBpMin: 90 },
		riskCategory: 'CRITICAL',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE', 'PUBMED'],
		autoEscalate: true,
	},
	{
		conditionName: 'Meningitis',
		keywords: ['meningitis', 'bacterial meningitis', 'stiff neck with fever'],
		vitalThresholds: { temperatureMax: 104, heartRateMax: 120 },
		riskCategory: 'CRITICAL',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE', 'PUBMED'],
		autoEscalate: true,
	},
	{
		conditionName: 'Hypertensive Crisis',
		keywords: ['hypertensive crisis', 'hypertensive emergency', 'malignant hypertension'],
		vitalThresholds: { systolicBpMax: 180, diastolicBpMax: 120 },
		riskCategory: 'URGENT',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE'],
		autoEscalate: false,
	},
	{
		conditionName: 'Severe Asthma Exacerbation',
		keywords: ['severe asthma attack', 'asthma exacerbation', 'status asthmaticus'],
		vitalThresholds: { oxygenSaturationMin: 90, respiratoryRateMax: 30, heartRateMax: 120 },
		riskCategory: 'URGENT',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE'],
		autoEscalate: false,
	},
	{
		conditionName: 'GI Bleeding',
		keywords: ['gi bleeding', 'gastrointestinal bleeding', 'melena', 'hematemesis', 'blood in stool'],
		vitalThresholds: { systolicBpMin: 90, heartRateMax: 120 },
		riskCategory: 'URGENT',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE'],
		autoEscalate: false,
	},
	{
		conditionName: 'Deep Vein Thrombosis',
		keywords: ['deep vein thrombosis', 'dvt', 'blood clot leg'],
		vitalThresholds: {},
		riskCategory: 'URGENT',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE'],
		autoEscalate: false,
	},
	{
		conditionName: 'Acute Kidney Injury',
		keywords: ['acute kidney injury', 'aki', 'acute renal failure'],
		vitalThresholds: {},
		riskCategory: 'HIGH_RISK',
		requiredValidations: ['FDA', 'INTERACTION'],
		autoEscalate: false,
	},
]

export async function POST() {
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		let created = 0
		let updated = 0

		for (const condition of severeConditions) {
			const existing = await prisma.severeCondition.findFirst({
				where: { conditionName: condition.conditionName },
			})

			if (existing) {
				await prisma.severeCondition.update({
					where: { id: existing.id },
					data: {
						keywords: condition.keywords,
						vitalThresholds: condition.vitalThresholds,
						riskCategory: condition.riskCategory,
						requiredValidations: condition.requiredValidations,
						autoEscalate: condition.autoEscalate,
					},
				})
				updated++
			} else {
				await prisma.severeCondition.create({
					data: {
						conditionName: condition.conditionName,
						keywords: condition.keywords,
						vitalThresholds: condition.vitalThresholds,
						riskCategory: condition.riskCategory,
						requiredValidations: condition.requiredValidations,
						autoEscalate: condition.autoEscalate,
					},
				})
				created++
			}
		}

		return NextResponse.json({
			success: true,
			message: `Seeded ${created} new conditions, updated ${updated} existing`,
			totalConditions: severeConditions.length,
		})
	} catch (error) {
		console.error('Error seeding severe conditions:', error)
		return NextResponse.json(
			{ error: 'Failed to seed severe conditions' },
			{ status: 500 }
		)
	}
}

export async function GET() {
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const conditions = await prisma.severeCondition.findMany({
			orderBy: { conditionName: 'asc' },
		})

		return NextResponse.json({
			conditions,
			count: conditions.length,
		})
	} catch (error) {
		console.error('Error fetching severe conditions:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch severe conditions' },
			{ status: 500 }
		)
	}
}
