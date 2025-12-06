import { PrismaClient } from '../../lib/generated/prisma'

const prisma = new PrismaClient()

interface SevereConditionSeed {
	conditionName: string
	keywords: string[]
	vitalThresholds: Record<string, number>
	riskCategory: string
	requiredValidations: string[]
	autoEscalate: boolean
}

const severeConditions: SevereConditionSeed[] = [
	{
		conditionName: 'Acute Myocardial Infarction',
		keywords: [
			'heart attack',
			'myocardial infarction',
			'mi',
			'stemi',
			'nstemi',
			'chest pain radiating',
			'crushing chest pain',
			'cardiac arrest',
		],
		vitalThresholds: {
			systolicBpMin: 90,
			systolicBpMax: 180,
			heartRateMin: 50,
			heartRateMax: 120,
			oxygenSaturationMin: 92,
		},
		riskCategory: 'CRITICAL',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE', 'PUBMED'],
		autoEscalate: true,
	},
	{
		conditionName: 'Stroke / CVA',
		keywords: [
			'stroke',
			'cva',
			'cerebrovascular accident',
			'tia',
			'transient ischemic attack',
			'facial drooping',
			'sudden numbness',
			'sudden confusion',
			'sudden vision loss',
			'sudden severe headache',
			'slurred speech',
		],
		vitalThresholds: {
			systolicBpMax: 220,
			diastolicBpMax: 120,
		},
		riskCategory: 'CRITICAL',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE', 'PUBMED'],
		autoEscalate: true,
	},
	{
		conditionName: 'Anaphylaxis',
		keywords: [
			'anaphylaxis',
			'anaphylactic shock',
			'severe allergic reaction',
			'throat swelling',
			'difficulty breathing after exposure',
			'hives with breathing difficulty',
		],
		vitalThresholds: {
			systolicBpMin: 90,
			heartRateMax: 150,
			oxygenSaturationMin: 90,
		},
		riskCategory: 'CRITICAL',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE'],
		autoEscalate: true,
	},
	{
		conditionName: 'Sepsis / Septic Shock',
		keywords: [
			'sepsis',
			'septic shock',
			'severe infection',
			'systemic infection',
			'bacteremia',
		],
		vitalThresholds: {
			systolicBpMin: 90,
			heartRateMax: 130,
			temperatureMax: 104,
			respiratoryRateMax: 30,
		},
		riskCategory: 'CRITICAL',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE', 'PUBMED'],
		autoEscalate: true,
	},
	{
		conditionName: 'Acute Respiratory Failure',
		keywords: [
			'respiratory failure',
			'acute respiratory distress',
			'ards',
			'severe shortness of breath',
			'respiratory arrest',
			'cannot breathe',
		],
		vitalThresholds: {
			oxygenSaturationMin: 88,
			respiratoryRateMin: 8,
			respiratoryRateMax: 35,
		},
		riskCategory: 'CRITICAL',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE'],
		autoEscalate: true,
	},
	{
		conditionName: 'Status Epilepticus',
		keywords: [
			'status epilepticus',
			'prolonged seizure',
			'continuous seizure',
			'seizure lasting more than 5 minutes',
			'multiple seizures',
		],
		vitalThresholds: {},
		riskCategory: 'CRITICAL',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE'],
		autoEscalate: true,
	},
	{
		conditionName: 'Severe Hypoglycemia',
		keywords: [
			'severe hypoglycemia',
			'blood sugar below 40',
			'diabetic emergency',
			'hypoglycemic coma',
			'insulin shock',
		],
		vitalThresholds: {
			heartRateMax: 120,
		},
		riskCategory: 'CRITICAL',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE'],
		autoEscalate: true,
	},
	{
		conditionName: 'Diabetic Ketoacidosis',
		keywords: [
			'diabetic ketoacidosis',
			'dka',
			'ketoacidosis',
			'fruity breath diabetes',
		],
		vitalThresholds: {
			heartRateMax: 120,
			respiratoryRateMax: 30,
		},
		riskCategory: 'CRITICAL',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE', 'PUBMED'],
		autoEscalate: true,
	},
	{
		conditionName: 'Pulmonary Embolism',
		keywords: [
			'pulmonary embolism',
			'pe',
			'blood clot lung',
			'sudden shortness of breath',
			'chest pain with shortness of breath',
		],
		vitalThresholds: {
			oxygenSaturationMin: 90,
			heartRateMax: 130,
			systolicBpMin: 90,
		},
		riskCategory: 'CRITICAL',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE', 'PUBMED'],
		autoEscalate: true,
	},
	{
		conditionName: 'Suicidal Ideation',
		keywords: [
			'suicidal ideation',
			'suicidal thoughts',
			'want to kill myself',
			'want to die',
			'self harm',
			'suicide attempt',
			'overdose intentional',
		],
		vitalThresholds: {},
		riskCategory: 'CRITICAL',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE'],
		autoEscalate: true,
	},
	{
		conditionName: 'Meningitis',
		keywords: [
			'meningitis',
			'bacterial meningitis',
			'stiff neck with fever',
			'severe headache with fever',
			'photophobia with fever',
		],
		vitalThresholds: {
			temperatureMax: 104,
			heartRateMax: 120,
		},
		riskCategory: 'CRITICAL',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE', 'PUBMED'],
		autoEscalate: true,
	},
	{
		conditionName: 'Acute Appendicitis',
		keywords: [
			'appendicitis',
			'right lower quadrant pain',
			'mcburney point tenderness',
			'rebound tenderness',
		],
		vitalThresholds: {
			temperatureMax: 102,
		},
		riskCategory: 'URGENT',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE'],
		autoEscalate: false,
	},
	{
		conditionName: 'Acute Pancreatitis',
		keywords: [
			'pancreatitis',
			'severe epigastric pain',
			'pain radiating to back',
		],
		vitalThresholds: {
			heartRateMax: 120,
			temperatureMax: 102,
		},
		riskCategory: 'URGENT',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE'],
		autoEscalate: false,
	},
	{
		conditionName: 'Deep Vein Thrombosis',
		keywords: [
			'deep vein thrombosis',
			'dvt',
			'leg swelling unilateral',
			'calf pain swelling',
			'blood clot leg',
		],
		vitalThresholds: {},
		riskCategory: 'URGENT',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE'],
		autoEscalate: false,
	},
	{
		conditionName: 'Severe Asthma Exacerbation',
		keywords: [
			'severe asthma attack',
			'asthma exacerbation',
			'status asthmaticus',
			'cannot speak full sentences',
			'accessory muscle use',
		],
		vitalThresholds: {
			oxygenSaturationMin: 90,
			respiratoryRateMax: 30,
			heartRateMax: 120,
		},
		riskCategory: 'URGENT',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE'],
		autoEscalate: false,
	},
	{
		conditionName: 'COPD Exacerbation',
		keywords: [
			'copd exacerbation',
			'copd flare',
			'chronic bronchitis exacerbation',
			'emphysema exacerbation',
		],
		vitalThresholds: {
			oxygenSaturationMin: 88,
			respiratoryRateMax: 28,
		},
		riskCategory: 'URGENT',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE'],
		autoEscalate: false,
	},
	{
		conditionName: 'Hypertensive Crisis',
		keywords: [
			'hypertensive crisis',
			'hypertensive emergency',
			'malignant hypertension',
			'severely elevated blood pressure',
		],
		vitalThresholds: {
			systolicBpMax: 180,
			diastolicBpMax: 120,
		},
		riskCategory: 'URGENT',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE'],
		autoEscalate: false,
	},
	{
		conditionName: 'Acute Kidney Injury',
		keywords: [
			'acute kidney injury',
			'aki',
			'acute renal failure',
			'decreased urine output',
			'anuria',
		],
		vitalThresholds: {},
		riskCategory: 'HIGH_RISK',
		requiredValidations: ['FDA', 'INTERACTION'],
		autoEscalate: false,
	},
	{
		conditionName: 'Gastrointestinal Bleeding',
		keywords: [
			'gi bleeding',
			'gastrointestinal bleeding',
			'melena',
			'hematemesis',
			'blood in stool',
			'vomiting blood',
			'black tarry stool',
		],
		vitalThresholds: {
			systolicBpMin: 90,
			heartRateMax: 120,
		},
		riskCategory: 'URGENT',
		requiredValidations: ['FDA', 'INTERACTION', 'GUIDELINE'],
		autoEscalate: false,
	},
	{
		conditionName: 'Severe Dehydration',
		keywords: [
			'severe dehydration',
			'hypovolemia',
			'volume depletion',
			'no urine output',
		],
		vitalThresholds: {
			systolicBpMin: 90,
			heartRateMax: 120,
		},
		riskCategory: 'HIGH_RISK',
		requiredValidations: ['FDA', 'INTERACTION'],
		autoEscalate: false,
	},
]

async function seed() {
	console.log('Seeding severe conditions...')

	for (const condition of severeConditions) {
		await prisma.severeCondition.upsert({
			where: {
				id: condition.conditionName.toLowerCase().replace(/\s+/g, '-').slice(0, 36),
			},
			update: {
				conditionName: condition.conditionName,
				keywords: condition.keywords,
				vitalThresholds: condition.vitalThresholds,
				riskCategory: condition.riskCategory,
				requiredValidations: condition.requiredValidations,
				autoEscalate: condition.autoEscalate,
			},
			create: {
				conditionName: condition.conditionName,
				keywords: condition.keywords,
				vitalThresholds: condition.vitalThresholds,
				riskCategory: condition.riskCategory,
				requiredValidations: condition.requiredValidations,
				autoEscalate: condition.autoEscalate,
			},
		})
		console.log(`Seeded: ${condition.conditionName}`)
	}

	console.log(`Seeded ${severeConditions.length} severe conditions`)
}

seed()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

export { severeConditions }
