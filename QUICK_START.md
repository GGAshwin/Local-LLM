# Local RAG System - Quick Start Guide

## ✅ System is Ready!

Your production-ready Node.js RAG (Retrieval-Augmented Generation) system is fully set up and working!

## 🚀 Getting Started in 3 Steps

### 1. Start Ollama (First Time Only)
```bash
ollama serve
```
Keep this terminal window open. Ollama will run in the background.

### 2. Pull Models (First Time Only)
In a new terminal:
```bash
ollama pull nomic-embed-text
ollama pull llama2
```

### 3. Run the RAG System
```bash
cd "/Users/I528705/Hobby/Local LLM"
NODE_OPTIONS="--max-old-space-size=8192" npm start
```

Or use the convenience script:
```bash
./run.sh start
```

## 📖 Available Commands

```bash
# Run the full RAG pipeline with sample data
npm start

# Interactive query mode (ask questions about documents)
npm run query

# Ingest documents from data/ directory
npm run ingest

# Run system tests
npm run test

# Development mode with auto-reload
npm run dev
```

## 📄 Adding Your Documents

1. Create `.txt` files in the `data/` directory
2. Run: `npm run ingest`
3. Then query: `npm run query`

Example:
```bash
echo "Your document text here..." > data/my_document.txt
npm run ingest
npm run query
# Type your questions!
```

## 🏗️ Project Structure

```
Local LLM/
├── src/
│   ├── index.js              # Main RAG demo
│   ├── ingest.js             # Document ingestion
│   ├── query.js              # Interactive mode
│   ├── config/config.js      # Configuration
│   ├── services/
│   │   ├── ollamaService.js  # Ollama integration
│   │   └── vectorStore.js    # LanceDB operations
│   └── utils/
│       └── textProcessing.js # Text utilities
├── data/                      # Your documents go here
├── db/                        # Vector store (auto-created)
└── package.json
```

## 🔧 Configuration

Edit `.env` to customize:
- `OLLAMA_LLM_MODEL` - Change to different model (mistral, neural-chat, etc.)
- `CHUNK_SIZE` - Size of text chunks (default: 256)
- `TOP_K_RESULTS` - Number of retrieved documents (default: 5)

## 🐛 Troubleshooting

### "Ollama is not running"
```bash
ollama serve
```

### "Model not found" 
```bash
ollama pull llama2
ollama pull nomic-embed-text
```

### Out of memory errors
The system already handles this with batching, but you can increase Node.js heap:
```bash
NODE_OPTIONS="--max-old-space-size=8192" npm start
```

### No documents found in vector store
```bash
rm -rf db/lancedb
npm run ingest  # Or npm start for sample data
```

## 📊 What Just Happened

Your RAG system successfully:
1. ✅ Connected to Ollama running locally
2. ✅ Created 5 sample documents
3. ✅ Split them into chunks
4. ✅ Generated embeddings using nomic-embed-text
5. ✅ Stored vectors in LanceDB
6. ✅ Performed semantic similarity search
7. ✅ Generated context-aware responses using llama2

## 🎯 Next Steps

1. **Add Your Own Documents**
   ```bash
   cp yourfile.txt data/
   npm run ingest
   npm run query
   ```

2. **Customize Models**
   - Edit `.env` to use different embedding or LLM models
   - Available models: `mistral`, `neural-chat`, `dolphin-mixtral`, etc.

3. **Integrate with Your App**
   - Import the services from `src/services/`
   - Use `addDocuments()`, `search()`, `generateResponse()`

4. **Add REST API**
   - Wrap with Express/Fastify
   - Create `/api/ingest`, `/api/search`, `/api/query` endpoints

## 📚 Documentation Files

- **README.md** - Comprehensive documentation
- **ARCHITECTURE.md** - System design and extension points
- **This file** - Quick start guide

## 🚀 Performance Tips

- Smaller models (mistral) run faster than larger ones (llama2)
- Reduce `CHUNK_SIZE` for faster but less contextual results
- Reduce `TOP_K_RESULTS` to speed up queries
- Use `npm run dev` for rapid iteration

## 💡 Examples

### Process Custom Documents
```bash
# Add documents
echo "AI is transforming society..." > data/ai_trends.txt
echo "Kubernetes orchestrates containers..." > data/k8s_guide.txt

# Ingest
npm run ingest

# Query
npm run query
# Type: "What is AI?"
```

### Programmatic Usage
```javascript
import { initializeVectorStore, addDocuments, search } from './src/services/vectorStore.js';
import { generateResponse } from './src/services/ollamaService.js';
import { buildRAGPrompt, formatContext } from './src/utils/textProcessing.js';

// Initialize and add docs
await initializeVectorStore();
await addDocuments([{ id: '1', content: 'My document...' }]);

// Search and respond
const results = await search('my question', 5);
const context = formatContext(results);
const prompt = buildRAGPrompt('my question', context);
const response = await generateResponse(prompt);
console.log(response);
```

## 🎓 Learning Resources

- Ollama: https://ollama.ai
- LanceDB: https://lancedb.com
- Vector Embeddings: https://www.pinecone.io/learn/vector-embeddings/
- RAG Pattern: https://arxiv.org/abs/2005.11401

---

**Enjoy your local RAG system! 🚀**
