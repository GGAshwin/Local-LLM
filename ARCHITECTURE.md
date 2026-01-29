# Architecture & Design Document

## System Overview

This RAG (Retrieval-Augmented Generation) system implements a production-ready architecture for local AI inference and semantic search.

## Core Components

### 1. Ollama Service (`src/services/ollamaService.js`)
**Purpose**: Interface with Ollama REST API

**Key Functions**:
- `generateEmbedding(text)` - Create vector for single text
- `generateEmbeddings(texts)` - Batch embedding generation
- `generateResponse(prompt)` - LLM inference
- `checkOllamaHealth()` - Service availability check
- `getAvailableModels()` - List installed models

**Design Decisions**:
- Uses axios for HTTP requests with 60s timeout
- Supports batch embedding for efficiency
- Health checks prevent runtime failures

### 2. Vector Store (`src/services/vectorStore.js`)
**Purpose**: Manage document storage and similarity search

**Key Functions**:
- `initializeVectorStore()` - Connect to LanceDB
- `addDocuments(documents)` - Index new documents
- `search(query, k)` - Retrieve top-k similar chunks
- `getAllDocuments()` - Fetch all indexed documents
- `getStats()` - Get store statistics

**Design Decisions**:
- Lazy initialization of database connection
- Automatic embedding generation on document add
- Configurable similarity search parameters
- Support for document metadata

### 3. Text Processing (`src/utils/textProcessing.js`)
**Purpose**: Prepare text for embedding and retrieval

**Key Functions**:
- `chunkText()` - Split text with configurable overlap
- `chunkDocuments()` - Process multiple documents
- `formatContext()` - Prepare retrieved context
- `buildRAGPrompt()` - Construct LLM prompt
- `cleanText()` - Normalize text
- `generateDocumentId()` - Create unique IDs

**Design Decisions**:
- Configurable chunk size and overlap
- Preserves source document metadata
- Automatic prompt template with context injection
- Ensures clean text for consistent embeddings

### 4. Configuration (`src/config/config.js`)
**Purpose**: Centralized configuration management

**Features**:
- Environment variable loading via dotenv
- Sensible defaults for all settings
- Type conversions for numeric values
- Organized by component (ollama, lancedb, rag, app)

## Data Flow

```
Input Documents
      ↓
  Chunking
      ↓
Embedding Generation (Ollama)
      ↓
Vector Storage (LanceDB)
      ↓
      
User Query
      ↓
Query Embedding (Ollama)
      ↓
Similarity Search (LanceDB)
      ↓
Context Retrieval
      ↓
Prompt Building
      ↓
LLM Inference (Ollama)
      ↓
Response Generation
```

## Module Dependencies

```
index.js (Main Pipeline)
├── ollamaService.js
│   └── config.js
├── vectorStore.js
│   ├── config.js
│   └── ollamaService.js
└── textProcessing.js
    └── config.js

ingest.js (Document Ingestion)
├── vectorStore.js
└── textProcessing.js

query.js (Interactive Mode)
├── vectorStore.js
├── ollamaService.js
└── textProcessing.js

test.js (System Tests)
├── vectorStore.js
├── ollamaService.js
└── textProcessing.js
```

## Error Handling Strategy

1. **API Failures**: Ollama service checks with fallback error messages
2. **Database Errors**: LanceDB initialization handles missing tables
3. **Validation**: Input validation before processing
4. **Graceful Degradation**: Clear error messages guide users

## Extension Points

### Add Custom Embedding Models
```javascript
// In config.js, change OLLAMA_EMBEDDING_MODEL
// Or pass different model to generateEmbedding()
```

### Add Custom LLM Models
```javascript
// Change OLLAMA_LLM_MODEL in .env
// Different models automatically supported
```

### Custom Document Formats
```javascript
// Extend ingest.js to parse PDF, DOCX, etc.
// Use existing chunkText() and addDocuments()
```

### REST API Wrapper
```javascript
// Create express server using existing services
// Expose /embed, /search, /query endpoints
```

### Custom Retrieval Logic
```javascript
// Modify search() function in vectorStore.js
// Implement filtering, ranking, reranking
```

## Performance Characteristics

| Operation | Time | Notes |
|-----------|------|-------|
| Embedding (per chunk) | 100-500ms | Depends on model and text length |
| Vector Search | 10-50ms | LanceDB with optimized index |
| LLM Inference | 5-30s | Highly dependent on model size |
| Document Ingestion | Linear with docs | Batch embedding reduces overhead |

## Scalability Considerations

1. **Vertical Scaling**
   - Increase chunk size for faster processing
   - Use smaller, faster models (mistral vs llama2)
   - GPU acceleration for Ollama

2. **Horizontal Scaling**
   - Deploy Ollama on GPU cluster
   - Multiple LanceDB instances with sharding
   - Load balancer for API endpoints

3. **Optimization Opportunities**
   - Embedding caching
   - Query result caching
   - Batch processing
   - Incremental indexing

## Security Considerations

1. **Local-Only Operation**: No data sent to external services
2. **Access Control**: Implement authentication for API endpoints
3. **Input Validation**: Sanitize user queries and documents
4. **Resource Limits**: Implement rate limiting for API
5. **Encryption**: Consider encrypting vector store on disk

## Testing Strategy

1. **Unit Tests**: Test individual services
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test complete RAG pipeline
4. **Performance Tests**: Measure latency and throughput

## Deployment Checklist

- [ ] Ollama properly configured with required models
- [ ] Environment variables set in production
- [ ] Vector store backed up regularly
- [ ] Monitoring and logging configured
- [ ] Error handling tested for edge cases
- [ ] API rate limiting implemented
- [ ] Security review completed

## Future Enhancements

1. **Advanced Retrieval**
   - Hybrid search (keyword + semantic)
   - Multi-stage retrieval pipeline
   - Query expansion
   - Result reranking

2. **Model Management**
   - Model versioning
   - A/B testing different models
   - Automatic model selection

3. **User Interface**
   - Web dashboard
   - Real-time streaming responses
   - Document management UI

4. **Analytics**
   - Query tracking
   - Response quality metrics
   - Usage patterns

5. **Integration**
   - REST API
   - GraphQL API
   - Message queue support
