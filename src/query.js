import express from 'express';
import { initializeVectorStore, search } from './services/vectorStore.js';
import { generateResponse, checkOllamaHealth } from './services/ollamaService.js';
import { buildRAGPrompt, formatContext } from './utils/textProcessing.js';
import config from './config/config.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Track initialization state
let isInitialized = false;

/**
 * Initialize the RAG system once on startup
 */
async function initializeRAG() {
  if (isInitialized) return;

  try {
    console.log('Checking Ollama connection...');
    const isHealthy = await checkOllamaHealth();
    if (!isHealthy) {
      throw new Error('Ollama is not running. Please start it with: ollama serve');
    }
    console.log('✅ Ollama is running');

    console.log('Initializing vector store...');
    await initializeVectorStore();
    console.log('✅ Vector store ready');

    isInitialized = true;
  } catch (error) {
    console.error('❌ Initialization error:', error.message);
    throw error;
  }
}

/**
 * POST /api/query
 * Query the RAG system
 * Body: { query: string }
 */
app.post('/api/query', async (req, res) => {
  const { query } = req.body;

  // Validate input
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Query must be a non-empty string',
    });
  }

  try {
    console.log(`Query: "${query}"`);

    // Search for relevant documents
    const retrievedDocs = await search(query, config.rag.topK);

    if (retrievedDocs.length === 0) {
      return res.json({
        query,
        documents: [],
        response: 'No relevant documents found for your query.',
      });
    }

    // Format context
    const context = formatContext(retrievedDocs);

    // Build prompt
    const prompt = buildRAGPrompt(query, context);

    // Generate response
    const response = await generateResponse(prompt);

    // Return results
    res.json({
      query,
      documentCount: retrievedDocs.length,
      documents: retrievedDocs.map((doc) => ({
        id: doc.id,
        content: doc.content,
        sourceDoc: doc.sourceDoc,
        score: (doc.score || 0).toFixed(3),
      })),
      response,
    });
  } catch (error) {
    console.error(`Error processing query: ${error.message}`);
    res.status(500).json({
      error: 'Query processing failed',
      message: error.message,
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    initialized: isInitialized,
  });
});

/**
 * GET /
 * API documentation
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Local RAG API',
    version: '1.0.0',
    endpoints: {
      'POST /api/query': {
        description: 'Query the RAG system',
        body: { query: 'string' },
        example: 'curl -X POST http://localhost:3000/api/query -H "Content-Type: application/json" -d \'{"query":"What is machine learning?"}\'',
      },
      'GET /health': {
        description: 'Health check',
      },
      'GET /': {
        description: 'API documentation',
      },
    },
  });
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

/**
 * Start the server
 */
async function start() {
  try {
    console.log('🚀 Starting Local RAG API Server\n');
    await initializeRAG();

    app.listen(PORT, () => {
      console.log(`\n✅ Server running at http://localhost:${PORT}`);
      console.log(`📚 API documentation at http://localhost:${PORT}/`);
      console.log(`📝 POST queries to http://localhost:${PORT}/api/query\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start if executed directly
start();
