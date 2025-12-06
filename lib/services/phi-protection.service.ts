import { v4 as uuidv4 } from 'uuid'

export type PHICategory =
	| 'patient_name'
	| 'date_of_birth'
	| 'social_security'
	| 'medical_record_number'
	| 'phone_number'
	| 'email'
	| 'address'
	| 'account_number'
	| 'health_plan_id'
	| 'device_identifier'
	| 'ip_address'
	| 'biometric'
	| 'photo'
	| 'other_identifier'

export interface PHIToken {
	token: string
	category: PHICategory
	originalValue: string
	position: {
		start: number
		end: number
	}
}

export interface DeidentificationResult {
	deidentifiedText: string
	tokens: PHIToken[]
	phiDetected: boolean
	categories: PHICategory[]
}

export interface ReidentificationResult {
	originalText: string
	tokensRestored: number
}

interface PHIPattern {
	category: PHICategory
	patterns: RegExp[]
	replacement: (token: string) => string
}

const PHI_PATTERNS: PHIPattern[] = [
	{
		category: 'social_security',
		patterns: [
			/\b\d{3}-\d{2}-\d{4}\b/g,
			/\b\d{9}\b(?=.*(?:ssn|social|security))/gi,
		],
		replacement: (token) => `[SSN-${token}]`,
	},
	{
		category: 'medical_record_number',
		patterns: [
			/\b(?:MRN|MR#?|Medical Record)\s*[:#]?\s*([A-Z0-9]{6,12})\b/gi,
			/\b[A-Z]{2,3}\d{6,10}\b/g,
		],
		replacement: (token) => `[MRN-${token}]`,
	},
	{
		category: 'phone_number',
		patterns: [
			/\b\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
			/\b\d{3}[-.\s]\d{4}\b/g,
		],
		replacement: (token) => `[PHONE-${token}]`,
	},
	{
		category: 'email',
		patterns: [
			/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
		],
		replacement: (token) => `[EMAIL-${token}]`,
	},
	{
		category: 'date_of_birth',
		patterns: [
			/\b(?:DOB|Date of Birth|Birth Date)\s*[:#]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/gi,
			/\b(?:born|birthdate)\s*[:#]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/gi,
		],
		replacement: (token) => `[DOB-${token}]`,
	},
	{
		category: 'address',
		patterns: [
			/\b\d{1,5}\s+(?:[A-Za-z]+\s*){1,4}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Way|Place|Pl)\b\.?\s*(?:,?\s*(?:Apt|Suite|Unit|#)\s*\d+)?/gi,
			/\b(?:P\.?O\.?\s*Box|Post Office Box)\s*\d+\b/gi,
		],
		replacement: (token) => `[ADDR-${token}]`,
	},
	{
		category: 'health_plan_id',
		patterns: [
			/\b(?:Insurance|Policy|Member|Subscriber)\s*(?:ID|#|Number)\s*[:#]?\s*([A-Z0-9]{8,15})\b/gi,
			/\b(?:Group|Plan)\s*(?:ID|#|Number)\s*[:#]?\s*([A-Z0-9]{6,12})\b/gi,
		],
		replacement: (token) => `[HPID-${token}]`,
	},
	{
		category: 'account_number',
		patterns: [
			/\b(?:Account|Acct)\s*(?:ID|#|Number)\s*[:#]?\s*([A-Z0-9]{6,15})\b/gi,
		],
		replacement: (token) => `[ACCT-${token}]`,
	},
	{
		category: 'ip_address',
		patterns: [
			/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
		],
		replacement: (token) => `[IP-${token}]`,
	},
]

const COMMON_FIRST_NAMES = new Set([
	'james', 'john', 'robert', 'michael', 'william', 'david', 'richard', 'joseph', 'thomas', 'charles',
	'mary', 'patricia', 'jennifer', 'linda', 'elizabeth', 'barbara', 'susan', 'jessica', 'sarah', 'karen',
	'daniel', 'matthew', 'anthony', 'mark', 'donald', 'steven', 'paul', 'andrew', 'joshua', 'kenneth',
	'nancy', 'betty', 'margaret', 'sandra', 'ashley', 'dorothy', 'kimberly', 'emily', 'donna', 'michelle',
])

const TITLE_PREFIXES = ['mr', 'mrs', 'ms', 'miss', 'dr', 'prof', 'patient']

export class PHIProtectionService {
	private static tokenMap: Map<string, PHIToken> = new Map()
	private static sessionTokens: Map<string, Map<string, PHIToken>> = new Map()

	static deidentify(
		text: string,
		sessionId?: string,
		options: { preserveAge?: boolean; preserveGender?: boolean } = {}
	): DeidentificationResult {
		let deidentifiedText = text
		const tokens: PHIToken[] = []
		const detectedCategories: Set<PHICategory> = new Set()

		for (const pattern of PHI_PATTERNS) {
			for (const regex of pattern.patterns) {
				const matches = text.matchAll(new RegExp(regex.source, regex.flags))
				
				for (const match of matches) {
					if (match.index === undefined) continue
					
					const token = this.generateToken()
					const phiToken: PHIToken = {
						token,
						category: pattern.category,
						originalValue: match[0],
						position: {
							start: match.index,
							end: match.index + match[0].length,
						},
					}
					
					tokens.push(phiToken)
					detectedCategories.add(pattern.category)
					
					deidentifiedText = deidentifiedText.replace(match[0], token)
					
					if (sessionId) {
						this.storeSessionToken(sessionId, phiToken)
					} else {
						this.tokenMap.set(token, phiToken)
					}
				}
			}
		}

		const nameTokens = this.detectAndTokenizeNames(deidentifiedText, sessionId)
		for (const nameToken of nameTokens) {
			tokens.push(nameToken)
			detectedCategories.add('patient_name')
			deidentifiedText = deidentifiedText.replace(nameToken.originalValue, nameToken.token)
		}

		return {
			deidentifiedText,
			tokens,
			phiDetected: tokens.length > 0,
			categories: Array.from(detectedCategories),
		}
	}

	static reidentify(
		text: string,
		sessionId?: string
	): ReidentificationResult {
		let originalText = text
		let tokensRestored = 0

		const tokenRegex = /\[PHI-[a-f0-9]{8}\]/g
		const matches = text.matchAll(tokenRegex)

		for (const match of matches) {
			const token = match[0]
			const phiToken = sessionId 
				? this.getSessionToken(sessionId, token)
				: this.tokenMap.get(token)
			
			if (phiToken) {
				originalText = originalText.replace(token, phiToken.originalValue)
				tokensRestored++
			}
		}

		return {
			originalText,
			tokensRestored,
		}
	}

	static deidentifyObject<T extends Record<string, unknown>>(
		obj: T,
		sessionId?: string,
		sensitiveFields: string[] = ['name', 'patientName', 'email', 'phone', 'address', 'ssn', 'mrn']
	): { deidentified: T; tokens: PHIToken[] } {
		const tokens: PHIToken[] = []
		const deidentified = JSON.parse(JSON.stringify(obj)) as T

		const processValue = (value: unknown, key: string): unknown => {
			if (typeof value === 'string') {
				if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
					const result = this.deidentify(value, sessionId)
					tokens.push(...result.tokens)
					return result.deidentifiedText
				}
				return value
			}
			
			if (Array.isArray(value)) {
				return value.map((item, index) => processValue(item, `${key}[${index}]`))
			}
			
			if (value && typeof value === 'object') {
				const processed: Record<string, unknown> = {}
				for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
					processed[k] = processValue(v, k)
				}
				return processed
			}
			
			return value
		}

		for (const [key, value] of Object.entries(deidentified)) {
			(deidentified as Record<string, unknown>)[key] = processValue(value, key)
		}

		return { deidentified, tokens }
	}

	static reidentifyObject<T extends Record<string, unknown>>(
		obj: T,
		sessionId?: string
	): T {
		const reidentified = JSON.parse(JSON.stringify(obj)) as T

		const processValue = (value: unknown): unknown => {
			if (typeof value === 'string') {
				return this.reidentify(value, sessionId).originalText
			}
			
			if (Array.isArray(value)) {
				return value.map(item => processValue(item))
			}
			
			if (value && typeof value === 'object') {
				const processed: Record<string, unknown> = {}
				for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
					processed[k] = processValue(v)
				}
				return processed
			}
			
			return value
		}

		for (const [key, value] of Object.entries(reidentified)) {
			(reidentified as Record<string, unknown>)[key] = processValue(value)
		}

		return reidentified
	}

	static clearSession(sessionId: string): void {
		this.sessionTokens.delete(sessionId)
	}

	static getSessionStats(sessionId: string): {
		tokenCount: number
		categoryCounts: Record<PHICategory, number>
	} {
		const sessionMap = this.sessionTokens.get(sessionId)
		if (!sessionMap) {
			return {
				tokenCount: 0,
				categoryCounts: {} as Record<PHICategory, number>,
			}
		}

		const categoryCounts: Record<string, number> = {}
		for (const token of sessionMap.values()) {
			categoryCounts[token.category] = (categoryCounts[token.category] || 0) + 1
		}

		return {
			tokenCount: sessionMap.size,
			categoryCounts: categoryCounts as Record<PHICategory, number>,
		}
	}

	static detectPHI(text: string): {
		hasPHI: boolean
		categories: PHICategory[]
		riskLevel: 'none' | 'low' | 'medium' | 'high'
	} {
		const result = this.deidentify(text)
		
		let riskLevel: 'none' | 'low' | 'medium' | 'high' = 'none'
		
		if (result.tokens.length === 0) {
			riskLevel = 'none'
		} else if (result.categories.includes('social_security') || result.categories.includes('medical_record_number')) {
			riskLevel = 'high'
		} else if (result.categories.includes('patient_name') || result.categories.includes('date_of_birth')) {
			riskLevel = 'medium'
		} else {
			riskLevel = 'low'
		}

		return {
			hasPHI: result.phiDetected,
			categories: result.categories,
			riskLevel,
		}
	}

	private static generateToken(): string {
		return `[PHI-${uuidv4().slice(0, 8)}]`
	}

	private static storeSessionToken(sessionId: string, token: PHIToken): void {
		if (!this.sessionTokens.has(sessionId)) {
			this.sessionTokens.set(sessionId, new Map())
		}
		this.sessionTokens.get(sessionId)!.set(token.token, token)
	}

	private static getSessionToken(sessionId: string, token: string): PHIToken | undefined {
		return this.sessionTokens.get(sessionId)?.get(token)
	}

	private static detectAndTokenizeNames(text: string, sessionId?: string): PHIToken[] {
		const tokens: PHIToken[] = []

		for (const prefix of TITLE_PREFIXES) {
			const regex = new RegExp(`\\b${prefix}\\.?\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)?)\\b`, 'gi')
			const matches = text.matchAll(regex)
			
			for (const match of matches) {
				if (match.index === undefined) continue
				
				const fullMatch = match[0]
				const name = match[1]
				
				const token = this.generateToken()
				const phiToken: PHIToken = {
					token,
					category: 'patient_name',
					originalValue: fullMatch,
					position: {
						start: match.index,
						end: match.index + fullMatch.length,
					},
				}
				
				tokens.push(phiToken)
				
				if (sessionId) {
					this.storeSessionToken(sessionId, phiToken)
				} else {
					this.tokenMap.set(token, phiToken)
				}
			}
		}

		const namePattern = /\b[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g
		const potentialNames = text.matchAll(namePattern)
		
		for (const match of potentialNames) {
			if (match.index === undefined) continue
			
			const name = match[0]
			const firstName = name.split(/\s+/)[0].toLowerCase()
			
			if (COMMON_FIRST_NAMES.has(firstName)) {
				const alreadyTokenized = tokens.some(t => 
					t.position.start <= match.index! && t.position.end >= match.index! + name.length
				)
				
				if (!alreadyTokenized) {
					const token = this.generateToken()
					const phiToken: PHIToken = {
						token,
						category: 'patient_name',
						originalValue: name,
						position: {
							start: match.index,
							end: match.index + name.length,
						},
					}
					
					tokens.push(phiToken)
					
					if (sessionId) {
						this.storeSessionToken(sessionId, phiToken)
					} else {
						this.tokenMap.set(token, phiToken)
					}
				}
			}
		}

		return tokens
	}

	static createSafePatientContext(
		originalContext: {
			name?: string
			dateOfBirth?: string
			age?: number
			gender?: string
			allergies?: string[]
			chronicConditions?: string[]
			currentMedications?: string[]
			chiefComplaint?: string
			currentSymptoms?: string[]
		},
		sessionId: string
	): {
		safeContext: Record<string, unknown>
		tokenCount: number
	} {
		const safeContext: Record<string, unknown> = {}
		let tokenCount = 0

		if (originalContext.name) {
			const result = this.deidentify(originalContext.name, sessionId)
			safeContext.name = result.deidentifiedText
			tokenCount += result.tokens.length
		}

		if (originalContext.dateOfBirth) {
			const result = this.deidentify(`DOB: ${originalContext.dateOfBirth}`, sessionId)
			safeContext.dateOfBirth = result.deidentifiedText.replace('DOB: ', '')
			tokenCount += result.tokens.length
		}

		if (originalContext.age !== undefined) {
			safeContext.age = originalContext.age
		}

		if (originalContext.gender) {
			safeContext.gender = originalContext.gender
		}

		if (originalContext.allergies) {
			safeContext.allergies = originalContext.allergies
		}

		if (originalContext.chronicConditions) {
			safeContext.chronicConditions = originalContext.chronicConditions
		}

		if (originalContext.currentMedications) {
			safeContext.currentMedications = originalContext.currentMedications
		}

		if (originalContext.chiefComplaint) {
			const result = this.deidentify(originalContext.chiefComplaint, sessionId)
			safeContext.chiefComplaint = result.deidentifiedText
			tokenCount += result.tokens.length
		}

		if (originalContext.currentSymptoms) {
			safeContext.currentSymptoms = originalContext.currentSymptoms.map(symptom => {
				const result = this.deidentify(symptom, sessionId)
				tokenCount += result.tokens.length
				return result.deidentifiedText
			})
		}

		return { safeContext, tokenCount }
	}
}
