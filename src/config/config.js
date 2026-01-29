import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  // Ollama API Configuration
  ollama: {
    baseURL: process.env.OLLAMA_API_BASE_URL || 'http://localhost:11434',
    embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text',
    llmModel: process.env.OLLAMA_LLM_MODEL || 'llama2',
  },

  // LanceDB Configuration
  lancedb: {
    dbPath: process.env.LANCEDB_PATH || './db/lancedb',
    tableName: 'documents',
  },

  // RAG Configuration
  rag: {
    chunkSize: parseInt(process.env.CHUNK_SIZE || '300'),
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '30'),
    topK: parseInt(process.env.TOP_K_RESULTS || '5'),
  },

  // Application Configuration
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};

export default config;
