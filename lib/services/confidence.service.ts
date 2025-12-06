/**
 * Confidence Score Service
 * Multi-factor confidence scoring for AI-generated treatment recommendations
 */

import type { ClinicalReference } from './pubmed.service'

// ============================================
// Types
// ============================================

export interface ConfidenceFactors {
	// AI Model Confidence (0-100)
	aiModelConfidence: number

	// Drug Validation Factors
	fdaDrugValidated: boolean
	dosageWithinFDALimits: boolean
	routeMatchesFDALabel: boolean

	// Interaction Safety
	noContraindications: boolean
	noSevereInteractions: boolean
	allergyCheckPassed: boolean

	// Evidence Support
	hasSystematicReviews: boolean
	hasClinicalTrials: boolean
	hasGuidelines: boolean
	referenceCount: number
	averageEvidenceLevel: 'A' | 'B' | 'C' | 'D' | null

	// Patient-Specific Factors
	ageAppropriate: boolean
	renalFunctionConsidered: boolean
	hepaticFunctionConsidered: boolean
	pregnancyConsidered?: boolean
}

export interface ConfidenceResult {
	overallScore: number // 0-100
	grade: 'HIGH' | 'MODERATE' | 'LOW' | 'INSUFFICIENT'
	breakdown: {
		drugValidation: number
		safetyScore: number
		evidenceScore: number
		patientFactors: number
		aiBaseScore: number
	}
	warnings: string[]
	recommendations: string[]
}

export interface MedicationConfidenceInput {
	medicationName: string
	aiConfidence: number
	fdaValidated: boolean
	dosageInfo: {
		recommended: string
		fdaMaxDaily?: string
		withinLimits: boolean
	}
	route: string
	interactions: {
		severity: 'Minor' | 'Moderate' | 'Major' | 'Contraindicated'
		count: number
	}[]
	contraindications: string[]
	patientAllergies: string[]
	references: ClinicalReference[]
	patientAge?: number
	patientConditions?: string[]
}

// ============================================
// Confidence Service
// ============================================

export class ConfidenceService {
	// Weight factors for overall score
	private static readonly WEIGHTS = {
		drugValidation: 0.2,
		safety: 0.3,
		evidence: 0.25,
		patientFactors: 0.15,
		aiBase: 0.1,
	}

	// Thresholds
	private static readonly THRESHOLDS = {
		HIGH: 80,
		MODERATE: 60,
		LOW: 40,
	}

	/**
	 * Calculate comprehensive confidence score for a medication recommendation
	 */
	static calculateMedicationConfidence(
		input: MedicationConfidenceInput
	): ConfidenceResult {
		const warnings: string[] = []
		const recommendations: string[] = []

		// 1. Drug Validation Score (0-100)
		const drugValidationScore = this.calculateDrugValidationScore(input, warnings)

		// 2. Safety Score (0-100)
		const safetyScore = this.calculateSafetyScore(input, warnings, recommendations)

		// 3. Evidence Score (0-100)
		const evidenceScore = this.calculateEvidenceScore(input.references, recommendations)

		// 4. Patient Factors Score (0-100)
		const patientFactorsScore = this.calculatePatientFactorsScore(input, warnings)

		// 5. AI Base Score (normalized to 0-100)
		const aiBaseScore = Math.min(100, Math.max(0, input.aiConfidence))

		// Calculate weighted overall score
		const overallScore = Math.round(
			drugValidationScore * this.WEIGHTS.drugValidation +
			safetyScore * this.WEIGHTS.safety +
			evidenceScore * this.WEIGHTS.evidence +
			patientFactorsScore * this.WEIGHTS.patientFactors +
			aiBaseScore * this.WEIGHTS.aiBase
		)

		// Determine grade
		const grade = this.getGrade(overallScore, warnings)

		return {
			overallScore,
			grade,
			breakdown: {
				drugValidation: drugValidationScore,
				safetyScore,
				evidenceScore,
				patientFactors: patientFactorsScore,
				aiBaseScore,
			},
			warnings,
			recommendations,
		}
	}

	/**
	 * Calculate overall confidence for a treatment plan
	 */
	static calculatePlanConfidence(
		medicationConfidences: ConfidenceResult[]
	): ConfidenceResult {
		if (medicationConfidences.length === 0) {
			return {
				overallScore: 0,
				grade: 'INSUFFICIENT',
				breakdown: {
					drugValidation: 0,
					safetyScore: 0,
					evidenceScore: 0,
					patientFactors: 0,
					aiBaseScore: 0,
				},
				warnings: ['No medications to evaluate'],
				recommendations: [],
			}
		}

		// Average all scores
		const avgBreakdown = {
			drugValidation: 0,
			safetyScore: 0,
			evidenceScore: 0,
			patientFactors: 0,
			aiBaseScore: 0,
		}

		const allWarnings: string[] = []
		const allRecommendations: string[] = []

		for (const conf of medicationConfidences) {
			avgBreakdown.drugValidation += conf.breakdown.drugValidation
			avgBreakdown.safetyScore += conf.breakdown.safetyScore
			avgBreakdown.evidenceScore += conf.breakdown.evidenceScore
			avgBreakdown.patientFactors += conf.breakdown.patientFactors
			avgBreakdown.aiBaseScore += conf.breakdown.aiBaseScore
			allWarnings.push(...conf.warnings)
			allRecommendations.push(...conf.recommendations)
		}

		const count = medicationConfidences.length
		avgBreakdown.drugValidation = Math.round(avgBreakdown.drugValidation / count)
		avgBreakdown.safetyScore = Math.round(avgBreakdown.safetyScore / count)
		avgBreakdown.evidenceScore = Math.round(avgBreakdown.evidenceScore / count)
		avgBreakdown.patientFactors = Math.round(avgBreakdown.patientFactors / count)
		avgBreakdown.aiBaseScore = Math.round(avgBreakdown.aiBaseScore / count)

		// Use minimum safety score (most conservative approach)
		const minSafetyScore = Math.min(...medicationConfidences.map((c) => c.breakdown.safetyScore))

		// Overall is weighted average, but capped by minimum safety
		const avgOverall = Math.round(
			medicationConfidences.reduce((sum, c) => sum + c.overallScore, 0) / count
		)
		const overallScore = Math.min(avgOverall, minSafetyScore + 20)

		// Deduplicate warnings and recommendations
		const warnings = [...new Set(allWarnings)]
		const recommendations = [...new Set(allRecommendations)]

		return {
			overallScore,
			grade: this.getGrade(overallScore, warnings),
			breakdown: avgBreakdown,
			warnings,
			recommendations,
		}
	}

	// ============================================
	// Private Scoring Methods
	// ============================================

	private static calculateDrugValidationScore(
		input: MedicationConfidenceInput,
		warnings: string[]
	): number {
		let score = 0

		// FDA validated drug (+40 points)
		if (input.fdaValidated) {
			score += 40
		} else {
			warnings.push(`${input.medicationName}: Not found in FDA database`)
		}

		// Dosage within FDA limits (+30 points)
		if (input.dosageInfo.withinLimits) {
			score += 30
		} else {
			warnings.push(`${input.medicationName}: Dosage may exceed recommended limits`)
			score += 10 // Partial credit if specified
		}

		// Valid route (+30 points)
		if (input.route && input.route !== 'Unknown') {
			score += 30
		}

		return Math.min(100, score)
	}

	private static calculateSafetyScore(
		input: MedicationConfidenceInput,
		warnings: string[],
		recommendations: string[]
	): number {
		let score = 100

		// Check for contraindications (-40 each, min 0)
		if (input.contraindications.length > 0) {
			score -= input.contraindications.length * 40
			warnings.push(
				`${input.medicationName}: ${input.contraindications.length} contraindication(s) identified`
			)
		}

		// Check for interactions
		for (const interaction of input.interactions) {
			switch (interaction.severity) {
				case 'Contraindicated':
					score -= 50 * interaction.count
					warnings.push(`CRITICAL: Contraindicated drug interaction detected`)
					break
				case 'Major':
					score -= 30 * interaction.count
					warnings.push(`${input.medicationName}: Major drug interaction detected`)
					recommendations.push('Review interaction and consider alternative')
					break
				case 'Moderate':
					score -= 15 * interaction.count
					recommendations.push('Monitor for interaction effects')
					break
				case 'Minor':
					score -= 5 * interaction.count
					break
			}
		}

		// Check allergies
		const hasAllergyConflict = input.patientAllergies.some((allergy) =>
			input.medicationName.toLowerCase().includes(allergy.toLowerCase()) ||
			allergy.toLowerCase().includes(input.medicationName.toLowerCase())
		)

		if (hasAllergyConflict) {
			score -= 80
			warnings.push(`CRITICAL: ${input.medicationName} may conflict with patient allergy`)
		}

		return Math.max(0, score)
	}

	private static calculateEvidenceScore(
		references: ClinicalReference[],
		recommendations: string[]
	): number {
		if (references.length === 0) {
			recommendations.push('No clinical references found - consider additional literature review')
			return 30 // Base score for AI recommendation without explicit references
		}

		let score = 40 // Base score for having any references

		// Points for number of references (up to +20)
		score += Math.min(20, references.length * 5)

		// Points for evidence quality (up to +40)
		const evidenceLevels = references.map((r) => this.getEvidenceLevel(r.publicationType))

		if (evidenceLevels.includes('A')) {
			score += 40
		} else if (evidenceLevels.includes('B')) {
			score += 30
		} else if (evidenceLevels.includes('C')) {
			score += 20
		} else {
			score += 10
			recommendations.push('Consider seeking higher-level evidence (RCTs or systematic reviews)')
		}

		return Math.min(100, score)
	}

	private static calculatePatientFactorsScore(
		input: MedicationConfidenceInput,
		warnings: string[]
	): number {
		let score = 70 // Default score assuming factors considered

		// Age-specific considerations
		if (input.patientAge !== undefined) {
			if (input.patientAge < 18) {
				// Pediatric - needs special consideration
				score += 15
			} else if (input.patientAge >= 65) {
				// Geriatric - needs special consideration
				score += 15
			} else {
				score += 30
			}
		}

		// Chronic conditions consideration
		if (input.patientConditions && input.patientConditions.length > 0) {
			// Check for conditions that require dosage adjustments
			const renalConditions = input.patientConditions.some((c) =>
				c.toLowerCase().includes('kidney') ||
				c.toLowerCase().includes('renal') ||
				c.toLowerCase().includes('ckd')
			)

			const hepaticConditions = input.patientConditions.some((c) =>
				c.toLowerCase().includes('liver') ||
				c.toLowerCase().includes('hepatic') ||
				c.toLowerCase().includes('cirrhosis')
			)

			if (renalConditions) {
				warnings.push(`Consider renal dosage adjustment for ${input.medicationName}`)
			}

			if (hepaticConditions) {
				warnings.push(`Consider hepatic dosage adjustment for ${input.medicationName}`)
			}
		}

		return Math.min(100, score)
	}

	private static getGrade(
		score: number,
		warnings: string[]
	): ConfidenceResult['grade'] {
		// Critical warnings override score
		const hasCriticalWarning = warnings.some((w) => w.includes('CRITICAL'))
		if (hasCriticalWarning) {
			return 'LOW'
		}

		if (score >= this.THRESHOLDS.HIGH) return 'HIGH'
		if (score >= this.THRESHOLDS.MODERATE) return 'MODERATE'
		if (score >= this.THRESHOLDS.LOW) return 'LOW'
		return 'INSUFFICIENT'
	}

	private static getEvidenceLevel(
		publicationTypes: string[]
	): 'A' | 'B' | 'C' | 'D' {
		const types = publicationTypes.map((t) => t.toLowerCase())

		if (
			types.some((t) =>
				t.includes('systematic review') || t.includes('meta-analysis')
			)
		) {
			return 'A'
		}

		if (
			types.some((t) =>
				t.includes('randomized controlled trial') || t.includes('clinical trial')
			)
		) {
			return 'B'
		}

		if (
			types.some((t) =>
				t.includes('cohort') ||
				t.includes('case-control') ||
				t.includes('observational')
			)
		) {
			return 'C'
		}

		return 'D'
	}

	/**
	 * Get confidence grade color for UI
	 */
	static getGradeColor(grade: ConfidenceResult['grade']): string {
		switch (grade) {
			case 'HIGH':
				return 'green'
			case 'MODERATE':
				return 'yellow'
			case 'LOW':
				return 'orange'
			case 'INSUFFICIENT':
				return 'red'
		}
	}

	/**
	 * Get confidence grade description
	 */
	static getGradeDescription(grade: ConfidenceResult['grade']): string {
		switch (grade) {
			case 'HIGH':
				return 'Strong evidence support with validated safety profile'
			case 'MODERATE':
				return 'Reasonable evidence with some considerations'
			case 'LOW':
				return 'Limited evidence or safety concerns identified'
			case 'INSUFFICIENT':
				return 'Insufficient data for confident recommendation'
		}
	}
}
