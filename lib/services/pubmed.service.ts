/**
 * PubMed Service
 * Fetches clinical study references from NCBI PubMed API
 */

// ============================================
// Types
// ============================================

export interface ClinicalReference {
	pmid: string
	title: string
	authors: string[]
	journal: string
	year: number
	abstract?: string
	doi?: string
	url: string
	relevanceScore: number
	citationCount?: number
	publicationType: string[]
}

export interface PubMedSearchResult {
	totalCount: number
	references: ClinicalReference[]
	searchQuery: string
}

interface ESearchResult {
	esearchresult: {
		count: string
		idlist: string[]
	}
}

interface ESummaryResult {
	result: {
		[pmid: string]: {
			uid: string
			title: string
			authors: Array<{ name: string }>
			source: string
			pubdate: string
			epubdate: string
			articleids: Array<{ idtype: string; value: string }>
			pubtype: string[]
		}
	}
}

interface EFetchArticle {
	MedlineCitation: {
		PMID: { _: string }
		Article: {
			ArticleTitle: string
			Abstract?: { AbstractText: string | Array<{ _: string }> }
			AuthorList?: { Author: Array<{ LastName?: string; ForeName?: string }> }
			Journal: { Title: string; JournalIssue: { PubDate: { Year?: string } } }
			PublicationTypeList?: { PublicationType: Array<{ _: string }> }
		}
	}
}

// ============================================
// PubMed Service
// ============================================

const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'
const NCBI_API_KEY = process.env.NCBI_API_KEY || ''

export class PubMedService {
	/**
	 * Search PubMed for articles related to a condition and/or medication
	 */
	static async searchArticles(
		condition: string,
		medication?: string,
		options: {
			maxResults?: number
			yearFrom?: number
			yearTo?: number
			articleTypes?: string[]
		} = {}
	): Promise<PubMedSearchResult> {
		const { maxResults = 5, yearFrom, yearTo, articleTypes } = options

		try {
			// Build search query
			let query = this.buildSearchQuery(condition, medication, articleTypes)

			// Add date filters
			if (yearFrom || yearTo) {
				const fromYear = yearFrom || 1900
				const toYear = yearTo || new Date().getFullYear()
				query += ` AND ${fromYear}:${toYear}[pdat]`
			}

			// Step 1: Search for PMIDs
			const searchUrl = this.buildUrl('esearch.fcgi', {
				db: 'pubmed',
				term: query,
				retmax: maxResults.toString(),
				sort: 'relevance',
				retmode: 'json',
			})

			const searchResponse = await fetch(searchUrl)
			if (!searchResponse.ok) {
				throw new Error(`PubMed search failed: ${searchResponse.status}`)
			}

			const searchData: ESearchResult = await searchResponse.json()
			const pmids = searchData.esearchresult.idlist

			if (pmids.length === 0) {
				return {
					totalCount: 0,
					references: [],
					searchQuery: query,
				}
			}

			// Step 2: Fetch article summaries
			const references = await this.fetchArticleSummaries(pmids)

			return {
				totalCount: parseInt(searchData.esearchresult.count, 10),
				references,
				searchQuery: query,
			}
		} catch (error) {
			console.error('PubMed search error:', error)
			return {
				totalCount: 0,
				references: [],
				searchQuery: condition,
			}
		}
	}

	/**
	 * Search for clinical trials
	 */
	static async searchClinicalTrials(
		condition: string,
		medication?: string,
		maxResults: number = 3
	): Promise<ClinicalReference[]> {
		const result = await this.searchArticles(condition, medication, {
			maxResults,
			articleTypes: ['Clinical Trial', 'Randomized Controlled Trial'],
		})
		return result.references
	}

	/**
	 * Search for systematic reviews and meta-analyses
	 */
	static async searchSystematicReviews(
		condition: string,
		medication?: string,
		maxResults: number = 3
	): Promise<ClinicalReference[]> {
		const result = await this.searchArticles(condition, medication, {
			maxResults,
			articleTypes: ['Systematic Review', 'Meta-Analysis'],
		})
		return result.references
	}

	/**
	 * Search for practice guidelines
	 */
	static async searchGuidelines(
		condition: string,
		maxResults: number = 3
	): Promise<ClinicalReference[]> {
		const result = await this.searchArticles(condition, undefined, {
			maxResults,
			articleTypes: ['Practice Guideline', 'Guideline'],
		})
		return result.references
	}

	/**
	 * Get comprehensive references for a treatment recommendation
	 */
	static async getReferencesForTreatment(
		condition: string,
		medications: string[]
	): Promise<{
		guidelines: ClinicalReference[]
		clinicalTrials: ClinicalReference[]
		reviews: ClinicalReference[]
	}> {
		const [guidelines, clinicalTrials, reviews] = await Promise.all([
			this.searchGuidelines(condition, 2),
			this.searchClinicalTrials(
				condition,
				medications.length > 0 ? medications[0] : undefined,
				3
			),
			this.searchSystematicReviews(
				condition,
				medications.length > 0 ? medications[0] : undefined,
				2
			),
		])

		return {
			guidelines,
			clinicalTrials,
			reviews,
		}
	}

	/**
	 * Get article by PMID
	 */
	static async getArticleByPMID(pmid: string): Promise<ClinicalReference | null> {
		const summaries = await this.fetchArticleSummaries([pmid])
		return summaries[0] || null
	}

	// ============================================
	// Private Helper Methods
	// ============================================

	private static buildSearchQuery(
		condition: string,
		medication?: string,
		articleTypes?: string[]
	): string {
		let query = `(${condition}[Title/Abstract])`

		if (medication) {
			query += ` AND (${medication}[Title/Abstract] OR ${medication}[MeSH Terms])`
		}

		// Add article type filters
		if (articleTypes && articleTypes.length > 0) {
			const typeFilter = articleTypes
				.map((type) => `"${type}"[Publication Type]`)
				.join(' OR ')
			query += ` AND (${typeFilter})`
		}

		// Prefer recent articles and those in English
		query += ' AND English[lang]'

		return query
	}

	private static buildUrl(
		endpoint: string,
		params: Record<string, string>
	): string {
		const url = new URL(`${PUBMED_BASE_URL}/${endpoint}`)

		// Add API key if available (increases rate limit)
		if (NCBI_API_KEY) {
			params.api_key = NCBI_API_KEY
		}

		Object.entries(params).forEach(([key, value]) => {
			url.searchParams.append(key, value)
		})

		return url.toString()
	}

	private static async fetchArticleSummaries(
		pmids: string[]
	): Promise<ClinicalReference[]> {
		try {
			const summaryUrl = this.buildUrl('esummary.fcgi', {
				db: 'pubmed',
				id: pmids.join(','),
				retmode: 'json',
			})

			const summaryResponse = await fetch(summaryUrl)
			if (!summaryResponse.ok) {
				throw new Error(`PubMed summary fetch failed: ${summaryResponse.status}`)
			}

			const summaryData: ESummaryResult = await summaryResponse.json()
			const references: ClinicalReference[] = []

			for (const pmid of pmids) {
				const article = summaryData.result[pmid]
				if (!article || !article.uid) continue

				// Extract year from pubdate
				const yearMatch = article.pubdate?.match(/\d{4}/)
				const year = yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear()

				// Get DOI if available
				const doiEntry = article.articleids?.find((id) => id.idtype === 'doi')
				const doi = doiEntry?.value

				// Calculate relevance score based on position in results and recency
				const positionScore = 100 - (pmids.indexOf(pmid) * 10)
				const recencyBonus = Math.max(0, (year - 2015) * 2)
				const relevanceScore = Math.min(100, positionScore + recencyBonus)

				references.push({
					pmid: article.uid,
					title: article.title || 'No title available',
					authors: article.authors?.map((a) => a.name) || [],
					journal: article.source || 'Unknown Journal',
					year,
					doi,
					url: `https://pubmed.ncbi.nlm.nih.gov/${article.uid}/`,
					relevanceScore,
					publicationType: article.pubtype || [],
				})
			}

			return references
		} catch (error) {
			console.error('PubMed summary fetch error:', error)
			return []
		}
	}

	/**
	 * Fetch full abstract for an article (optional - use when needed)
	 */
	static async fetchAbstract(pmid: string): Promise<string | null> {
		try {
			const fetchUrl = this.buildUrl('efetch.fcgi', {
				db: 'pubmed',
				id: pmid,
				retmode: 'xml',
				rettype: 'abstract',
			})

			const response = await fetch(fetchUrl)
			if (!response.ok) return null

			const xmlText = await response.text()

			// Simple XML parsing for abstract
			const abstractMatch = xmlText.match(
				/<AbstractText[^>]*>([^<]*)<\/AbstractText>/
			)
			if (abstractMatch) {
				return abstractMatch[1]
			}

			// Handle structured abstracts
			const structuredAbstracts = xmlText.match(
				/<AbstractText[^>]*Label="[^"]*"[^>]*>([^<]*)<\/AbstractText>/g
			)
			if (structuredAbstracts) {
				return structuredAbstracts
					.map((match) => {
						const labelMatch = match.match(/Label="([^"]*)"/)
						const textMatch = match.match(/>([^<]*)</)
						if (labelMatch && textMatch) {
							return `${labelMatch[1]}: ${textMatch[1]}`
						}
						return textMatch ? textMatch[1] : ''
					})
					.join('\n\n')
			}

			return null
		} catch (error) {
			console.error('PubMed abstract fetch error:', error)
			return null
		}
	}

	/**
	 * Get evidence level based on publication type
	 */
	static getEvidenceLevel(publicationTypes: string[]): 'A' | 'B' | 'C' | 'D' {
		const types = publicationTypes.map((t) => t.toLowerCase())

		// Level A: Systematic reviews, meta-analyses
		if (
			types.some((t) =>
				t.includes('systematic review') || t.includes('meta-analysis')
			)
		) {
			return 'A'
		}

		// Level B: RCTs
		if (
			types.some((t) =>
				t.includes('randomized controlled trial') || t.includes('clinical trial')
			)
		) {
			return 'B'
		}

		// Level C: Cohort studies, case-control studies
		if (
			types.some((t) =>
				t.includes('cohort') ||
				t.includes('case-control') ||
				t.includes('observational')
			)
		) {
			return 'C'
		}

		// Level D: Expert opinion, case reports
		return 'D'
	}

	/**
	 * Format reference as citation string
	 */
	static formatCitation(reference: ClinicalReference): string {
		const authors =
			reference.authors.length > 3
				? `${reference.authors.slice(0, 3).join(', ')}, et al.`
				: reference.authors.join(', ')

		return `${authors} ${reference.title}. ${reference.journal}. ${reference.year}.${reference.doi ? ` doi:${reference.doi}` : ''} PMID: ${reference.pmid}`
	}
}
