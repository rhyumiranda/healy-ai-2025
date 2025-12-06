import { VectorStoreService } from './vector-store.service'
import type {
	RAGContext,
	RetrievedDocument,
	Citation,
	SourceType,
} from './types'
import type { SeverityAssessment } from '../safety/types'

interface RetrievalOptions {
	maxDocuments?: number
	minSimilarity?: number
	sourceTypes?: SourceType[]
	severity?: SeverityAssessment | null
	useHybridSearch?: boolean
	ensureDiversity?: boolean
}

interface PatientContext {
	chiefComplaint: string
	currentSymptoms: string[]
	currentMedications?: string[]
	chronicConditions?: string[]
	allergies?: string[]
}

export class RetrievalService {
	private static readonly DEFAULT_MAX_DOCUMENTS = 10
	private static readonly DEFAULT_MIN_SIMILARITY = 0.5
	private static readonly SEVERE_CASE_MIN_SIMILARITY = 0.4
	private static readonly SEVERE_CASE_MAX_DOCUMENTS = 15

	static async getContext(
		patient: PatientContext,
		options: RetrievalOptions = {}
	): Promise<RAGContext> {
		const {
			maxDocuments = this.DEFAULT_MAX_DOCUMENTS,
			minSimilarity = this.DEFAULT_MIN_SIMILARITY,
			sourceTypes,
			severity,
			useHybridSearch = true,
			ensureDiversity = true,
		} = options

		const query = this.buildSearchQuery(patient)
		const severityTags = severity ? this.getSeverityTags(severity) : []

		const adjustedMaxDocs = severity?.isSevere
			? Math.max(maxDocuments, this.SEVERE_CASE_MAX_DOCUMENTS)
			: maxDocuments

		const adjustedMinSimilarity = severity?.isSevere
			? Math.min(minSimilarity, this.SEVERE_CASE_MIN_SIMILARITY)
			: minSimilarity

		let allDocuments: RetrievedDocument[] = []

		const keywords = this.extractMedicalKeywords(patient)

		if (useHybridSearch && ensureDiversity) {
			allDocuments = await VectorStoreService.searchWithDiversity(query, {
				matchThreshold: adjustedMinSimilarity,
				matchCount: adjustedMaxDocs * 2,
				severityRelevance: severityTags,
				keywords,
				semanticWeight: severity?.isSevere ? 0.6 : 0.7,
				keywordWeight: severity?.isSevere ? 0.4 : 0.3,
				minPerSourceType: severity?.isSevere ? 3 : 2,
			})
		} else if (useHybridSearch) {
			if (sourceTypes && sourceTypes.length > 0) {
				const documentPromises = sourceTypes.map((sourceType) =>
					VectorStoreService.hybridSearch(query, {
						matchThreshold: adjustedMinSimilarity,
						matchCount: Math.ceil(adjustedMaxDocs / sourceTypes.length) + 2,
						filterSourceType: sourceType,
						severityRelevance: severityTags,
						keywords,
					})
				)

				const results = await Promise.all(documentPromises)
				allDocuments = results.flat()
			} else {
				allDocuments = await VectorStoreService.hybridSearch(query, {
					matchThreshold: adjustedMinSimilarity,
					matchCount: adjustedMaxDocs * 2,
					severityRelevance: severityTags,
					keywords,
				})
			}
		} else {
			if (sourceTypes && sourceTypes.length > 0) {
				const documentPromises = sourceTypes.map((sourceType) =>
					VectorStoreService.searchSimilar(query, {
						matchThreshold: adjustedMinSimilarity,
						matchCount: Math.ceil(adjustedMaxDocs / sourceTypes.length) + 2,
						filterSourceType: sourceType,
						severityRelevance: severityTags,
					})
				)

				const results = await Promise.all(documentPromises)
				allDocuments = results.flat()
			} else {
				allDocuments = await VectorStoreService.searchSimilar(query, {
					matchThreshold: adjustedMinSimilarity,
					matchCount: adjustedMaxDocs * 2,
					severityRelevance: severityTags,
				})
			}
		}

		if (patient.currentMedications && patient.currentMedications.length > 0) {
			const medicationQuery = patient.currentMedications.slice(0, 3).join(' ')
			const interactionDocs = await VectorStoreService.hybridSearch(medicationQuery, {
				matchThreshold: adjustedMinSimilarity,
				matchCount: 5,
				filterSourceType: 'interaction',
				keywords: patient.currentMedications.slice(0, 3),
			})
			allDocuments.push(...interactionDocs)
		}

		const uniqueDocuments = this.deduplicateDocuments(allDocuments)
		const rankedDocuments = this.rankDocuments(uniqueDocuments, patient, severity)
		const topDocuments = rankedDocuments.slice(0, adjustedMaxDocs)

		const citations = this.buildCitations(topDocuments)
		const relevanceScore = this.calculateRelevanceScore(topDocuments)
		const sourceBreakdown = this.calculateSourceBreakdown(topDocuments)

		return {
			documents: topDocuments,
			citations,
			relevanceScore,
			sourceBreakdown,
		}
	}

	private static extractMedicalKeywords(patient: PatientContext): string[] {
		const keywords: string[] = []

		const complaintWords = patient.chiefComplaint.toLowerCase().split(/\s+/)
		keywords.push(...complaintWords.filter(w => w.length > 3))

		if (patient.currentSymptoms.length > 0) {
			keywords.push(...patient.currentSymptoms.slice(0, 3).map(s => s.toLowerCase()))
		}

		if (patient.chronicConditions && patient.chronicConditions.length > 0) {
			keywords.push(...patient.chronicConditions.slice(0, 2).map(c => c.toLowerCase()))
		}

		if (patient.currentMedications && patient.currentMedications.length > 0) {
			keywords.push(...patient.currentMedications.slice(0, 2).map(m => m.toLowerCase()))
		}

		return [...new Set(keywords)].slice(0, 10)
	}

	private static buildSearchQuery(patient: PatientContext): string {
		const parts: string[] = []

		parts.push(patient.chiefComplaint)

		if (patient.currentSymptoms.length > 0) {
			parts.push(patient.currentSymptoms.slice(0, 5).join(', '))
		}

		if (patient.chronicConditions && patient.chronicConditions.length > 0) {
			parts.push(`chronic conditions: ${patient.chronicConditions.slice(0, 3).join(', ')}`)
		}

		return parts.join('. ')
	}

	private static getSeverityTags(severity: SeverityAssessment): string[] {
		const tags: string[] = []

		for (const trigger of severity.triggers) {
			if (trigger.value.toLowerCase().includes('chest') ||
				trigger.value.toLowerCase().includes('heart') ||
				trigger.value.toLowerCase().includes('cardiac')) {
				tags.push('cardiac')
			}
			if (trigger.value.toLowerCase().includes('breath') ||
				trigger.value.toLowerCase().includes('respiratory') ||
				trigger.value.toLowerCase().includes('oxygen')) {
				tags.push('respiratory')
			}
			if (trigger.value.toLowerCase().includes('stroke') ||
				trigger.value.toLowerCase().includes('neuro') ||
				trigger.value.toLowerCase().includes('seizure')) {
				tags.push('neurological')
			}
			if (trigger.value.toLowerCase().includes('anaphylaxis') ||
				trigger.value.toLowerCase().includes('allergy')) {
				tags.push('allergic')
			}
		}

		return [...new Set(tags)]
	}

	private static deduplicateDocuments(documents: RetrievedDocument[]): RetrievedDocument[] {
		const seen = new Map<string, RetrievedDocument>()

		for (const doc of documents) {
			const key = doc.sourceId || doc.id
			if (!seen.has(key) || seen.get(key)!.similarity < doc.similarity) {
				seen.set(key, doc)
			}
		}

		return Array.from(seen.values())
	}

	private static rankDocuments(
		documents: RetrievedDocument[],
		patient: PatientContext,
		severity: SeverityAssessment | null | undefined
	): RetrievedDocument[] {
		return documents
			.map((doc) => {
				let boostScore = 0

				if (severity?.isSevere) {
					if (doc.sourceType === 'drug_label') boostScore += 0.1
					if (doc.sourceType === 'clinical_guideline') boostScore += 0.08
					if (doc.sourceType === 'interaction') boostScore += 0.15
				}

				if (patient.currentMedications && patient.currentMedications.length > 0) {
					const contentLower = doc.content.toLowerCase()
					for (const med of patient.currentMedications) {
						if (contentLower.includes(med.toLowerCase())) {
							boostScore += 0.05
						}
					}
				}

				if (patient.allergies && patient.allergies.length > 0) {
					const contentLower = doc.content.toLowerCase()
					for (const allergy of patient.allergies) {
						if (contentLower.includes(allergy.toLowerCase())) {
							boostScore += 0.1
						}
					}
				}

				return {
					...doc,
					similarity: Math.min(1, doc.similarity + boostScore),
				}
			})
			.sort((a, b) => b.similarity - a.similarity)
	}

	private static buildCitations(documents: RetrievedDocument[]): Citation[] {
		return documents.map((doc) => ({
			sourceType: doc.sourceType,
			sourceName: doc.sourceName,
			sourceId: doc.sourceId,
			content: doc.content.slice(0, 500),
			relevance: doc.similarity,
		}))
	}

	private static calculateRelevanceScore(documents: RetrievedDocument[]): number {
		if (documents.length === 0) return 0

		const avgSimilarity = documents.reduce((sum, doc) => sum + doc.similarity, 0) / documents.length
		const hasGuidelines = documents.some((doc) => doc.sourceType === 'clinical_guideline')
		const hasDrugLabels = documents.some((doc) => doc.sourceType === 'drug_label')
		const sourceBonus = (hasGuidelines ? 0.05 : 0) + (hasDrugLabels ? 0.05 : 0)

		return Math.min(1, avgSimilarity + sourceBonus)
	}

	private static calculateSourceBreakdown(documents: RetrievedDocument[]): RAGContext['sourceBreakdown'] {
		const breakdown = {
			guidelines: 0,
			drugLabels: 0,
			pubmed: 0,
			interactions: 0,
		}

		for (const doc of documents) {
			switch (doc.sourceType) {
				case 'clinical_guideline':
					breakdown.guidelines++
					break
				case 'drug_label':
					breakdown.drugLabels++
					break
				case 'pubmed':
					breakdown.pubmed++
					break
				case 'interaction':
					breakdown.interactions++
					break
			}
		}

		return breakdown
	}

	static buildContextPrompt(context: RAGContext): string {
		if (context.documents.length === 0) {
			return ''
		}

		const sections: string[] = ['RELEVANT MEDICAL KNOWLEDGE:']

		const guidelines = context.documents.filter((d) => d.sourceType === 'clinical_guideline')
		if (guidelines.length > 0) {
			sections.push('\n## Clinical Guidelines:')
			guidelines.forEach((doc, i) => {
				sections.push(`[${i + 1}] ${doc.sourceName}: ${doc.content.slice(0, 800)}`)
			})
		}

		const drugLabels = context.documents.filter((d) => d.sourceType === 'drug_label')
		if (drugLabels.length > 0) {
			sections.push('\n## Drug Information:')
			drugLabels.forEach((doc, i) => {
				sections.push(`[${guidelines.length + i + 1}] ${doc.sourceName}: ${doc.content.slice(0, 600)}`)
			})
		}

		const interactions = context.documents.filter((d) => d.sourceType === 'interaction')
		if (interactions.length > 0) {
			sections.push('\n## Drug Interactions:')
			interactions.forEach((doc, i) => {
				sections.push(`[${guidelines.length + drugLabels.length + i + 1}] ${doc.content.slice(0, 400)}`)
			})
		}

		const pubmed = context.documents.filter((d) => d.sourceType === 'pubmed')
		if (pubmed.length > 0) {
			sections.push('\n## Research Evidence:')
			pubmed.forEach((doc, i) => {
				sections.push(`[${guidelines.length + drugLabels.length + interactions.length + i + 1}] ${doc.sourceName}: ${doc.content.slice(0, 500)}`)
			})
		}

		sections.push('\nIMPORTANT: Base your recommendations on the above medical knowledge. Cite relevant sources using [number] format.')

		return sections.join('\n')
	}
}
