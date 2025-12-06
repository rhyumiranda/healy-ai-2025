Agentic RAG Implementation Plan for Healthcare AI
Executive Summary
Build a compliant, enterprise-grade Agentic RAG system for the AI-Powered Treatment Plan Assistant using LangChain orchestration with OpenAI GPT-4 Turbo. The system will handle complex clinical workflows while maintaining HIPAA/GDPR compliance and ensuring medical accuracy through multi-source validation.

---

1. Architecture Overview: Agentic RAG
Why Agentic RAG for Healthcare
Unlike traditional RAG (simple similarity search), Agentic RAG employs AI agents capable of:

Multi-step reasoning: Cross-reference patient records, lab results, and clinical guidelines
Query routing: Direct queries to appropriate knowledge sources (FDA, PubMed, drug databases)
Tool calling: Invoke external medical APIs for real-time validation
Planning: Orchestrate complex clinical decision workflows
Current Implementation Status
The project has foundational RAG components in lib/services/rag/:

embedding.service.ts - Text embedding generation
vector-store.service.ts - pgvector storage/retrieval  
retrieval.service.ts - Context retrieval with severity-aware ranking
knowledge-ingestion.service.ts - Multi-source data ingestion
The main AI service (lib/services/openai.service.ts) already implements:

Severity detection and cascade validation
Grounding verification for response accuracy
NSAID contraindication guardrails
---

2. Technology Stack
| Component | Technology | Purpose |

|-----------|------------|---------|

| Orchestration | LangChain | Agent workflows, chain composition, tool management |

| Base LLM | OpenAI GPT-4 Turbo | Clinical reasoning, treatment generation |

| Vector Database | Supabase pgvector | HIPAA-compliant embedding storage |

| Embedding Model | OpenAI text-embedding-3-small | Document/query embeddings |

| External APIs | OpenFDA, RxNorm, PubMed | Drug validation, interactions, evidence |

---

3. Core Agent Architecture
3.1 Agent Types to Implement
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR AGENT                        │
│         (Routes queries, manages workflow state)             │
└─────────────────┬───────────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┬─────────────┐
    ▼             ▼             ▼             ▼
┌────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│Clinical│  │   Drug   │  │ Safety   │  │ Evidence │
│Reasoner│  │Validator │  │ Checker  │  │ Retriever│
└────────┘  └──────────┘  └──────────┘  └──────────┘
Orchestrator Agent: Routes queries, manages multi-step workflows
Clinical Reasoning Agent: Analyzes symptoms, generates treatment plans
Drug Validation Agent: Validates medications via FDA/RxNorm APIs
Safety Checker Agent: Detects contraindications, interactions, allergies
Evidence Retrieval Agent: Queries RAG knowledge base for clinical guidelines
3.2 LangChain Integration Points
Key file: lib/services/openai.service.ts

// New: LangChain agent configuration
const agentTools = [
  new FDADrugLookupTool(),
  new RxNormValidationTool(),
  new PubMedSearchTool(),
  new VectorStoreRetrievalTool(),
  new DrugInteractionTool(),
]

const orchestratorAgent = new AgentExecutor({
  agent: createOpenAIFunctionsAgent({
    llm: new ChatOpenAI({ model: 'gpt-4-turbo' }),
    tools: agentTools,
    prompt: CLINICAL_ORCHESTRATOR_PROMPT,
  }),
})
---

4. Healthcare Compliance Requirements
4.1 HIPAA Compliance
| Requirement | Implementation |

|-------------|----------------|

| Data Encryption | TLS 1.3 in transit, AES-256 at rest (Supabase) |

| Access Controls | Role-based auth via NextAuth, audit logging |

| PHI Tokenization | De-identify patient data before LLM calls |

| Audit Trail | Log all AI queries/responses with timestamps |

| BAA | Supabase enterprise BAA, OpenAI enterprise agreement |

4.2 GDPR Compliance
| Requirement | Implementation |

|-------------|----------------|

| Data Minimization | Only process necessary patient data |

| Right to Erasure | Implement patient data deletion endpoints |

| Consent Management | Explicit consent before AI processing |

| Data Portability | Export patient records in standard formats |

4.3 Existing Safety Infrastructure
Located in lib/services/safety/:

severity-detection.service.ts - Case severity assessment
cascade-validator.service.ts - Multi-layer validation for severe cases
grounding-verification.service.ts - Verify AI responses against sources
---

5. Data Quality and Curation
5.1 Knowledge Base Sources
Current ingestion via app/api/knowledge/ingest/route.ts:

| Source Type | Data | Validation |

|-------------|------|------------|

| fda | Drug labels, contraindications, dosing | OpenFDA API |

| pubmed | Clinical research, treatment evidence | PubMed API |

| guidelines | Clinical practice guidelines | Manual curation |

| interactions | Drug-drug interaction data | Structured format |

5.2 Data Pipeline
External Sources → Ingestion API → Chunking/Embedding → pgvector Store
       ↓                                                      ↓
   Validation                                          Retrieval Service
       ↓                                                      ↓
   Quality Score                                      RAG Context Builder
---

6. Evaluation and Validation Framework
6.1 Clinical Accuracy Metrics
Medication Appropriateness: Compare against clinical guidelines
Contraindication Detection Rate: Must be >99% for known contraindications
Drug Interaction Coverage: Track missed vs. caught interactions
Dosage Accuracy: Validate against FDA-approved ranges
6.2 Human-in-the-Loop
Current implementation requires physician approval (PlanStatus.APPROVED) before finalizing any treatment plan. The wasModified flag tracks physician edits for continuous improvement.

6.3 Explainability Requirements
The system already provides:

Source citations via RAGContext.citations
Confidence scores per medication
Evidence levels (A/B/C/D) based on reference quality
Risk justifications for all recommendations
---

7. Implementation Phases
Phase 1: LangChain Agent Framework (Week 1-2)
Install LangChain dependencies
Create base agent tools wrapping existing services
Implement orchestrator agent with routing logic
Add agent tracing/debugging infrastructure
Phase 2: Enhanced RAG Pipeline (Week 2-3)
Implement hybrid search (semantic + keyword)
Add metadata filtering for source types
Implement re-ranking with clinical relevance scoring
Add source diversity enforcement
Phase 3: Compliance Hardening (Week 3-4)
Implement PHI de-identification layer
Add comprehensive audit logging
Create data retention/deletion policies
Document compliance procedures
Phase 4: Evaluation and Testing (Week 4-5)
Build clinical accuracy test suite
Implement automated regression testing
Set up monitoring dashboards
Conduct human evaluation with clinical advisors
---

8. Key Files to Modify/Create
| File | Action | Purpose |

|------|--------|---------|

| lib/services/langchain/ | Create | New agent framework directory |

| lib/services/langchain/orchestrator.agent.ts | Create | Main orchestrator agent |

| lib/services/langchain/tools/ | Create | LangChain tool wrappers |

| lib/services/openai.service.ts | Modify | Integrate LangChain agents |

| lib/services/rag/retrieval.service.ts | Modify | Add hybrid search |

| lib/middleware/audit.ts | Create | HIPAA audit logging |

| lib/services/phi-protection.service.ts | Create | PHI de-identification |

---

9. Success Criteria
[ ] Agentic workflow handles multi-step clinical queries
[ ] All drug recommendations validated against FDA database
[ ] Zero HIPAA violations in PHI handling
[ ] Contraindication detection rate >99%
[ ] All AI outputs include verifiable source citations
[ ] Physician override/modification tracking functional
[ ] Response time <5 seconds for standard queries