import { VectorStoreService } from './vector-store.service'
import { OpenFDAService } from '../medical-apis.service'
import { PubMedService } from '../pubmed.service'
import type {
	EmbeddingDocument,
	SourceType,
	ContentChunk,
	ChunkingOptions,
	IngestionResult,
} from './types'

const DEFAULT_CHUNKING_OPTIONS: ChunkingOptions = {
	maxChunkSize: 500,
	overlapSize: 50,
	preserveContext: true,
}

interface FDADrugIngestion {
	drugName: string
	sections?: ('contraindications' | 'warnings' | 'dosage' | 'interactions' | 'indications')[]
}

interface PubMedIngestion {
	condition: string
	medication?: string
	maxArticles?: number
	articleTypes?: string[]
}

interface GuidelineIngestion {
	title: string
	content: string
	source: string
	category?: string
	severityRelevance?: string[]
}

export class KnowledgeIngestionService {
	static async ingestFDADrugLabels(
		drugs: FDADrugIngestion[],
		options: ChunkingOptions = DEFAULT_CHUNKING_OPTIONS
	): Promise<IngestionResult> {
		const result: IngestionResult = {
			documentsIngested: 0,
			chunksCreated: 0,
			errors: [],
			sourceType: 'drug_label',
		}

		for (const drug of drugs) {
			try {
				const label = await OpenFDAService.getDrugLabel(drug.drugName)

				if (!label) {
					result.errors.push(`Drug not found: ${drug.drugName}`)
					continue
				}

				const sections = drug.sections || ['contraindications', 'warnings', 'dosage', 'interactions', 'indications']

				for (const section of sections) {
					let content: string[] = []

					switch (section) {
						case 'contraindications':
							content = label.contraindications
							break
						case 'warnings':
							content = label.warnings
							break
						case 'dosage':
							content = [label.dosageAndAdministration].filter(Boolean)
							break
						case 'interactions':
							content = label.drugInteractions
							break
						case 'indications':
							content = label.indications
							break
					}

					if (content.length === 0) continue

					const fullContent = content.join('\n\n')
					const chunks = this.chunkContent(fullContent, options)

					for (const chunk of chunks) {
						const document: EmbeddingDocument = {
							content: chunk.content,
							sourceType: 'drug_label',
							sourceId: `fda-${drug.drugName}-${section}-${chunk.metadata.chunkIndex}`,
							sourceName: `${label.brandName} (${label.genericName}) - ${section}`,
							metadata: {
								drugName: drug.drugName,
								brandName: label.brandName,
								genericName: label.genericName,
								section,
								...chunk.metadata,
							},
							severityRelevance: this.getSeverityRelevance(section, fullContent),
						}

						await VectorStoreService.upsertDocument(document)
						result.chunksCreated++
					}

					result.documentsIngested++
				}
			} catch (error) {
				result.errors.push(`Error processing ${drug.drugName}: ${String(error)}`)
			}
		}

		return result
	}

	static async ingestPubMedArticles(
		queries: PubMedIngestion[],
		options: ChunkingOptions = DEFAULT_CHUNKING_OPTIONS
	): Promise<IngestionResult> {
		const result: IngestionResult = {
			documentsIngested: 0,
			chunksCreated: 0,
			errors: [],
			sourceType: 'pubmed',
		}

		for (const query of queries) {
			try {
				const searchResult = await PubMedService.searchArticles(
					query.condition,
					query.medication,
					{
						maxResults: query.maxArticles || 10,
						articleTypes: query.articleTypes,
					}
				)

				for (const article of searchResult.references) {
					let abstract: string | undefined = article.abstract

					if (!abstract) {
						abstract = (await PubMedService.fetchAbstract(article.pmid)) || undefined
					}

					if (!abstract) {
						continue
					}

					const chunks = this.chunkContent(abstract, options)

					for (const chunk of chunks) {
						const document: EmbeddingDocument = {
							content: chunk.content,
							sourceType: 'pubmed',
							sourceId: `pubmed-${article.pmid}-${chunk.metadata.chunkIndex}`,
							sourceName: `${article.title} (${article.journal}, ${article.year})`,
							metadata: {
								pmid: article.pmid,
								title: article.title,
								authors: article.authors.slice(0, 5),
								journal: article.journal,
								year: article.year,
								publicationType: article.publicationType,
								doi: article.doi,
								url: article.url,
								...chunk.metadata,
							},
							severityRelevance: this.getSeverityRelevanceFromCondition(query.condition),
						}

						await VectorStoreService.upsertDocument(document)
						result.chunksCreated++
					}

					result.documentsIngested++
				}
			} catch (error) {
				result.errors.push(`Error processing PubMed query "${query.condition}": ${String(error)}`)
			}
		}

		return result
	}

	static async ingestClinicalGuidelines(
		guidelines: GuidelineIngestion[],
		options: ChunkingOptions = DEFAULT_CHUNKING_OPTIONS
	): Promise<IngestionResult> {
		const result: IngestionResult = {
			documentsIngested: 0,
			chunksCreated: 0,
			errors: [],
			sourceType: 'clinical_guideline',
		}

		for (const guideline of guidelines) {
			try {
				const chunks = this.chunkContent(guideline.content, options)

				for (const chunk of chunks) {
					const document: EmbeddingDocument = {
						content: chunk.content,
						sourceType: 'clinical_guideline',
						sourceId: `guideline-${this.slugify(guideline.title)}-${chunk.metadata.chunkIndex}`,
						sourceName: guideline.title,
						metadata: {
							source: guideline.source,
							category: guideline.category,
							title: guideline.title,
							...chunk.metadata,
						},
						severityRelevance: guideline.severityRelevance || [],
					}

					await VectorStoreService.upsertDocument(document)
					result.chunksCreated++
				}

				result.documentsIngested++
			} catch (error) {
				result.errors.push(`Error processing guideline "${guideline.title}": ${String(error)}`)
			}
		}

		return result
	}

	static async ingestDrugInteractions(
		interactions: Array<{
			drug1: string
			drug2: string
			severity: string
			description: string
			recommendation: string
		}>
	): Promise<IngestionResult> {
		const result: IngestionResult = {
			documentsIngested: 0,
			chunksCreated: 0,
			errors: [],
			sourceType: 'interaction',
		}

		for (const interaction of interactions) {
			try {
				const content = `Drug Interaction: ${interaction.drug1} and ${interaction.drug2}\n` +
					`Severity: ${interaction.severity}\n` +
					`Description: ${interaction.description}\n` +
					`Recommendation: ${interaction.recommendation}`

				const document: EmbeddingDocument = {
					content,
					sourceType: 'interaction',
					sourceId: `interaction-${this.slugify(interaction.drug1)}-${this.slugify(interaction.drug2)}`,
					sourceName: `${interaction.drug1} - ${interaction.drug2} Interaction`,
					metadata: {
						drug1: interaction.drug1,
						drug2: interaction.drug2,
						severity: interaction.severity,
					},
					severityRelevance: interaction.severity === 'Major' || interaction.severity === 'Contraindicated'
						? ['drug_safety']
						: [],
				}

				await VectorStoreService.upsertDocument(document)
				result.documentsIngested++
				result.chunksCreated++
			} catch (error) {
				result.errors.push(`Error processing interaction ${interaction.drug1}-${interaction.drug2}: ${String(error)}`)
			}
		}

		return result
	}

	private static chunkContent(
		content: string,
		options: ChunkingOptions
	): ContentChunk[] {
		const chunks: ContentChunk[] = []
		const words = content.split(/\s+/)
		const originalLength = content.length

		if (words.length <= options.maxChunkSize) {
			return [{
				content: content.trim(),
				metadata: {
					chunkIndex: 0,
					totalChunks: 1,
					originalLength,
				},
			}]
		}

		let currentIndex = 0
		let chunkIndex = 0

		while (currentIndex < words.length) {
			const chunkWords = words.slice(
				currentIndex,
				currentIndex + options.maxChunkSize
			)

			const chunkContent = chunkWords.join(' ')

			chunks.push({
				content: chunkContent,
				metadata: {
					chunkIndex,
					totalChunks: -1,
					originalLength,
				},
			})

			currentIndex += options.maxChunkSize - options.overlapSize
			chunkIndex++
		}

		const totalChunks = chunks.length
		for (const chunk of chunks) {
			chunk.metadata.totalChunks = totalChunks
		}

		return chunks
	}

	private static getSeverityRelevance(section: string, content: string): string[] {
		const relevance: string[] = []
		const contentLower = content.toLowerCase()

		if (section === 'contraindications' || section === 'warnings') {
			relevance.push('drug_safety')
		}

		if (contentLower.includes('cardiac') || contentLower.includes('heart') ||
			contentLower.includes('myocardial') || contentLower.includes('arrhythmia')) {
			relevance.push('cardiac')
		}

		if (contentLower.includes('respiratory') || contentLower.includes('breathing') ||
			contentLower.includes('pulmonary') || contentLower.includes('asthma')) {
			relevance.push('respiratory')
		}

		if (contentLower.includes('renal') || contentLower.includes('kidney') ||
			contentLower.includes('nephro')) {
			relevance.push('renal')
		}

		if (contentLower.includes('hepatic') || contentLower.includes('liver')) {
			relevance.push('hepatic')
		}

		if (contentLower.includes('anaphylaxis') || contentLower.includes('allergic reaction')) {
			relevance.push('allergic')
		}

		if (contentLower.includes('neurological') || contentLower.includes('seizure') ||
			contentLower.includes('stroke')) {
			relevance.push('neurological')
		}

		return [...new Set(relevance)]
	}

	private static getSeverityRelevanceFromCondition(condition: string): string[] {
		const relevance: string[] = []
		const conditionLower = condition.toLowerCase()

		if (conditionLower.includes('heart') || conditionLower.includes('cardiac') ||
			conditionLower.includes('chest pain')) {
			relevance.push('cardiac')
		}

		if (conditionLower.includes('asthma') || conditionLower.includes('copd') ||
			conditionLower.includes('respiratory')) {
			relevance.push('respiratory')
		}

		if (conditionLower.includes('diabetes') || conditionLower.includes('hypertension') ||
			conditionLower.includes('kidney')) {
			relevance.push('chronic')
		}

		return relevance
	}

	private static slugify(text: string): string {
		return text
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '')
			.slice(0, 50)
	}

	static async getIngestionStats(): Promise<{
		totalDocuments: number
		bySourceType: Record<SourceType, number>
	}> {
		const breakdown = await VectorStoreService.getSourceBreakdown()
		const total = Object.values(breakdown).reduce((sum, count) => sum + count, 0)

		return {
			totalDocuments: total,
			bySourceType: breakdown,
		}
	}

	static async clearKnowledgeBase(sourceType?: SourceType): Promise<number> {
		if (sourceType) {
			return VectorStoreService.deleteBySourceType(sourceType)
		}

		let totalDeleted = 0
		const sourceTypes: SourceType[] = ['clinical_guideline', 'drug_label', 'pubmed', 'interaction']

		for (const type of sourceTypes) {
			const deleted = await VectorStoreService.deleteBySourceType(type)
			totalDeleted += deleted
		}

		return totalDeleted
	}
}
