-- Enable pgvector extension for similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Medical knowledge embeddings table for RAG
CREATE TABLE medical_knowledge_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(384),
  source_type TEXT NOT NULL,
  source_id TEXT,
  source_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  severity_relevance TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for similarity search using cosine distance
CREATE INDEX idx_medical_embeddings_vector 
  ON medical_knowledge_embeddings 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create index for source_type filtering
CREATE INDEX idx_medical_embeddings_source_type 
  ON medical_knowledge_embeddings (source_type);

-- Create index for source_id lookups
CREATE INDEX idx_medical_embeddings_source_id 
  ON medical_knowledge_embeddings (source_id);

-- Severe conditions reference table for severity detection
CREATE TABLE severe_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_name TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  vital_thresholds JSONB DEFAULT '{}',
  risk_category TEXT NOT NULL,
  required_validations TEXT[] DEFAULT '{}',
  auto_escalate BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for risk category filtering
CREATE INDEX idx_severe_conditions_risk_category 
  ON severe_conditions (risk_category);

-- Create GIN index for keyword array search
CREATE INDEX idx_severe_conditions_keywords 
  ON severe_conditions USING GIN (keywords);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_medical_knowledge_embeddings_updated_at
  BEFORE UPDATE ON medical_knowledge_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_severe_conditions_updated_at
  BEFORE UPDATE ON severe_conditions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function for similarity search with filtering
CREATE OR REPLACE FUNCTION search_medical_knowledge(
  query_embedding vector(384),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  filter_source_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  source_type TEXT,
  source_id TEXT,
  source_name TEXT,
  metadata JSONB,
  severity_relevance TEXT[],
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mke.id,
    mke.content,
    mke.source_type,
    mke.source_id,
    mke.source_name,
    mke.metadata,
    mke.severity_relevance,
    1 - (mke.embedding <=> query_embedding) AS similarity
  FROM medical_knowledge_embeddings mke
  WHERE 
    (filter_source_type IS NULL OR mke.source_type = filter_source_type)
    AND 1 - (mke.embedding <=> query_embedding) > match_threshold
  ORDER BY mke.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
