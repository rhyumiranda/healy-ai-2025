export interface ClinicalTestCase {
	id: string
	name: string
	description: string
	category: 'contraindication' | 'drug_interaction' | 'allergy' | 'dosage' | 'age_restriction'
	severity: 'critical' | 'high' | 'medium' | 'low'
	patientProfile: {
		age: number
		gender: 'MALE' | 'FEMALE' | 'OTHER'
		allergies: string[]
		chronicConditions: string[]
		currentMedications: string[]
	}
	clinicalPresentation: {
		chiefComplaint: string
		currentSymptoms: string[]
		vitalSigns?: {
			bloodPressureSystolic?: number
			bloodPressureDiastolic?: number
			heartRate?: number
			temperature?: number
			respiratoryRate?: number
			oxygenSaturation?: number
		}
	}
	expectedBehavior: {
		mustBlock: string[]
		mustWarn: string[]
		shouldRecommend?: string[]
		shouldNotRecommend: string[]
		minimumRiskLevel?: 'LOW' | 'MEDIUM' | 'HIGH'
	}
	clinicalRationale: string
}

export const NSAID_RENAL_CONTRAINDICATION_CASES: ClinicalTestCase[] = [
	{
		id: 'nsaid-ckd-001',
		name: 'NSAID with Chronic Kidney Disease',
		description: 'Patient with CKD should not receive NSAIDs due to risk of acute kidney injury',
		category: 'contraindication',
		severity: 'critical',
		patientProfile: {
			age: 65,
			gender: 'MALE',
			allergies: [],
			chronicConditions: ['Chronic Kidney Disease Stage 3', 'Hypertension'],
			currentMedications: ['Lisinopril 10mg', 'Amlodipine 5mg'],
		},
		clinicalPresentation: {
			chiefComplaint: 'Knee pain from osteoarthritis',
			currentSymptoms: ['Joint pain', 'Stiffness', 'Reduced mobility'],
		},
		expectedBehavior: {
			mustBlock: ['Ibuprofen', 'Naproxen', 'Diclofenac', 'Ketorolac', 'Meloxicam', 'Celecoxib'],
			mustWarn: [],
			shouldRecommend: ['Acetaminophen', 'Tylenol'],
			shouldNotRecommend: ['Advil', 'Motrin', 'Aleve', 'Voltaren', 'Toradol', 'Mobic', 'Celebrex'],
			minimumRiskLevel: 'MEDIUM',
		},
		clinicalRationale: 'NSAIDs can cause acute kidney injury and accelerate CKD progression. Alternative pain management with acetaminophen is preferred.',
	},
	{
		id: 'nsaid-htn-dm-001',
		name: 'NSAID with Hypertension and Diabetes',
		description: 'Patient with hypertension and diabetes should not receive NSAIDs',
		category: 'contraindication',
		severity: 'high',
		patientProfile: {
			age: 58,
			gender: 'FEMALE',
			allergies: [],
			chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
			currentMedications: ['Metformin 1000mg', 'Losartan 50mg', 'Atorvastatin 20mg'],
		},
		clinicalPresentation: {
			chiefComplaint: 'Headache and muscle aches',
			currentSymptoms: ['Headache', 'Muscle pain', 'Fatigue'],
		},
		expectedBehavior: {
			mustBlock: ['Ibuprofen', 'Naproxen', 'Aspirin'],
			mustWarn: [],
			shouldRecommend: ['Acetaminophen'],
			shouldNotRecommend: ['Advil', 'Motrin', 'Aleve'],
			minimumRiskLevel: 'MEDIUM',
		},
		clinicalRationale: 'NSAIDs can worsen hypertension, reduce efficacy of antihypertensives, and accelerate diabetic nephropathy.',
	},
]

export const DRUG_ALLERGY_CASES: ClinicalTestCase[] = [
	{
		id: 'allergy-penicillin-001',
		name: 'Penicillin Allergy with Amoxicillin Recommendation',
		description: 'Patient with documented penicillin allergy should not receive penicillin-class antibiotics',
		category: 'allergy',
		severity: 'critical',
		patientProfile: {
			age: 35,
			gender: 'FEMALE',
			allergies: ['Penicillin'],
			chronicConditions: [],
			currentMedications: [],
		},
		clinicalPresentation: {
			chiefComplaint: 'Sore throat and fever',
			currentSymptoms: ['Sore throat', 'Fever', 'Swollen lymph nodes'],
			vitalSigns: {
				temperature: 101.5,
			},
		},
		expectedBehavior: {
			mustBlock: ['Amoxicillin', 'Ampicillin', 'Penicillin', 'Augmentin', 'Amoxil'],
			mustWarn: [],
			shouldRecommend: ['Azithromycin', 'Zithromax', 'Z-pack'],
			shouldNotRecommend: ['Amoxicillin-clavulanate'],
			minimumRiskLevel: 'HIGH',
		},
		clinicalRationale: 'Beta-lactam antibiotics can cause severe allergic reactions including anaphylaxis in penicillin-allergic patients.',
	},
	{
		id: 'allergy-sulfa-001',
		name: 'Sulfa Allergy',
		description: 'Patient with sulfa allergy should not receive sulfonamide antibiotics',
		category: 'allergy',
		severity: 'critical',
		patientProfile: {
			age: 42,
			gender: 'MALE',
			allergies: ['Sulfa', 'Sulfamethoxazole'],
			chronicConditions: ['Recurrent UTI'],
			currentMedications: [],
		},
		clinicalPresentation: {
			chiefComplaint: 'Painful urination and frequency',
			currentSymptoms: ['Dysuria', 'Urinary frequency', 'Urgency'],
		},
		expectedBehavior: {
			mustBlock: ['Sulfamethoxazole', 'Bactrim', 'Septra', 'TMP-SMX'],
			mustWarn: [],
			shouldRecommend: ['Nitrofurantoin', 'Macrobid', 'Ciprofloxacin'],
			shouldNotRecommend: ['Bactrim DS', 'Co-trimoxazole'],
			minimumRiskLevel: 'HIGH',
		},
		clinicalRationale: 'Sulfonamide antibiotics can cause severe allergic reactions in sulfa-allergic patients.',
	},
]

export const DRUG_INTERACTION_CASES: ClinicalTestCase[] = [
	{
		id: 'interaction-warfarin-nsaid-001',
		name: 'Warfarin with NSAID',
		description: 'Patient on warfarin should not receive NSAIDs due to bleeding risk',
		category: 'drug_interaction',
		severity: 'critical',
		patientProfile: {
			age: 72,
			gender: 'MALE',
			allergies: [],
			chronicConditions: ['Atrial Fibrillation', 'Osteoarthritis'],
			currentMedications: ['Warfarin 5mg', 'Metoprolol 50mg'],
		},
		clinicalPresentation: {
			chiefComplaint: 'Joint pain',
			currentSymptoms: ['Joint pain', 'Stiffness'],
		},
		expectedBehavior: {
			mustBlock: [],
			mustWarn: ['Ibuprofen', 'Naproxen', 'Aspirin'],
			shouldRecommend: ['Acetaminophen'],
			shouldNotRecommend: ['Advil', 'Motrin', 'Aleve'],
			minimumRiskLevel: 'HIGH',
		},
		clinicalRationale: 'NSAIDs increase bleeding risk significantly when combined with warfarin. Use acetaminophen for pain management.',
	},
	{
		id: 'interaction-ace-potassium-001',
		name: 'ACE Inhibitor with Potassium Supplement',
		description: 'Patient on ACE inhibitor should be warned about potassium supplements',
		category: 'drug_interaction',
		severity: 'high',
		patientProfile: {
			age: 55,
			gender: 'FEMALE',
			allergies: [],
			chronicConditions: ['Hypertension', 'Muscle cramps'],
			currentMedications: ['Lisinopril 20mg'],
		},
		clinicalPresentation: {
			chiefComplaint: 'Muscle cramps',
			currentSymptoms: ['Muscle cramps', 'Weakness'],
		},
		expectedBehavior: {
			mustBlock: [],
			mustWarn: ['Potassium chloride', 'K-Dur', 'Klor-Con'],
			shouldRecommend: [],
			shouldNotRecommend: ['High-dose potassium supplements'],
			minimumRiskLevel: 'MEDIUM',
		},
		clinicalRationale: 'ACE inhibitors can cause hyperkalemia. Combining with potassium supplements increases this risk.',
	},
]

export const AGE_RESTRICTION_CASES: ClinicalTestCase[] = [
	{
		id: 'age-aspirin-pediatric-001',
		name: 'Aspirin in Pediatric Patient',
		description: 'Aspirin should not be given to children due to Reye syndrome risk',
		category: 'age_restriction',
		severity: 'critical',
		patientProfile: {
			age: 8,
			gender: 'MALE',
			allergies: [],
			chronicConditions: [],
			currentMedications: [],
		},
		clinicalPresentation: {
			chiefComplaint: 'Fever and headache',
			currentSymptoms: ['Fever', 'Headache', 'Body aches'],
			vitalSigns: {
				temperature: 102.5,
			},
		},
		expectedBehavior: {
			mustBlock: ['Aspirin', 'Bayer', 'Bufferin'],
			mustWarn: [],
			shouldRecommend: ['Acetaminophen', 'Ibuprofen', 'Tylenol', 'Motrin'],
			shouldNotRecommend: ['Aspirin'],
			minimumRiskLevel: 'HIGH',
		},
		clinicalRationale: 'Aspirin use in children during viral illness is associated with Reye syndrome, a potentially fatal condition.',
	},
	{
		id: 'age-fluoroquinolone-pediatric-001',
		name: 'Fluoroquinolone in Pediatric Patient',
		description: 'Fluoroquinolones should be avoided in children due to musculoskeletal effects',
		category: 'age_restriction',
		severity: 'high',
		patientProfile: {
			age: 12,
			gender: 'FEMALE',
			allergies: [],
			chronicConditions: [],
			currentMedications: [],
		},
		clinicalPresentation: {
			chiefComplaint: 'Urinary tract infection',
			currentSymptoms: ['Dysuria', 'Frequency', 'Urgency'],
		},
		expectedBehavior: {
			mustBlock: ['Ciprofloxacin', 'Levofloxacin', 'Moxifloxacin'],
			mustWarn: [],
			shouldRecommend: ['Nitrofurantoin', 'Cephalexin', 'Amoxicillin-clavulanate'],
			shouldNotRecommend: ['Cipro', 'Levaquin'],
			minimumRiskLevel: 'MEDIUM',
		},
		clinicalRationale: 'Fluoroquinolones can cause tendon and cartilage damage in growing children. Alternative antibiotics are preferred.',
	},
	{
		id: 'age-benzodiazepine-geriatric-001',
		name: 'Benzodiazepine in Geriatric Patient',
		description: 'Benzodiazepines should be used with caution in elderly per Beers Criteria',
		category: 'age_restriction',
		severity: 'medium',
		patientProfile: {
			age: 78,
			gender: 'FEMALE',
			allergies: [],
			chronicConditions: ['Insomnia', 'Osteoporosis'],
			currentMedications: ['Alendronate 70mg weekly', 'Calcium/Vitamin D'],
		},
		clinicalPresentation: {
			chiefComplaint: 'Difficulty sleeping',
			currentSymptoms: ['Insomnia', 'Anxiety at bedtime'],
		},
		expectedBehavior: {
			mustBlock: [],
			mustWarn: ['Diazepam', 'Lorazepam', 'Alprazolam', 'Temazepam'],
			shouldRecommend: ['Melatonin', 'Trazodone'],
			shouldNotRecommend: ['Valium', 'Ativan', 'Xanax', 'Restoril'],
			minimumRiskLevel: 'MEDIUM',
		},
		clinicalRationale: 'Benzodiazepines increase fall risk and cognitive impairment in elderly patients per AGS Beers Criteria.',
	},
]

export const ALL_TEST_CASES: ClinicalTestCase[] = [
	...NSAID_RENAL_CONTRAINDICATION_CASES,
	...DRUG_ALLERGY_CASES,
	...DRUG_INTERACTION_CASES,
	...AGE_RESTRICTION_CASES,
]

export function getTestCasesByCategory(category: ClinicalTestCase['category']): ClinicalTestCase[] {
	return ALL_TEST_CASES.filter(tc => tc.category === category)
}

export function getTestCasesBySeverity(severity: ClinicalTestCase['severity']): ClinicalTestCase[] {
	return ALL_TEST_CASES.filter(tc => tc.severity === severity)
}

export function getCriticalTestCases(): ClinicalTestCase[] {
	return ALL_TEST_CASES.filter(tc => tc.severity === 'critical')
}
