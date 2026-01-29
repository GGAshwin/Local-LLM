import axios from 'axios';
import config from '../config/config.js';

const client = axios.create({
  baseURL: config.ollama.baseURL,
  timeout: 60000,
});

/**
 * Generate embeddings for text using Ollama
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} Embedding vector
 */
export async function generateEmbedding(text) {
  try {
    const response = await client.post('/api/embed', {
      model: config.ollama.embeddingModel,
      input: text,
    });

    if (response.data.embeddings && response.data.embeddings.length > 0) {
      return response.data.embeddings[0];
    }

    throw new Error('No embeddings returned from Ollama');
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} Array of embedding vectors
 */
export async function generateEmbeddings(texts) {
  try {
    // Limit batch size to prevent Ollama from running out of memory
    const maxBatchSize = 5;
    if (texts.length > maxBatchSize) {
      console.log(`  Embedding in sub-batches (${maxBatchSize} at a time)...`);
      const allEmbeddings = [];
      for (let i = 0; i < texts.length; i += maxBatchSize) {
        const subBatch = texts.slice(i, i + maxBatchSize);
        const response = await client.post('/api/embed', {
          model: config.ollama.embeddingModel,
          input: subBatch,
        });
        if (response.data.embeddings && Array.isArray(response.data.embeddings)) {
          allEmbeddings.push(...response.data.embeddings);
        }
        // Small delay between batches
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return allEmbeddings;
    }

    const response = await client.post('/api/embed', {
      model: config.ollama.embeddingModel,
      input: texts,
    });

    if (response.data.embeddings && Array.isArray(response.data.embeddings)) {
      return response.data.embeddings;
    }

    throw new Error('No embeddings returned from Ollama');
  } catch (error) {
    console.error('Error generating embeddings:', error.message);
    throw error;
  }
}

/**
 * Generate text using the local LLM
 * @param {string} prompt - The prompt to send to the LLM
 * @returns {Promise<string>} Generated text response
 */
export async function generateResponse(prompt) {
  try {
    const response = await client.post('/api/generate', {
      model: config.ollama.llmModel,
      prompt: prompt,
      stream: false,
    });

    if (response.data.response) {
      return response.data.response.trim();
    }

    throw new Error('No response generated from Ollama');
  } catch (error) {
    console.error('Error generating response:', error.message);
    throw error;
  }
}

/**
 * Check if Ollama is running
 * @returns {Promise<boolean>} True if Ollama is accessible
 */
export async function checkOllamaHealth() {
  try {
    const response = await client.get('/api/tags');
    return response.status === 200;
  } catch (error) {
    console.error('Ollama health check failed:', error.message);
    return false;
  }
}

/**
 * Get list of available models from Ollama
 * @returns {Promise<Array>} List of available models
 */
export async function getAvailableModels() {
  try {
    const response = await client.get('/api/tags');
    return response.data.models || [];
  } catch (error) {
    console.error('Error fetching models:', error.message);
    return [];
  }
}

export default {
  generateEmbedding,
  generateEmbeddings,
  generateResponse,
  checkOllamaHealth,
  getAvailableModels,
};
