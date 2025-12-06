export { FDADrugLookupTool, executeFDADrugLookup, fdaDrugLookupSchema } from './fda-drug-lookup.tool'
export type { FDADrugLookupInput } from './fda-drug-lookup.tool'

export { RxNormValidationTool, executeRxNormValidation, rxnormValidationSchema } from './rxnorm-validation.tool'
export type { RxNormValidationInput } from './rxnorm-validation.tool'

export { DrugInteractionTool, executeDrugInteractionCheck, drugInteractionSchema } from './drug-interaction.tool'
export type { DrugInteractionInput } from './drug-interaction.tool'

export { VectorStoreRetrievalTool, executeVectorStoreRetrieval, vectorStoreRetrievalSchema } from './vector-store-retrieval.tool'
export type { VectorStoreRetrievalInput } from './vector-store-retrieval.tool'

export { PubMedSearchTool, executePubMedSearch, pubmedSearchSchema } from './pubmed-search.tool'
export type { PubMedSearchInput } from './pubmed-search.tool'

export { SeverityAssessmentTool, executeSeverityAssessment, severityAssessmentSchema } from './severity-assessment.tool'
export type { SeverityAssessmentInput } from './severity-assessment.tool'

import { FDADrugLookupTool } from './fda-drug-lookup.tool'
import { RxNormValidationTool } from './rxnorm-validation.tool'
import { DrugInteractionTool } from './drug-interaction.tool'
import { VectorStoreRetrievalTool } from './vector-store-retrieval.tool'
import { PubMedSearchTool } from './pubmed-search.tool'
import { SeverityAssessmentTool } from './severity-assessment.tool'

export const allAgentTools = [
	FDADrugLookupTool,
	RxNormValidationTool,
	DrugInteractionTool,
	VectorStoreRetrievalTool,
	PubMedSearchTool,
	SeverityAssessmentTool,
]

export const toolsByName = {
	fda_drug_lookup: FDADrugLookupTool,
	rxnorm_validation: RxNormValidationTool,
	drug_interaction_check: DrugInteractionTool,
	vector_store_retrieval: VectorStoreRetrievalTool,
	pubmed_search: PubMedSearchTool,
	severity_assessment: SeverityAssessmentTool,
}

