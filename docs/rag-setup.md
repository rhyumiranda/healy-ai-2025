# RAG (Retrieval-Augmented Generation) Setup

This document explains how to set up the RAG-based AI analyzer for the Treatment Plan Assistant.

## Overview

The RAG system uses OpenAI Assistants API with file search to provide context-aware treatment recommendations. It retrieves relevant information from a knowledge base containing:

- Clinical practice guidelines
- Drug interaction databases
- Treatment protocols
- Drug reference information

## Environment Variables

Add these to your `.env` file:

```env
# Required
OPENAI_API_KEY=sk-your-api-key-here

# Optional - Generated automatically when you seed the knowledge base
OPENAI_ASSISTANT_ID=asst_xxx
OPENAI_VECTOR_STORE_ID=vs_xxx
```

## Setup Steps

### 1. Initialize the Knowledge Base

Call the seed endpoint to create the assistant and populate the vector store:

```bash
# Using curl
curl -X POST http://localhost:3000/api/knowledge/seed \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie"

# Or using the browser console while logged in
fetch('/api/knowledge/seed', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

The response will include the `assistantId` and `vectorStoreId` to add to your `.env` file.

### 2. Verify Setup

Check the status of your knowledge base:

```bash
curl http://localhost:3000/api/knowledge/status \
  -H "Cookie: your-session-cookie"
```

### 3. Upload Additional Documents (Optional)

Upload custom medical documents to enhance the knowledge base:

```bash
curl -X POST http://localhost:3000/api/knowledge/upload \
  -H "Cookie: your-session-cookie" \
  -F "file=@your-document.json" \
  -F "category=clinical-guidelines"
```

Supported file types: JSON, PDF, TXT, MD

Categories:
- `clinical-guidelines`
- `drug-interactions`
- `treatment-protocols`
- `general`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/knowledge/seed` | POST | Initialize knowledge base with default data |
| `/api/knowledge/status` | GET | Get vector store status and file list |
| `/api/knowledge/upload` | POST | Upload a document to the knowledge base |
| `/api/knowledge/files/[fileId]` | DELETE | Remove a file from the knowledge base |

## Using RAG in Analysis

The treatment analysis will automatically use RAG when:
1. `OPENAI_ASSISTANT_ID` is configured in environment
2. The vector store has been seeded with knowledge

You can also explicitly enable/disable RAG per request:

```typescript
// Force RAG usage
const response = await fetch('/api/treatment-plans/analyze', {
  method: 'POST',
  body: JSON.stringify({
    ...patientData,
    useRAG: true
  })
})
```

## Knowledge Base Contents

### Drug Interactions
Common clinically significant drug-drug interactions including:
- Severity levels (Minor, Moderate, Major, Contraindicated)
- Descriptions and mechanisms
- Recommendations

### Clinical Guidelines
Evidence-based guidelines for conditions like:
- Hypertension
- Type 2 Diabetes
- Community-Acquired Pneumonia
- Major Depressive Disorder
- And more...

### Treatment Protocols
Standard treatment protocols including:
- Medication recommendations by severity
- Monitoring requirements
- Red flags and follow-up guidance

## Troubleshooting

### "Vector store not configured"
Run the `/api/knowledge/seed` endpoint to initialize.

### "Assistant not found"
The assistant ID in your `.env` may be invalid. Run the seed endpoint again to create a new assistant.

### "RAG analysis failed"
The system will automatically fall back to standard chat completions. Check the server logs for details.
