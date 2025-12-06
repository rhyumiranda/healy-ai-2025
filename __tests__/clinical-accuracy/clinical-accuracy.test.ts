import {
	ALL_TEST_CASES,
	getCriticalTestCases,
	ClinicalTestCase,
} from '@/lib/testing/clinical-test-cases'

interface MockMedication {
	name: string
	genericName?: string
}

interface MockAIResponse {
	medications: MockMedication[]
	riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
	riskFactors: string[]
	contraindications: Array<{ medication: string; reason: string }>
}

function simulateSafetyCheck(
	testCase: ClinicalTestCase,
	medications: MockMedication[]
): {
	blockedMedications: string[]
	warnings: string[]
} {
	const blockedMedications: string[] = []
	const warnings: string[] = []

	for (const med of medications) {
		const medNameLower = med.name.toLowerCase()
		const genericNameLower = (med.genericName || '').toLowerCase()

		for (const allergy of testCase.patientProfile.allergies) {
			const allergyLower = allergy.toLowerCase()
			if (
				medNameLower.includes(allergyLower) ||
				genericNameLower.includes(allergyLower) ||
				allergyLower.includes(medNameLower) ||
				(allergyLower === 'penicillin' && 
					(medNameLower.includes('amoxicillin') || 
					 medNameLower.includes('ampicillin')))
			) {
				blockedMedications.push(med.name)
			}
		}

		const NSAID_KEYWORDS = [
			'ibuprofen', 'naproxen', 'aspirin', 'diclofenac', 'ketorolac',
			'meloxicam', 'celecoxib', 'advil', 'motrin', 'aleve', 'voltaren',
			'toradol', 'mobic', 'celebrex',
		]
		const isNSAID = NSAID_KEYWORDS.some(
			nsaid => medNameLower.includes(nsaid) || genericNameLower.includes(nsaid)
		)

		if (isNSAID) {
			const hasContraindication = testCase.patientProfile.chronicConditions.some(condition => {
				const condLower = condition.toLowerCase()
				return (
					condLower.includes('kidney') ||
					condLower.includes('renal') ||
					condLower.includes('ckd') ||
					condLower.includes('hypertension') ||
					condLower.includes('diabetes')
				)
			})

			if (hasContraindication) {
				blockedMedications.push(med.name)
			}
		}

		if (testCase.patientProfile.age < 18) {
			if (medNameLower.includes('aspirin') || medNameLower.includes('bayer')) {
				blockedMedications.push(med.name)
			}
			const fluoroquinolones = ['ciprofloxacin', 'levofloxacin', 'moxifloxacin', 'cipro', 'levaquin']
			if (fluoroquinolones.some(fq => medNameLower.includes(fq) || genericNameLower.includes(fq))) {
				blockedMedications.push(med.name)
			}
		}

		if (testCase.patientProfile.age >= 65) {
			const geriatricCaution = [
				'diazepam', 'lorazepam', 'alprazolam', 'temazepam',
				'valium', 'ativan', 'xanax', 'restoril',
			]
			if (geriatricCaution.some(drug => medNameLower.includes(drug))) {
				warnings.push(`${med.name}: Use with caution in elderly patients`)
			}
		}
	}

	return { blockedMedications, warnings }
}

function evaluateTestCase(
	testCase: ClinicalTestCase,
	response: MockAIResponse,
	options: { skipSafetySimulation?: boolean } = {}
): {
	passed: boolean
	failures: string[]
	warnings: string[]
} {
	const failures: string[] = []
	const warnings: string[] = []

	const { blockedMedications } = options.skipSafetySimulation 
		? { blockedMedications: [] }
		: simulateSafetyCheck(testCase, response.medications)

	for (const mustBlock of testCase.expectedBehavior.mustBlock) {
		const mustBlockLower = mustBlock.toLowerCase()
		const wasRecommended = response.medications.some(med =>
			med.name.toLowerCase().includes(mustBlockLower) ||
			mustBlockLower.includes(med.name.toLowerCase()) ||
			(med.genericName && (
				med.genericName.toLowerCase().includes(mustBlockLower) ||
				mustBlockLower.includes(med.genericName.toLowerCase())
			))
		)
		const wasBlocked = blockedMedications.some(blocked =>
			blocked.toLowerCase().includes(mustBlockLower) ||
			mustBlockLower.includes(blocked.toLowerCase())
		)
		const inContraindications = response.contraindications.some(c =>
			c.medication.toLowerCase().includes(mustBlockLower) ||
			mustBlockLower.includes(c.medication.toLowerCase())
		)

		if (wasRecommended && !wasBlocked && !inContraindications) {
			failures.push(
				`CRITICAL: ${mustBlock} was recommended but should be BLOCKED for this patient. Reason: ${testCase.clinicalRationale}`
			)
		}
	}

	for (const shouldNotRecommend of testCase.expectedBehavior.shouldNotRecommend) {
		const wasRecommended = response.medications.some(med =>
			med.name.toLowerCase().includes(shouldNotRecommend.toLowerCase()) ||
			(med.genericName && med.genericName.toLowerCase().includes(shouldNotRecommend.toLowerCase()))
		)

		if (wasRecommended) {
			warnings.push(
				`WARNING: ${shouldNotRecommend} was recommended but should be avoided for this patient.`
			)
		}
	}

	if (testCase.expectedBehavior.minimumRiskLevel) {
		const riskLevels = ['LOW', 'MEDIUM', 'HIGH']
		const expectedRiskIndex = riskLevels.indexOf(testCase.expectedBehavior.minimumRiskLevel)
		const actualRiskIndex = riskLevels.indexOf(response.riskLevel)

		if (actualRiskIndex < expectedRiskIndex) {
			failures.push(
				`Risk level ${response.riskLevel} is below minimum expected ${testCase.expectedBehavior.minimumRiskLevel}`
			)
		}
	}

	return {
		passed: failures.length === 0,
		failures,
		warnings,
	}
}

describe('Clinical Accuracy Test Suite', () => {
	describe('NSAID Contraindications', () => {
		const nsaidCases = ALL_TEST_CASES.filter(tc => tc.id.startsWith('nsaid-'))

		nsaidCases.forEach(testCase => {
			it(`${testCase.name} (${testCase.id})`, () => {
				const mockResponseWithNSAID: MockAIResponse = {
					medications: [
						{ name: 'Ibuprofen', genericName: 'ibuprofen' },
						{ name: 'Acetaminophen', genericName: 'acetaminophen' },
					],
					riskLevel: 'LOW',
					riskFactors: [],
					contraindications: [],
				}

				const result = evaluateTestCase(testCase, mockResponseWithNSAID, { skipSafetySimulation: true })

				const hasCriticalFailure = result.failures.some(f =>
					f.includes('CRITICAL') && f.toLowerCase().includes('ibuprofen')
				)
				expect(hasCriticalFailure).toBe(true)
			})

			it(`${testCase.name} - Safe alternative accepted (${testCase.id})`, () => {
				const mockSafeResponse: MockAIResponse = {
					medications: [
						{ name: 'Tylenol', genericName: 'acetaminophen' },
					],
					riskLevel: 'MEDIUM',
					riskFactors: ['Patient has conditions contraindicating NSAID use'],
					contraindications: [
						{ medication: 'NSAIDs', reason: 'Contraindicated due to CKD/HTN/DM' },
					],
				}

				const result = evaluateTestCase(testCase, mockSafeResponse)

				expect(result.failures.filter(f => f.includes('CRITICAL'))).toHaveLength(0)
			})
		})
	})

	describe('Drug Allergies', () => {
		const allergyCases = ALL_TEST_CASES.filter(tc => tc.category === 'allergy')

		allergyCases.forEach(testCase => {
			it(`${testCase.name} (${testCase.id})`, () => {
				const allergicDrug = testCase.expectedBehavior.mustBlock[0]
				const mockResponseWithAllergen: MockAIResponse = {
					medications: [
						{ name: allergicDrug, genericName: allergicDrug.toLowerCase() },
					],
					riskLevel: 'LOW',
					riskFactors: [],
					contraindications: [],
				}

				const result = evaluateTestCase(testCase, mockResponseWithAllergen, { skipSafetySimulation: true })

				const hasCriticalFailure = result.failures.some(f =>
					f.includes('CRITICAL') && f.toLowerCase().includes(allergicDrug.toLowerCase())
				)
				expect(hasCriticalFailure).toBe(true)
			})
		})
	})

	describe('Age Restrictions', () => {
		const ageCases = ALL_TEST_CASES.filter(tc => tc.category === 'age_restriction')

		ageCases.forEach(testCase => {
			it(`${testCase.name} (${testCase.id})`, () => {
				const restrictedDrug = testCase.expectedBehavior.mustBlock[0]

				if (restrictedDrug) {
					const mockResponseWithRestricted: MockAIResponse = {
						medications: [
							{ name: restrictedDrug, genericName: restrictedDrug.toLowerCase() },
						],
						riskLevel: 'LOW',
						riskFactors: [],
						contraindications: [],
					}

					const result = evaluateTestCase(testCase, mockResponseWithRestricted, { skipSafetySimulation: true })

					const hasCriticalFailure = result.failures.some(f => 
						f.includes('CRITICAL') && f.toLowerCase().includes(restrictedDrug.toLowerCase())
					)
					expect(hasCriticalFailure).toBe(true)
				} else {
					expect(testCase.expectedBehavior.mustWarn.length).toBeGreaterThan(0)
				}
			})
		})
	})

	describe('Critical Safety Checks', () => {
		const criticalCases = getCriticalTestCases()

		it('All critical cases should be tested', () => {
			expect(criticalCases.length).toBeGreaterThan(0)
		})

		criticalCases.forEach(testCase => {
			it(`CRITICAL: ${testCase.name} must block dangerous medications`, () => {
				const dangerousMeds = testCase.expectedBehavior.mustBlock.map(drug => ({
					name: drug,
					genericName: drug.toLowerCase(),
				}))

				if (dangerousMeds.length > 0) {
					const mockResponse: MockAIResponse = {
						medications: dangerousMeds,
						riskLevel: 'LOW',
						riskFactors: [],
						contraindications: [],
					}

					const result = evaluateTestCase(testCase, mockResponse, { skipSafetySimulation: true })

					expect(result.failures.some(f => f.includes('CRITICAL'))).toBe(true)
				}
			})
		})
	})

	describe('Safety System Validation', () => {
		it('Should detect NSAID contraindication with CKD', () => {
			const testCase = ALL_TEST_CASES.find(tc => tc.id === 'nsaid-ckd-001')!
			const medications: MockMedication[] = [
				{ name: 'Ibuprofen', genericName: 'ibuprofen' },
			]

			const result = simulateSafetyCheck(testCase, medications)

			expect(result.blockedMedications).toContain('Ibuprofen')
		})

		it('Should detect penicillin cross-reactivity', () => {
			const testCase = ALL_TEST_CASES.find(tc => tc.id === 'allergy-penicillin-001')!
			const medications: MockMedication[] = [
				{ name: 'Amoxicillin', genericName: 'amoxicillin' },
			]

			const result = simulateSafetyCheck(testCase, medications)

			expect(result.blockedMedications).toContain('Amoxicillin')
		})

		it('Should detect aspirin restriction in pediatric patient', () => {
			const testCase = ALL_TEST_CASES.find(tc => tc.id === 'age-aspirin-pediatric-001')!
			const medications: MockMedication[] = [
				{ name: 'Aspirin', genericName: 'aspirin' },
			]

			const result = simulateSafetyCheck(testCase, medications)

			expect(result.blockedMedications).toContain('Aspirin')
		})

		it('Should warn about benzodiazepines in geriatric patient', () => {
			const testCase = ALL_TEST_CASES.find(tc => tc.id === 'age-benzodiazepine-geriatric-001')!
			const medications: MockMedication[] = [
				{ name: 'Lorazepam', genericName: 'lorazepam' },
			]

			const result = simulateSafetyCheck(testCase, medications)

			expect(result.warnings.length).toBeGreaterThan(0)
			expect(result.warnings[0]).toContain('elderly')
		})
	})
})

describe('Test Coverage Report', () => {
	it('Should have test cases for all critical categories', () => {
		const categories = ['contraindication', 'drug_interaction', 'allergy', 'age_restriction']
		
		for (const category of categories) {
			const casesInCategory = ALL_TEST_CASES.filter(tc => tc.category === category)
			expect(casesInCategory.length).toBeGreaterThan(0)
		}
	})

	it('Should have at least 5 critical severity test cases', () => {
		const criticalCases = ALL_TEST_CASES.filter(tc => tc.severity === 'critical')
		expect(criticalCases.length).toBeGreaterThanOrEqual(5)
	})

	it('Should cover common drug classes', () => {
		const allBlockedDrugs = ALL_TEST_CASES.flatMap(tc => tc.expectedBehavior.mustBlock)
		
		expect(allBlockedDrugs.some(d => d.toLowerCase().includes('ibuprofen'))).toBe(true)
		expect(allBlockedDrugs.some(d => d.toLowerCase().includes('amoxicillin'))).toBe(true)
		expect(allBlockedDrugs.some(d => d.toLowerCase().includes('aspirin'))).toBe(true)
	})
})

