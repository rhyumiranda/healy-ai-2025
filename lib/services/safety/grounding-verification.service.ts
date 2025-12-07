import type { RAGContext } from '../rag/types'
import type { GroundingVerificationResult, GroundingClaim } from './types'

interface MedicationRecommendation {
	name: string
	genericName?: string
	dosage: string
	frequency: string
	duration: string
	route: string
	instructions?: string
	rationale?: string
}

interface AIResponse {
	medications: MedicationRecommendation[]
	riskLevel: string
	riskFactors: string[]
	rationale?: string
}

const DOSAGE_PATTERNS = [
	/(\d+(?:\.\d+)?)\s*(mg|g|mcg|ml|mL|units?|IU)/gi,
	/(\d+)\s*-\s*(\d+)\s*(mg|g|mcg|ml|mL)/gi,
]

const FREQUENCY_PATTERNS = [
	/once daily/gi,
	/twice daily/gi,
	/three times daily/gi,
	/four times daily/gi,
	/every\s+(\d+)\s*hours?/gi,
	/q(\d+)h/gi,
	/bid/gi,
	/tid/gi,
	/qid/gi,
	/prn/gi,
	/as needed/gi,
]

export class GroundingVerificationService {
	private static readonly UNGROUNDED_PENALTY = -15
	private static readonly CONTRADICTION_PENALTY = -25
	private static readonly GROUNDING_THRESHOLD = 0.6

	static async verify(
		aiResponse: AIResponse,
		ragContext: RAGContext
	): Promise<GroundingVerificationResult> {
		const claims: GroundingClaim[] = []
		const warnings: string[] = []

		for (const medication of aiResponse.medications) {
			const medicationClaims = this.extractMedicationClaims(medication)

			for (const claim of medicationClaims) {
				const verificationResult = this.verifyClaim(claim, ragContext)
				claims.push(verificationResult)

				if (!verificationResult.isGrounded && verificationResult.contradictions.length === 0) {
					warnings.push(`Unverified claim: ${claim.claim?.slice(0, 100) ?? 'Unknown claim'}`)
				}

				if (verificationResult.contradictions.length > 0) {
					warnings.push(`Contradiction found for ${medication.name}: ${verificationResult.contradictions[0]}`)
				}
			}
		}

		if (aiResponse.rationale) {
			const rationaleClaims = this.extractRationaleClaims(aiResponse.rationale)
			for (const claim of rationaleClaims) {
				const verificationResult = this.verifyClaim(claim, ragContext)
				claims.push(verificationResult)
			}
		}

		const groundedClaimsCount = claims.filter((c) => c.isGrounded).length
		const ungroundedClaimsCount = claims.filter((c) => !c.isGrounded && c.contradictions.length === 0).length
		const contradictionsFound = claims.filter((c) => c.contradictions.length > 0).length

		const isFullyGrounded = claims.length > 0 &&
			groundedClaimsCount === claims.length &&
			contradictionsFound === 0

		const groundingRatio = claims.length > 0 ? groundedClaimsCount / claims.length : 1

		let overallConfidenceModifier = 0

		if (groundingRatio < this.GROUNDING_THRESHOLD) {
			overallConfidenceModifier += this.UNGROUNDED_PENALTY * (1 - groundingRatio)
		}

		overallConfidenceModifier += contradictionsFound * this.CONTRADICTION_PENALTY

		return {
			isFullyGrounded,
			groundedClaimsCount,
			ungroundedClaimsCount,
			contradictionsFound,
			claims,
			overallConfidenceModifier: Math.max(-50, Math.round(overallConfidenceModifier)),
			warnings,
		}
	}

	private static extractMedicationClaims(medication: MedicationRecommendation): Partial<GroundingClaim>[] {
		const claims: Partial<GroundingClaim>[] = []

		claims.push({
			claim: `${medication.name} is appropriate for this condition`,
			medicationName: medication.name,
		})

		if (medication.dosage) {
			claims.push({
				claim: `${medication.name} dosage of ${medication.dosage} is appropriate`,
				medicationName: medication.name,
				dosage: medication.dosage,
			})
		}

		if (medication.frequency) {
			claims.push({
				claim: `${medication.name} should be taken ${medication.frequency}`,
				medicationName: medication.name,
				frequency: medication.frequency,
			})
		}

		if (medication.rationale) {
			claims.push({
				claim: medication.rationale,
				medicationName: medication.name,
			})
		}

		return claims
	}

	private static extractRationaleClaims(rationale: string): Partial<GroundingClaim>[] {
		const claims: Partial<GroundingClaim>[] = []

		const sentences = rationale.split(/[.!?]+/).filter((s) => s.trim().length > 20)

		for (const sentence of sentences.slice(0, 5)) {
			const trimmed = sentence.trim()
			if (this.containsMedicalClaim(trimmed)) {
				claims.push({ claim: trimmed })
			}
		}

		return claims
	}

	private static containsMedicalClaim(text: string): boolean {
		const claimIndicators = [
			/is (effective|recommended|indicated|appropriate|used) for/i,
			/has been shown to/i,
			/studies (show|indicate|demonstrate)/i,
			/according to guidelines/i,
			/first-line (treatment|therapy)/i,
			/reduces? (risk|symptoms|inflammation)/i,
			/treats?|prevents?|manages?/i,
		]

		return claimIndicators.some((pattern) => pattern.test(text))
	}

	private static verifyClaim(
		claim: Partial<GroundingClaim>,
		ragContext: RAGContext
	): GroundingClaim {
		const groundingSources: string[] = []
		const contradictions: string[] = []

		const claimLower = claim.claim?.toLowerCase() || ''
		const medicationLower = claim.medicationName?.toLowerCase() || ''

		for (const doc of ragContext.documents) {
			const contentLower = doc.content.toLowerCase()

			if (claim.medicationName) {
				const medMatch = contentLower.includes(medicationLower) ||
					(claim.medicationName.length > 3 && contentLower.includes(medicationLower.slice(0, -1)))

				if (medMatch) {
					groundingSources.push(doc.sourceName)

					if (claim.dosage) {
						const dosageContraindicated = this.checkDosageContradiction(
							claim.dosage,
							doc.content
						)
						if (dosageContraindicated) {
							contradictions.push(`Dosage ${claim.dosage} may exceed recommended limits per ${doc.sourceName}`)
						}
					}
				}
			}

			const claimTerms = claimLower.split(/\s+/).filter((t) => t.length > 4)
			const matchingTerms = claimTerms.filter((term) => contentLower.includes(term))
			const matchRatio = matchingTerms.length / Math.max(1, claimTerms.length)

			if (matchRatio > 0.5) {
				if (!groundingSources.includes(doc.sourceName)) {
					groundingSources.push(doc.sourceName)
				}
			}

			const contradictionIndicators = [
				'contraindicated',
				'should not be used',
				'avoid',
				'do not use',
				'not recommended',
			]

			if (claim.medicationName && contentLower.includes(medicationLower)) {
				for (const indicator of contradictionIndicators) {
					if (contentLower.includes(indicator)) {
						const contextWindow = this.extractContextWindow(doc.content, indicator, 100)
						if (contextWindow.toLowerCase().includes(medicationLower)) {
							contradictions.push(`${doc.sourceName}: ${contextWindow}`)
						}
					}
				}
			}
		}

		const isGrounded = groundingSources.length > 0

		return {
			claim: claim.claim || '',
			medicationName: claim.medicationName,
			dosage: claim.dosage,
			frequency: claim.frequency,
			isGrounded,
			groundingSources: [...new Set(groundingSources)],
			contradictions: [...new Set(contradictions)],
		}
	}

	private static checkDosageContradiction(
		claimedDosage: string,
		documentContent: string
	): boolean {
		const claimedMatch = claimedDosage.match(/(\d+(?:\.\d+)?)\s*(mg|g|mcg)/i)
		if (!claimedMatch) return false

		const claimedValue = parseFloat(claimedMatch[1])
		const claimedUnit = claimedMatch[2].toLowerCase()

		const maxDosePatterns = [
			/maximum\s+(?:daily\s+)?dose[:\s]+(\d+(?:\.\d+)?)\s*(mg|g|mcg)/gi,
			/not\s+(?:to\s+)?exceed\s+(\d+(?:\.\d+)?)\s*(mg|g|mcg)/gi,
			/max(?:imum)?[:\s]+(\d+(?:\.\d+)?)\s*(mg|g|mcg)/gi,
		]

		for (const pattern of maxDosePatterns) {
			const matches = documentContent.matchAll(pattern)
			for (const match of matches) {
				const maxValue = parseFloat(match[1])
				const maxUnit = match[2].toLowerCase()

				if (maxUnit === claimedUnit && claimedValue > maxValue) {
					return true
				}
			}
		}

		return false
	}

	private static extractContextWindow(
		content: string,
		keyword: string,
		windowSize: number
	): string {
		const lowerContent = content.toLowerCase()
		const index = lowerContent.indexOf(keyword.toLowerCase())

		if (index === -1) return ''

		const start = Math.max(0, index - windowSize)
		const end = Math.min(content.length, index + keyword.length + windowSize)

		return content.slice(start, end).replace(/\s+/g, ' ').trim()
	}
}
