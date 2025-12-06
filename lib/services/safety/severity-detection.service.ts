import { prisma } from '@/lib/prisma'
import type {
	SeverityLevel,
	SeverityAssessment,
	SeverityTrigger,
	VitalSignThresholds,
	ValidationSource,
	SevereConditionRecord,
} from './types'

interface VitalSigns {
	bloodPressureSystolic?: number
	bloodPressureDiastolic?: number
	heartRate?: number
	temperature?: number
	respiratoryRate?: number
	oxygenSaturation?: number
}

interface PatientData {
	chiefComplaint: string
	currentSymptoms: string[]
	vitalSigns?: VitalSigns
	chronicConditions?: string[]
	allergies?: string[]
	currentMedications?: string[]
}

const CRITICAL_KEYWORDS = [
	'chest pain',
	'heart attack',
	'myocardial infarction',
	'mi',
	'cardiac arrest',
	'stroke',
	'cva',
	'cerebrovascular accident',
	'difficulty breathing',
	'severe shortness of breath',
	'respiratory failure',
	'anaphylaxis',
	'anaphylactic shock',
	'severe allergic reaction',
	'loss of consciousness',
	'unresponsive',
	'unconscious',
	'seizure',
	'status epilepticus',
	'suicidal ideation',
	'suicidal thoughts',
	'self harm',
	'severe bleeding',
	'hemorrhage',
	'internal bleeding',
	'sepsis',
	'septic shock',
	'meningitis',
	'overdose',
	'poisoning',
]

const URGENT_KEYWORDS = [
	'severe pain',
	'acute pain',
	'high fever',
	'persistent vomiting',
	'blood in stool',
	'blood in urine',
	'severe headache',
	'worst headache of life',
	'sudden vision loss',
	'sudden hearing loss',
	'facial drooping',
	'slurred speech',
	'numbness',
	'paralysis',
	'severe dehydration',
	'diabetic ketoacidosis',
	'dka',
	'hypoglycemic episode',
	'severe hypoglycemia',
	'pulmonary embolism',
	'deep vein thrombosis',
	'dvt',
	'appendicitis',
	'bowel obstruction',
]

const HIGH_RISK_KEYWORDS = [
	'moderate pain',
	'infection',
	'fever',
	'swelling',
	'rash',
	'dizziness',
	'fainting',
	'syncope',
	'palpitations',
	'irregular heartbeat',
	'asthma attack',
	'copd exacerbation',
	'pneumonia',
	'urinary tract infection',
	'uti',
	'kidney infection',
	'cellulitis',
	'abscess',
]

const DEFAULT_VITAL_THRESHOLDS: VitalSignThresholds = {
	systolicBpMin: 90,
	systolicBpMax: 180,
	diastolicBpMin: 60,
	diastolicBpMax: 120,
	heartRateMin: 50,
	heartRateMax: 120,
	temperatureMax: 103,
	respiratoryRateMin: 10,
	respiratoryRateMax: 30,
	oxygenSaturationMin: 92,
}

const CRITICAL_VITAL_THRESHOLDS: VitalSignThresholds = {
	systolicBpMin: 70,
	systolicBpMax: 200,
	diastolicBpMin: 40,
	diastolicBpMax: 130,
	heartRateMin: 40,
	heartRateMax: 150,
	temperatureMax: 105,
	respiratoryRateMin: 8,
	respiratoryRateMax: 35,
	oxygenSaturationMin: 88,
}

export class SeverityDetectionService {
	private static severeConditionsCache: SevereConditionRecord[] | null = null
	private static cacheTimestamp: number = 0
	private static readonly CACHE_TTL = 5 * 60 * 1000

	static async assess(patient: PatientData): Promise<SeverityAssessment> {
		const triggers: SeverityTrigger[] = []

		const keywordTriggers = this.detectKeywordSeverity(patient)
		triggers.push(...keywordTriggers)

		if (patient.vitalSigns) {
			const vitalTriggers = this.detectVitalSignSeverity(patient.vitalSigns)
			triggers.push(...vitalTriggers)
		}

		const conditionTriggers = await this.detectConditionSeverity(patient)
		triggers.push(...conditionTriggers)

		const severityLevel = this.determineSeverityLevel(triggers)
		const isSevere = severityLevel !== 'STANDARD'
		const autoEscalate = severityLevel === 'CRITICAL'
		const requiredValidations = this.getRequiredValidations(severityLevel)
		const confidenceModifier = this.getConfidenceModifier(severityLevel)

		return {
			isSevere,
			severityLevel,
			triggers,
			requiredValidations,
			autoEscalate,
			confidenceModifier,
		}
	}

	private static detectKeywordSeverity(patient: PatientData): SeverityTrigger[] {
		const triggers: SeverityTrigger[] = []
		const textToSearch = [
			patient.chiefComplaint,
			...patient.currentSymptoms,
		].join(' ').toLowerCase()

		for (const keyword of CRITICAL_KEYWORDS) {
			if (textToSearch.includes(keyword.toLowerCase())) {
				triggers.push({
					type: 'keyword',
					value: keyword,
					severity: 'CRITICAL',
				})
			}
		}

		for (const keyword of URGENT_KEYWORDS) {
			if (textToSearch.includes(keyword.toLowerCase())) {
				triggers.push({
					type: 'keyword',
					value: keyword,
					severity: 'URGENT',
				})
			}
		}

		for (const keyword of HIGH_RISK_KEYWORDS) {
			if (textToSearch.includes(keyword.toLowerCase())) {
				triggers.push({
					type: 'keyword',
					value: keyword,
					severity: 'HIGH_RISK',
				})
			}
		}

		return triggers
	}

	private static detectVitalSignSeverity(vitals: VitalSigns): SeverityTrigger[] {
		const triggers: SeverityTrigger[] = []

		if (vitals.bloodPressureSystolic !== undefined) {
			if (vitals.bloodPressureSystolic < CRITICAL_VITAL_THRESHOLDS.systolicBpMin! ||
				vitals.bloodPressureSystolic > CRITICAL_VITAL_THRESHOLDS.systolicBpMax!) {
				triggers.push({
					type: 'vital_sign',
					value: `Systolic BP: ${vitals.bloodPressureSystolic} mmHg (critical)`,
					severity: 'CRITICAL',
				})
			} else if (vitals.bloodPressureSystolic < DEFAULT_VITAL_THRESHOLDS.systolicBpMin! ||
				vitals.bloodPressureSystolic > DEFAULT_VITAL_THRESHOLDS.systolicBpMax!) {
				triggers.push({
					type: 'vital_sign',
					value: `Systolic BP: ${vitals.bloodPressureSystolic} mmHg`,
					severity: 'URGENT',
				})
			}
		}

		if (vitals.heartRate !== undefined) {
			if (vitals.heartRate < CRITICAL_VITAL_THRESHOLDS.heartRateMin! ||
				vitals.heartRate > CRITICAL_VITAL_THRESHOLDS.heartRateMax!) {
				triggers.push({
					type: 'vital_sign',
					value: `Heart rate: ${vitals.heartRate} bpm (critical)`,
					severity: 'CRITICAL',
				})
			} else if (vitals.heartRate < DEFAULT_VITAL_THRESHOLDS.heartRateMin! ||
				vitals.heartRate > DEFAULT_VITAL_THRESHOLDS.heartRateMax!) {
				triggers.push({
					type: 'vital_sign',
					value: `Heart rate: ${vitals.heartRate} bpm`,
					severity: 'URGENT',
				})
			}
		}

		if (vitals.oxygenSaturation !== undefined) {
			if (vitals.oxygenSaturation < CRITICAL_VITAL_THRESHOLDS.oxygenSaturationMin!) {
				triggers.push({
					type: 'vital_sign',
					value: `O2 saturation: ${vitals.oxygenSaturation}% (critical)`,
					severity: 'CRITICAL',
				})
			} else if (vitals.oxygenSaturation < DEFAULT_VITAL_THRESHOLDS.oxygenSaturationMin!) {
				triggers.push({
					type: 'vital_sign',
					value: `O2 saturation: ${vitals.oxygenSaturation}%`,
					severity: 'URGENT',
				})
			}
		}

		if (vitals.temperature !== undefined) {
			if (vitals.temperature > CRITICAL_VITAL_THRESHOLDS.temperatureMax!) {
				triggers.push({
					type: 'vital_sign',
					value: `Temperature: ${vitals.temperature}°F (critical)`,
					severity: 'CRITICAL',
				})
			} else if (vitals.temperature > DEFAULT_VITAL_THRESHOLDS.temperatureMax!) {
				triggers.push({
					type: 'vital_sign',
					value: `Temperature: ${vitals.temperature}°F`,
					severity: 'URGENT',
				})
			}
		}

		if (vitals.respiratoryRate !== undefined) {
			if (vitals.respiratoryRate < CRITICAL_VITAL_THRESHOLDS.respiratoryRateMin! ||
				vitals.respiratoryRate > CRITICAL_VITAL_THRESHOLDS.respiratoryRateMax!) {
				triggers.push({
					type: 'vital_sign',
					value: `Respiratory rate: ${vitals.respiratoryRate}/min (critical)`,
					severity: 'CRITICAL',
				})
			} else if (vitals.respiratoryRate < DEFAULT_VITAL_THRESHOLDS.respiratoryRateMin! ||
				vitals.respiratoryRate > DEFAULT_VITAL_THRESHOLDS.respiratoryRateMax!) {
				triggers.push({
					type: 'vital_sign',
					value: `Respiratory rate: ${vitals.respiratoryRate}/min`,
					severity: 'URGENT',
				})
			}
		}

		return triggers
	}

	private static async detectConditionSeverity(patient: PatientData): Promise<SeverityTrigger[]> {
		const triggers: SeverityTrigger[] = []
		const severeConditions = await this.getSevereConditions()

		const patientText = [
			patient.chiefComplaint,
			...patient.currentSymptoms,
			...(patient.chronicConditions || []),
		].join(' ').toLowerCase()

		for (const condition of severeConditions) {
			for (const keyword of condition.keywords) {
				if (patientText.includes(keyword.toLowerCase())) {
					triggers.push({
						type: 'condition',
						value: condition.conditionName,
						severity: condition.riskCategory,
					})
					break
				}
			}
		}

		return triggers
	}

	private static async getSevereConditions(): Promise<SevereConditionRecord[]> {
		const now = Date.now()

		if (this.severeConditionsCache && (now - this.cacheTimestamp) < this.CACHE_TTL) {
			return this.severeConditionsCache
		}

		try {
			const conditions = await prisma.severeCondition.findMany()

			this.severeConditionsCache = conditions.map((c) => ({
				id: c.id,
				conditionName: c.conditionName,
				keywords: c.keywords,
				vitalThresholds: c.vitalThresholds as VitalSignThresholds,
				riskCategory: c.riskCategory as SeverityLevel,
				requiredValidations: c.requiredValidations as ValidationSource[],
				autoEscalate: c.autoEscalate,
			}))
			this.cacheTimestamp = now

			return this.severeConditionsCache
		} catch {
			return []
		}
	}

	private static determineSeverityLevel(triggers: SeverityTrigger[]): SeverityLevel {
		if (triggers.some((t) => t.severity === 'CRITICAL')) {
			return 'CRITICAL'
		}
		if (triggers.some((t) => t.severity === 'URGENT')) {
			return 'URGENT'
		}
		if (triggers.some((t) => t.severity === 'HIGH_RISK')) {
			return 'HIGH_RISK'
		}
		return 'STANDARD'
	}

	private static getRequiredValidations(severity: SeverityLevel): ValidationSource[] {
		switch (severity) {
			case 'CRITICAL':
				return ['FDA', 'INTERACTION', 'GUIDELINE', 'PUBMED']
			case 'URGENT':
				return ['FDA', 'INTERACTION', 'GUIDELINE']
			case 'HIGH_RISK':
				return ['FDA', 'INTERACTION']
			default:
				return ['FDA']
		}
	}

	private static getConfidenceModifier(severity: SeverityLevel): number {
		switch (severity) {
			case 'CRITICAL':
				return -20
			case 'URGENT':
				return -10
			case 'HIGH_RISK':
				return -5
			default:
				return 0
		}
	}

	static clearCache(): void {
		this.severeConditionsCache = null
		this.cacheTimestamp = 0
	}
}
