/**
 * Medical APIs Service
 * Integrates with OpenFDA, RxNorm, and DailyMed for drug validation and information
 */

// ============================================
// Types
// ============================================

export interface DrugInfo {
	brandName: string
	genericName: string
	rxcui?: string
	ndcCodes: string[]
	activeIngredients: string[]
	dosageForm: string
	route: string
	strength: string
	manufacturer?: string
}

export interface DrugInteractionResult {
	drug1: string
	drug2: string
	severity: 'Minor' | 'Moderate' | 'Major' | 'Contraindicated'
	description: string
	clinicalEffects: string
	recommendation: string
	source: 'OpenFDA' | 'RxNorm' | 'DailyMed'
}

export interface DrugLabelInfo {
	brandName: string
	genericName: string
	indications: string[]
	dosageAndAdministration: string
	contraindications: string[]
	warnings: string[]
	adverseReactions: string[]
	drugInteractions: string[]
	useInSpecificPopulations: {
		pregnancy?: string
		nursing?: string
		pediatric?: string
		geriatric?: string
		renalImpairment?: string
		hepaticImpairment?: string
	}
	overdosage?: string
}

export interface DosageRecommendation {
	indication: string
	adultDose: string
	pediatricDose?: string
	geriatricDose?: string
	maxDailyDose?: string
	renalAdjustment?: string
	hepaticAdjustment?: string
	frequency: string
	duration?: string
	route: string
	specialInstructions?: string
}

export interface DrugValidationResult {
	isValid: boolean
	drugInfo?: DrugInfo
	labelInfo?: DrugLabelInfo
	dosageRecommendations: DosageRecommendation[]
	interactions: DrugInteractionResult[]
	warnings: string[]
}

// ============================================
// OpenFDA Service
// ============================================

const OPENFDA_BASE_URL = 'https://api.fda.gov/drug'

export class OpenFDAService {
	/**
	 * Search for drug information by name
	 */
	static async searchDrug(drugName: string): Promise<DrugInfo | null> {
		try {
			const encodedName = encodeURIComponent(drugName)
			const response = await fetch(
				`${OPENFDA_BASE_URL}/ndc.json?search=brand_name:"${encodedName}"+generic_name:"${encodedName}"&limit=1`
			)

			if (!response.ok) {
				if (response.status === 404) return null
				throw new Error(`OpenFDA API error: ${response.status}`)
			}

			const data = await response.json()
			if (!data.results || data.results.length === 0) return null

			const result = data.results[0]
			return {
				brandName: result.brand_name || drugName,
				genericName: result.generic_name || drugName,
				rxcui: result.openfda?.rxcui?.[0],
				ndcCodes: result.product_ndc ? [result.product_ndc] : [],
				activeIngredients: result.active_ingredients?.map((i: { name: string }) => i.name) || [],
				dosageForm: result.dosage_form || 'Unknown',
				route: result.route?.[0] || 'Unknown',
				strength: result.active_ingredients?.[0]?.strength || 'Unknown',
				manufacturer: result.labeler_name,
			}
		} catch (error) {
			console.error('OpenFDA search error:', error)
			return null
		}
	}

	/**
	 * Get drug label information
	 */
	static async getDrugLabel(drugName: string): Promise<DrugLabelInfo | null> {
		try {
			const encodedName = encodeURIComponent(drugName)
			const response = await fetch(
				`${OPENFDA_BASE_URL}/label.json?search=openfda.brand_name:"${encodedName}"+openfda.generic_name:"${encodedName}"&limit=1`
			)

			if (!response.ok) {
				if (response.status === 404) return null
				throw new Error(`OpenFDA Label API error: ${response.status}`)
			}

			const data = await response.json()
			if (!data.results || data.results.length === 0) return null

			const label = data.results[0]
			return {
				brandName: label.openfda?.brand_name?.[0] || drugName,
				genericName: label.openfda?.generic_name?.[0] || drugName,
				indications: label.indications_and_usage || [],
				dosageAndAdministration: label.dosage_and_administration?.[0] || '',
				contraindications: label.contraindications || [],
				warnings: [...(label.warnings || []), ...(label.boxed_warning || [])],
				adverseReactions: label.adverse_reactions || [],
				drugInteractions: label.drug_interactions || [],
				useInSpecificPopulations: {
					pregnancy: label.pregnancy?.[0],
					nursing: label.nursing_mothers?.[0],
					pediatric: label.pediatric_use?.[0],
					geriatric: label.geriatric_use?.[0],
				},
				overdosage: label.overdosage?.[0],
			}
		} catch (error) {
			console.error('OpenFDA label error:', error)
			return null
		}
	}

	/**
	 * Check for adverse events associated with a drug
	 */
	static async getAdverseEvents(drugName: string, limit: number = 10): Promise<string[]> {
		try {
			const encodedName = encodeURIComponent(drugName)
			const response = await fetch(
				`${OPENFDA_BASE_URL}/event.json?search=patient.drug.medicinalproduct:"${encodedName}"&count=patient.reaction.reactionmeddrapt.exact&limit=${limit}`
			)

			if (!response.ok) return []

			const data = await response.json()
			return data.results?.map((r: { term: string }) => r.term) || []
		} catch (error) {
			console.error('OpenFDA adverse events error:', error)
			return []
		}
	}
}

// ============================================
// RxNorm Service (NIH)
// ============================================

const RXNORM_BASE_URL = 'https://rxnav.nlm.nih.gov/REST'

export class RxNormService {
	/**
	 * Get RxCUI (RxNorm Concept Unique Identifier) for a drug
	 */
	static async getRxCUI(drugName: string): Promise<string | null> {
		try {
			const encodedName = encodeURIComponent(drugName)
			const response = await fetch(
				`${RXNORM_BASE_URL}/rxcui.json?name=${encodedName}`
			)

			if (!response.ok) return null

			const data = await response.json()
			return data.idGroup?.rxnormId?.[0] || null
		} catch (error) {
			console.error('RxNorm RXCUI error:', error)
			return null
		}
	}

	/**
	 * Get drug interactions from RxNorm
	 */
	static async getDrugInteractions(rxcui: string): Promise<DrugInteractionResult[]> {
		try {
			const response = await fetch(
				`${RXNORM_BASE_URL}/interaction/interaction.json?rxcui=${rxcui}`
			)

			if (!response.ok) return []

			const data = await response.json()
			const interactions: DrugInteractionResult[] = []

			const interactionGroups = data.interactionTypeGroup || []
			for (const group of interactionGroups) {
				for (const type of group.interactionType || []) {
					for (const pair of type.interactionPair || []) {
						interactions.push({
							drug1: pair.interactionConcept?.[0]?.minConceptItem?.name || 'Unknown',
							drug2: pair.interactionConcept?.[1]?.minConceptItem?.name || 'Unknown',
							severity: this.mapSeverity(pair.severity),
							description: pair.description || '',
							clinicalEffects: type.comment || '',
							recommendation: pair.description || 'Consult healthcare provider',
							source: 'RxNorm',
						})
					}
				}
			}

			return interactions
		} catch (error) {
			console.error('RxNorm interactions error:', error)
			return []
		}
	}

	/**
	 * Check interactions between multiple drugs
	 */
	static async checkMultiDrugInteractions(
		rxcuis: string[]
	): Promise<DrugInteractionResult[]> {
		try {
			if (rxcuis.length < 2) return []

			const rxcuiList = rxcuis.join('+')
			const response = await fetch(
				`${RXNORM_BASE_URL}/interaction/list.json?rxcuis=${rxcuiList}`
			)

			if (!response.ok) return []

			const data = await response.json()
			const interactions: DrugInteractionResult[] = []

			const fullInteractions = data.fullInteractionTypeGroup || []
			for (const group of fullInteractions) {
				for (const type of group.fullInteractionType || []) {
					for (const pair of type.interactionPair || []) {
						interactions.push({
							drug1: pair.interactionConcept?.[0]?.minConceptItem?.name || 'Unknown',
							drug2: pair.interactionConcept?.[1]?.minConceptItem?.name || 'Unknown',
							severity: this.mapSeverity(pair.severity),
							description: pair.description || '',
							clinicalEffects: type.comment || '',
							recommendation: 'Review and adjust as needed',
							source: 'RxNorm',
						})
					}
				}
			}

			return interactions
		} catch (error) {
			console.error('RxNorm multi-drug interactions error:', error)
			return []
		}
	}

	/**
	 * Get related drugs (alternatives)
	 */
	static async getRelatedDrugs(rxcui: string): Promise<string[]> {
		try {
			const response = await fetch(
				`${RXNORM_BASE_URL}/rxcui/${rxcui}/related.json?tty=SBD+SCD`
			)

			if (!response.ok) return []

			const data = await response.json()
			const drugs: string[] = []

			for (const group of data.relatedGroup?.conceptGroup || []) {
				for (const concept of group.conceptProperties || []) {
					drugs.push(concept.name)
				}
			}

			return drugs.slice(0, 5)
		} catch (error) {
			console.error('RxNorm related drugs error:', error)
			return []
		}
	}

	private static mapSeverity(severity?: string): DrugInteractionResult['severity'] {
		if (!severity) return 'Moderate'
		const lower = severity.toLowerCase()
		if (lower.includes('contraindicated')) return 'Contraindicated'
		if (lower.includes('major') || lower.includes('severe') || lower.includes('high')) return 'Major'
		if (lower.includes('minor') || lower.includes('low')) return 'Minor'
		return 'Moderate'
	}
}

// ============================================
// DailyMed Service (NIH)
// ============================================

const DAILYMED_BASE_URL = 'https://dailymed.nlm.nih.gov/dailymed/services/v2'

export class DailyMedService {
	/**
	 * Search for drug SPL (Structured Product Labeling)
	 */
	static async searchDrugSPL(drugName: string): Promise<string | null> {
		try {
			const encodedName = encodeURIComponent(drugName)
			const response = await fetch(
				`${DAILYMED_BASE_URL}/spls.json?drug_name=${encodedName}&pagesize=1`
			)

			if (!response.ok) return null

			const data = await response.json()
			return data.data?.[0]?.setid || null
		} catch (error) {
			console.error('DailyMed SPL search error:', error)
			return null
		}
	}

	/**
	 * Get dosage forms available for a drug
	 */
	static async getDosageForms(drugName: string): Promise<string[]> {
		try {
			const encodedName = encodeURIComponent(drugName)
			const response = await fetch(
				`${DAILYMED_BASE_URL}/spls.json?drug_name=${encodedName}&pagesize=10`
			)

			if (!response.ok) return []

			const data = await response.json()
			const forms = new Set<string>()

			for (const spl of data.data || []) {
				if (spl.dosage_form) {
					forms.add(spl.dosage_form)
				}
			}

			return Array.from(forms)
		} catch (error) {
			console.error('DailyMed dosage forms error:', error)
			return []
		}
	}
}

// ============================================
// Unified Medical API Service
// ============================================

export class MedicalApisService {
	/**
	 * Validate a drug and get comprehensive information
	 */
	static async validateDrug(
		drugName: string,
		currentMedications: string[] = []
	): Promise<DrugValidationResult> {
		const result: DrugValidationResult = {
			isValid: false,
			dosageRecommendations: [],
			interactions: [],
			warnings: [],
		}

		try {
			// Step 1: Search for drug in OpenFDA
			const drugInfo = await OpenFDAService.searchDrug(drugName)
			if (drugInfo) {
				result.isValid = true
				result.drugInfo = drugInfo
			}

			// Step 2: Get drug label information
			const labelInfo = await OpenFDAService.getDrugLabel(drugName)
			if (labelInfo) {
				result.isValid = true
				result.labelInfo = labelInfo

				// Extract warnings
				result.warnings = [
					...labelInfo.warnings.slice(0, 3),
					...labelInfo.contraindications.slice(0, 2),
				]

				// Create dosage recommendation from label
				if (labelInfo.dosageAndAdministration) {
					result.dosageRecommendations.push({
						indication: labelInfo.indications[0] || 'General use',
						adultDose: this.extractDosageFromText(labelInfo.dosageAndAdministration),
						frequency: this.extractFrequencyFromText(labelInfo.dosageAndAdministration),
						route: drugInfo?.route || 'Oral',
						specialInstructions: labelInfo.dosageAndAdministration.slice(0, 200),
						geriatricDose: labelInfo.useInSpecificPopulations.geriatric,
						pediatricDose: labelInfo.useInSpecificPopulations.pediatric,
						renalAdjustment: labelInfo.useInSpecificPopulations.renalImpairment,
						hepaticAdjustment: labelInfo.useInSpecificPopulations.hepaticImpairment,
					})
				}
			}

			// Step 3: Get RxCUI and check interactions
			const rxcui = await RxNormService.getRxCUI(drugName)
			if (rxcui) {
				if (result.drugInfo) {
					result.drugInfo.rxcui = rxcui
				}

				// Get interactions for this drug
				const interactions = await RxNormService.getDrugInteractions(rxcui)
				result.interactions.push(...interactions)

				// Check interactions with current medications
				if (currentMedications.length > 0) {
					const currentRxcuis: string[] = []
					for (const med of currentMedications) {
						const medRxcui = await RxNormService.getRxCUI(med)
						if (medRxcui) currentRxcuis.push(medRxcui)
					}

					if (currentRxcuis.length > 0) {
						const multiInteractions = await RxNormService.checkMultiDrugInteractions([
							rxcui,
							...currentRxcuis,
						])
						result.interactions.push(...multiInteractions)
					}
				}
			}

			// Step 4: Get adverse events
			const adverseEvents = await OpenFDAService.getAdverseEvents(drugName, 5)
			if (adverseEvents.length > 0) {
				result.warnings.push(`Common adverse reactions: ${adverseEvents.join(', ')}`)
			}

			// If we found any info, mark as valid
			if (!result.isValid && (result.drugInfo || result.labelInfo)) {
				result.isValid = true
			}

			return result
		} catch (error) {
			console.error('Drug validation error:', error)
			return result
		}
	}

	/**
	 * Check interactions between a list of medications
	 */
	static async checkDrugInteractions(
		medications: string[]
	): Promise<DrugInteractionResult[]> {
		const rxcuis: string[] = []

		for (const med of medications) {
			const rxcui = await RxNormService.getRxCUI(med)
			if (rxcui) rxcuis.push(rxcui)
		}

		if (rxcuis.length < 2) return []

		return RxNormService.checkMultiDrugInteractions(rxcuis)
	}

	/**
	 * Get alternative medications
	 */
	static async getAlternatives(drugName: string): Promise<string[]> {
		const rxcui = await RxNormService.getRxCUI(drugName)
		if (!rxcui) return []

		return RxNormService.getRelatedDrugs(rxcui)
	}

	// Helper methods
	private static extractDosageFromText(text: string): string {
		const dosageMatch = text.match(/(\d+(?:\.\d+)?)\s*(mg|g|mcg|ml|mL)/i)
		return dosageMatch ? dosageMatch[0] : 'See prescribing information'
	}

	private static extractFrequencyFromText(text: string): string {
		const frequencyPatterns = [
			/once daily/i,
			/twice daily/i,
			/three times daily/i,
			/four times daily/i,
			/every \d+ hours/i,
			/every \d+-\d+ hours/i,
			/once a day/i,
			/twice a day/i,
			/q\d+h/i,
			/bid/i,
			/tid/i,
			/qid/i,
		]

		for (const pattern of frequencyPatterns) {
			const match = text.match(pattern)
			if (match) return match[0]
		}

		return 'As directed'
	}
}
