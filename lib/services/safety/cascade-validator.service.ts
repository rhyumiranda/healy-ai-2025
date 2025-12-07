import { OpenFDAService, RxNormService } from '../medical-apis.service'
import { PubMedService } from '../pubmed.service'
import { VectorStoreService } from '../rag/vector-store.service'
import type {
	CascadeValidationResult,
	ValidationSource,
	ValidationSourceResult,
	SeverityAssessment,
} from './types'

interface MedicationRecommendation {
	name: string
	genericName?: string
	dosage: string
	frequency: string
	duration: string
	route: string
}

interface PatientContext {
	allergies?: string[]
	chronicConditions?: string[]
	currentMedications?: string[]
	chiefComplaint: string
}

interface AIResponse {
	medications: MedicationRecommendation[]
	riskLevel: string
	riskFactors: string[]
}

export class CascadeValidatorService {
	static async validate(
		aiResponse: AIResponse,
		patient: PatientContext,
		severity: SeverityAssessment
	): Promise<CascadeValidationResult> {
		const sources: ValidationSourceResult[] = []
		const warnings: string[] = []
		let isApproved = true
		let blockedBy: ValidationSource | undefined
		let blockReason: string | undefined
		let confidenceModifier = 0

		for (const medication of aiResponse.medications) {
			const fdaResult = await this.validateWithFDA(medication, patient)
			sources.push(fdaResult)

			if (!fdaResult.isApproved) {
				isApproved = false
				blockedBy = 'FDA'
				blockReason = fdaResult.reason
				break
			}

			if (fdaResult.confidence < 80) {
				confidenceModifier -= (80 - fdaResult.confidence) / 4
			}
		}

		if (isApproved && patient.currentMedications && patient.currentMedications.length > 0) {
			for (const medication of aiResponse.medications) {
				const interactionResult = await this.validateInteractions(
					medication,
					patient.currentMedications
				)
				sources.push(interactionResult)

				if (!interactionResult.isApproved) {
					isApproved = false
					blockedBy = 'INTERACTION'
					blockReason = interactionResult.reason
					break
				}

				if (interactionResult.reason) {
					warnings.push(interactionResult.reason)
				}
			}
		}

		if (isApproved && severity.requiredValidations.includes('GUIDELINE')) {
			const guidelineResult = await this.validateWithGuidelines(
				aiResponse.medications,
				patient.chiefComplaint
			)
			sources.push(guidelineResult)

			if (!guidelineResult.isApproved) {
				warnings.push(guidelineResult.reason || 'Guideline mismatch detected')
				confidenceModifier -= 15
			}
		}

		if (isApproved && severity.requiredValidations.includes('PUBMED')) {
			const pubmedResult = await this.validateWithPubMed(
				aiResponse.medications,
				patient.chiefComplaint
			)
			sources.push(pubmedResult)

			if (!pubmedResult.isApproved) {
				warnings.push('Limited evidence support in medical literature')
				confidenceModifier -= 10
			}
		}

		const requiresManualReview = severity.autoEscalate ||
			severity.severityLevel === 'CRITICAL' ||
			warnings.length >= 3 ||
			confidenceModifier <= -30

		return {
			isApproved,
			blockedBy,
			blockReason,
			warnings,
			confidenceModifier,
			sources,
			requiresManualReview,
		}
	}

	private static async validateWithFDA(
		medication: MedicationRecommendation,
		patient: PatientContext
	): Promise<ValidationSourceResult> {
		try {
			const drugLabel = await OpenFDAService.getDrugLabel(medication.name)

			if (!drugLabel) {
				const genericLabel = medication.genericName
					? await OpenFDAService.getDrugLabel(medication.genericName)
					: null

				if (!genericLabel) {
					return {
						source: 'FDA',
						isApproved: true,
						reason: `Drug ${medication.name} not found in FDA database`,
						confidence: 50,
					}
				}
			}

			const labelToCheck = drugLabel || (medication.genericName
				? await OpenFDAService.getDrugLabel(medication.genericName)
				: null)

			if (labelToCheck) {
				const hasBlackBoxWarning = labelToCheck.warnings.some((w) =>
					w.toLowerCase().includes('black box') ||
					w.toLowerCase().includes('boxed warning')
				)

				if (hasBlackBoxWarning) {
					const warningText = labelToCheck.warnings.find((w) =>
						w.toLowerCase().includes('black box') ||
						w.toLowerCase().includes('boxed warning')
					)
					return {
						source: 'FDA',
						isApproved: false,
						reason: `Black box warning: ${warningText?.slice(0, 200)}...`,
						confidence: 0,
						data: { hasBlackBoxWarning: true },
					}
				}

				for (const allergy of patient.allergies || []) {
					const allergyLower = allergy.toLowerCase()
					const contraindicationMatch = labelToCheck.contraindications.some((c) =>
						c.toLowerCase().includes(allergyLower)
					)
					const warningMatch = labelToCheck.warnings.some((w) =>
						w.toLowerCase().includes(allergyLower)
					)

					if (contraindicationMatch || warningMatch) {
						return {
							source: 'FDA',
							isApproved: false,
							reason: `Contraindicated due to patient allergy to ${allergy}`,
							confidence: 0,
							data: { allergyConflict: allergy },
						}
					}
				}

				for (const condition of patient.chronicConditions || []) {
					const conditionLower = condition.toLowerCase()
					const contraindicationMatch = labelToCheck.contraindications.some((c) =>
						c.toLowerCase().includes(conditionLower)
					)

					if (contraindicationMatch) {
						return {
							source: 'FDA',
							isApproved: false,
							reason: `Contraindicated due to patient condition: ${condition}`,
							confidence: 0,
							data: { conditionConflict: condition },
						}
					}
				}

				return {
					source: 'FDA',
					isApproved: true,
					confidence: 90,
					data: { labelFound: true, hasWarnings: labelToCheck.warnings.length > 0 },
				}
			}

			return {
				source: 'FDA',
				isApproved: true,
				confidence: 60,
			}
		} catch (error) {
			return {
				source: 'FDA',
				isApproved: true,
				reason: 'FDA validation unavailable',
				confidence: 40,
			}
		}
	}

	private static async validateInteractions(
		medication: MedicationRecommendation,
		currentMedications: string[]
	): Promise<ValidationSourceResult> {
		try {
			const rxcui = await RxNormService.getRxCUI(medication.name)

			if (!rxcui) {
				return {
					source: 'INTERACTION',
					isApproved: true,
					reason: `Unable to verify interactions for ${medication.name}`,
					confidence: 50,
				}
			}

			const currentRxcuis: string[] = []
			for (const med of currentMedications) {
				const medRxcui = await RxNormService.getRxCUI(med)
				if (medRxcui) {
					currentRxcuis.push(medRxcui)
				}
			}

			if (currentRxcuis.length === 0) {
				return {
					source: 'INTERACTION',
					isApproved: true,
					confidence: 70,
				}
			}

			const interactions = await RxNormService.checkMultiDrugInteractions([
				rxcui,
				...currentRxcuis,
			])

			const contraindicatedInteraction = interactions.find((i) =>
				i.severity === 'Contraindicated'
			)

			if (contraindicatedInteraction) {
				return {
					source: 'INTERACTION',
					isApproved: false,
					reason: `Contraindicated interaction between ${contraindicatedInteraction.drug1} and ${contraindicatedInteraction.drug2}: ${contraindicatedInteraction.description}`,
					confidence: 0,
					data: { interaction: contraindicatedInteraction },
				}
			}

			const majorInteraction = interactions.find((i) => i.severity === 'Major')

			if (majorInteraction) {
				return {
					source: 'INTERACTION',
					isApproved: true,
					reason: `Major interaction warning: ${majorInteraction.drug1} with ${majorInteraction.drug2}`,
					confidence: 60,
					data: { interaction: majorInteraction },
				}
			}

			return {
				source: 'INTERACTION',
				isApproved: true,
				confidence: 90,
				data: { interactionsChecked: interactions.length },
			}
		} catch (error) {
			return {
				source: 'INTERACTION',
				isApproved: true,
				reason: 'Interaction check unavailable',
				confidence: 40,
			}
		}
	}

	private static async validateWithGuidelines(
		medications: MedicationRecommendation[],
		chiefComplaint: string
	): Promise<ValidationSourceResult> {
		try {
			const medicationNames = medications.map((m) => m.genericName || m.name).join(' ')
			const query = `${chiefComplaint} treatment ${medicationNames}`

			const guidelineDocs = await VectorStoreService.searchSimilar(query, {
				matchThreshold: 0.5,
				matchCount: 5,
				filterSourceType: 'clinical_guideline',
			})

			if (guidelineDocs.length === 0) {
				return {
					source: 'GUIDELINE',
					isApproved: true,
					reason: 'No relevant clinical guidelines found in knowledge base',
					confidence: 50,
				}
			}

			const highRelevanceMatch = guidelineDocs.some((doc) => doc.similarity > 0.7)

			if (highRelevanceMatch) {
				return {
					source: 'GUIDELINE',
					isApproved: true,
					confidence: 85,
					data: { guidelinesFound: guidelineDocs.length },
				}
			}

			return {
				source: 'GUIDELINE',
				isApproved: true,
				reason: 'Limited guideline support found',
				confidence: 65,
				data: { guidelinesFound: guidelineDocs.length },
			}
		} catch (error) {
			return {
				source: 'GUIDELINE',
				isApproved: true,
				reason: 'Guideline validation unavailable',
				confidence: 40,
			}
		}
	}

	private static async validateWithPubMed(
		medications: MedicationRecommendation[],
		chiefComplaint: string
	): Promise<ValidationSourceResult> {
		try {
			const primaryMedication = medications[0]
			const medName = primaryMedication.genericName || primaryMedication.name

			const searchResult = await PubMedService.searchArticles(
				chiefComplaint,
				medName,
				{ maxResults: 5, articleTypes: ['Clinical Trial', 'Randomized Controlled Trial', 'Systematic Review'] }
			)

			if (searchResult.totalCount === 0) {
				return {
					source: 'PUBMED',
					isApproved: false,
					reason: `No clinical evidence found for ${medName} in treating ${chiefComplaint}`,
					confidence: 30,
				}
			}

			const hasHighQualityEvidence = searchResult.references.some((ref) => {
				const types = ref.publicationType.map((t) => t.toLowerCase())
				return types.some((t) =>
					t.includes('systematic review') ||
					t.includes('meta-analysis') ||
					t.includes('randomized controlled trial')
				)
			})

			if (hasHighQualityEvidence) {
				return {
					source: 'PUBMED',
					isApproved: true,
					confidence: 90,
					data: {
						evidenceCount: searchResult.totalCount,
						hasHighQualityEvidence: true,
					},
				}
			}

			return {
				source: 'PUBMED',
				isApproved: true,
				reason: 'Limited high-quality evidence available',
				confidence: 70,
				data: {
					evidenceCount: searchResult.totalCount,
					hasHighQualityEvidence: false,
				},
			}
		} catch (error) {
			return {
				source: 'PUBMED',
				isApproved: true,
				reason: 'PubMed validation unavailable',
				confidence: 40,
			}
		}
	}
}
