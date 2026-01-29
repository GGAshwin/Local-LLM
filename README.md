# Local RAG System - Production-Ready Node.js Application

A complete, beginner-friendly Node.js Retrieval-Augmented Generation (RAG) system that uses **Ollama** for local LLM inference and **LanceDB** for vector storage.

## 📋 Features

✅ **Local-First Architecture** - Everything runs on your machine
✅ **Production-Ready** - Clean code structure with proper error handling
✅ **Document Ingestion** - Process and chunk multiple documents
✅ **Vector Storage** - Efficient similarity search with LanceDB
✅ **RAG Pipeline** - Retrieve context and generate informed responses
✅ **Interactive Query Mode** - Ask questions about your documents
✅ **Extensible Design** - Easy to add new features and models

## 🛠️ Prerequisites

### System Requirements
- Node.js 16+ (download from [nodejs.org](https://nodejs.org))
- Ollama (download from [ollama.ai](https://ollama.ai))
- At least 8GB RAM recommended
- macOS, Linux, or Windows

### Install Ollama
1. Download Ollama from [ollama.ai](https://ollama.ai)
2. Install and launch the application
3. Pull a language model:
   ```bash
   ollama pull llama2
   # or other models
   ollama pull mistral
   ollama pull neural-chat
   ```

## 📦 Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd /path/to/Local\ LLM
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file** (copy from ENV_SETUP.txt)
   ```bash
   cp ENV_SETUP.txt .env
   ```

4. **Customize `.env` if needed**
   - Change `OLLAMA_LLM_MODEL` to match your installed model
   - Adjust `CHUNK_SIZE` and `TOP_K_RESULTS` as needed

## 🚀 Quick Start

### 1. Start Ollama Service
```bash
ollama serve
# Keep this running in a separate terminal
```

### 2. Run the Full RAG Pipeline
```bash
npm start
```

This demonstrates the complete RAG flow with sample documents.

### 3. Ingest Custom Documents
```bash
# Add .txt files to the data/ directory
# Then run:
npm run ingest
```

### 4. Interactive Query Mode
```bash
npm run query
# Type your questions and get context-aware responses
```

### 5. Run Tests
```bash
npm test
```

## 📁 Project Structure

```
Local LLM/
├── package.json              # Dependencies and scripts
├── .env                       # Configuration (create from ENV_SETUP.txt)
├── ENV_SETUP.txt             # Example environment variables
├── README.md                 # This file
│
├── src/
│   ├── index.js              # Main RAG pipeline demo
│   ├── ingest.js             # Document ingestion script
│   ├── query.js              # Interactive query mode
│   ├── test.js               # Test suite
│   │
│   ├── services/
│   │   ├── ollamaService.js  # Ollama API integration
│   │   └── vectorStore.js    # LanceDB operations
│   │
│   ├── utils/
│   │   └── textProcessing.js # Text chunking and formatting
│   │
│   └── config/
│       └── config.js         # Configuration management
│
├── data/                      # Sample documents for ingestion
│   ├── machine_learning.txt
│   ├── deep_learning.txt
│   └── nlp_guide.txt
│
└── db/                        # LanceDB vector store (auto-created)
```

## 🔄 How the RAG Pipeline Works

```
1. Document Ingestion
   ├─ Read text files from data/ directory
   └─ Split into chunks (configurable size and overlap)

2. Embedding Generation
   ├─ Send chunks to Ollama embedding model
   └─ Receive vector embeddings

3. Vector Storage
   ├─ Store embeddings and metadata in LanceDB
   └─ Create searchable index

4. Query Processing
   ├─ User submits a question
   ├─ Generate embedding for query
   └─ Search for similar chunks in LanceDB

5. Context Retrieval
   ├─ Select top-k most relevant chunks
   └─ Format as context string

6. Response Generation
   ├─ Build prompt with context and query
   ├─ Send to Ollama LLM
   └─ Return final answer
```

## 📝 Configuration

Edit `.env` to customize:

```env
# Ollama API Base URL
OLLAMA_API_BASE_URL=http://localhost:11434

# Embedding model (must be installed in Ollama)
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# LLM model for inference (must be installed in Ollama)
OLLAMA_LLM_MODEL=llama2

# Vector store location
LANCEDB_PATH=./db/lancedb

# Text chunking settings
CHUNK_SIZE=512              # Characters per chunk
CHUNK_OVERLAP=50            # Overlap between chunks

# RAG settings
TOP_K_RESULTS=5             # Number of chunks to retrieve
```

## 🎯 Available Models in Ollama

### Embedding Models
- `nomic-embed-text` (recommended) - Fast and accurate
- `all-minilm` - Smaller, faster
- `snowflake-arctic-embed` - High quality

### LLM Models
- `llama2` - Excellent general-purpose model
- `mistral` - Fast and efficient
- `neural-chat` - Optimized for conversations
- `dolphin-mixtral` - Powerful multi-task model
- `openchat` - Fast and capable

**Install models:**
```bash
ollama pull llama2
ollama pull mistral
# etc.
```

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Run the full RAG pipeline demo |
| `npm run ingest` | Ingest documents from data/ directory |
| `npm run query` | Interactive query mode |
| `npm run test` | Run system tests |
| `npm run dev` | Run with auto-reload (requires nodemon) |

## 📚 Example Usage

### Adding Custom Documents

1. Create a text file in `data/` directory:
   ```bash
   echo "Your document content here..." > data/my_document.txt
   ```

2. Ingest the documents:
   ```bash
   npm run ingest
   ```

3. Query your documents:
   ```bash
   npm run query
   # Ask: "What is the main topic of my document?"
   ```

### Programmatic Usage

```javascript
import { initializeVectorStore, addDocuments, search } from './src/services/vectorStore.js';
import { generateResponse } from './src/services/ollamaService.js';
import { buildRAGPrompt, formatContext } from './src/utils/textProcessing.js';

// Initialize
await initializeVectorStore();

// Add documents
await addDocuments([
  { id: '1', content: 'Your text here...' }
]);

// Search
const results = await search('your query', 5);

// Generate response
const context = formatContext(results);
const prompt = buildRAGPrompt('your query', context);
const response = await generateResponse(prompt);
```

## 🐛 Troubleshooting

### "Ollama is not running"
```bash
# Start Ollama in a new terminal
ollama serve
```

### "Model not found"
```bash
# Pull the required model
ollama pull llama2
ollama pull nomic-embed-text
```

### "LanceDB connection error"
```bash
# Ensure db directory has write permissions
mkdir -p db
chmod 755 db
```

### Slow responses
- Use a smaller model (e.g., `mistral` instead of `llama2`)
- Increase `CHUNK_SIZE` for faster but less precise results
- Reduce `TOP_K_RESULTS` for faster retrieval

## 🚀 Production Deployment

To deploy this RAG system:

1. **Environment Variables**: Use a proper secrets management system
2. **Database**: Consider persistent vector store backup
3. **API Layer**: Wrap with Express/Fastify for REST endpoints
4. **Scaling**: Deploy Ollama on GPU-enabled machines
5. **Monitoring**: Add logging and metrics
6. **Caching**: Implement embedding cache for repeated queries

## 📖 Learning Resources

- [Ollama Documentation](https://ollama.ai)
- [LanceDB Documentation](https://lancedb.com)
- [RAG Papers and Research](https://arxiv.org)
- [Vector Databases Guide](https://www.pinecone.io/learn/)

## 🤝 Contributing

Feel free to extend this project:
- Add more text processing features
- Implement different embedding models
- Create REST API endpoints
- Add support for PDFs and other formats
- Build a web UI

## 📄 License

MIT - Use freely for personal and commercial projects

## ⚡ Performance Tips

1. **Use GPU acceleration** - LanceDB can leverage GPU for faster searches
2. **Optimize chunk size** - Balance between granularity and context
3. **Cache embeddings** - Reuse embeddings for repeated queries
4. **Batch operations** - Process multiple documents at once
5. **Monitor resources** - Watch CPU/RAM usage during ingestion

## 🎓 Key Concepts

### Retrieval-Augmented Generation (RAG)
RAG combines the power of retrieval systems with generative models. Instead of relying solely on model parameters, RAG retrieves relevant context from a knowledge base and uses it to inform the response.

### Vector Embeddings
Embeddings are numerical representations of text in high-dimensional space. Similar texts have similar embeddings, enabling semantic search.

### LanceDB
A vector database optimized for AI workloads with fast similarity search and efficient storage.

### Ollama
A lightweight framework for running LLMs locally, providing both embedding and generation capabilities.

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Verify Ollama is running with correct models
3. Review the `.env` configuration
4. Check application logs

---

**Happy RAG-building!** 🚀
