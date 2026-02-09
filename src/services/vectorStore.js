import lancedb from '@lancedb/lancedb';
import config from '../config/config.js';
import { generateEmbedding, generateEmbeddings } from './ollamaService.js';

let db = null;
let table = null;

/**
 * Initialize the vector store (LanceDB)
 * @returns {Promise<void>}
 */
export async function initializeVectorStore() {
  try {
    db = await lancedb.connect(config.lancedb.dbPath);
    console.log(`Connected to LanceDB at ${config.lancedb.dbPath}`);
  } catch (error) {
    console.error('Error initializing LanceDB:', error.message);
    throw error;
  }
}

/**
 * Get or create the documents table
 * @returns {Promise<any>} LanceDB table
 */
async function getTable() {
  if (!db) {
    throw new Error('Vector store not initialized. Call initializeVectorStore first.');
  }

  if (!table) {
    try {
      // Try to open existing table
      table = await db.openTable(config.lancedb.tableName);
    } catch {
      // Table doesn't exist yet, will be created on first insert
    }
  }

  return table;
}

/**
 * Add documents to the vector store with batch processing
 * @param {Array} documents - Array of documents with 'id', 'content', and optional metadata
 * @param {number} batchSize - Number of documents to process at once (default: 10)
 * @returns {Promise<void>}
 */
export async function addDocuments(documents, batchSize = 10) {
  try {
    console.log(`Adding ${documents.length} documents to vector store (batch size: ${batchSize})...`);

    let totalProcessed = 0;

    // Process documents in batches to avoid memory issues
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      console.log(`  Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)}...`);

      // Extract texts for this batch
      const texts = batch.map((doc) => doc.content);

      // Generate embeddings for this batch
      const embeddings = await generateEmbeddings(texts);

      // Prepare data for LanceDB
      const data = batch.map((doc, index) => ({
        id: doc.id,
        content: doc.content,
        sourceDoc: doc.sourceDoc || '',
        vector: embeddings[index],
      }));

      // Create or append to table
      if (!table) {
        table = await db.createTable(config.lancedb.tableName, data, {
          mode: 'overwrite',
        });
        console.log(`  Created new table: ${config.lancedb.tableName}`);
      } else {
        await table.add(data);
      }

      totalProcessed += batch.length;

      // Allow garbage collection between batches
      if (i + batchSize < documents.length) {
        await new Promise((resolve) => setImmediate(resolve));
      }
    }

    console.log(`✅ Successfully added ${totalProcessed} documents to vector store`);
  } catch (error) {
    console.error('Error adding documents:', error.message);
    throw error;
  }
}

/**
 * Search for similar documents
 * @param {string} query - Query text
 * @param {number} k - Number of results to return
 * @returns {Promise<Array>} Array of similar documents with scores
 */
export async function search(query, k = config.rag.topK) {
  try {
    table = await getTable();
    if (!table) {
      throw new Error('No documents in vector store. Please ingest documents first.');
    }

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // Search using LanceDB vectorSearch API
    const results = await table
      .vectorSearch(queryEmbedding)
      .column('vector')
      .nprobes(20)
      .limit(k)
      .toArray();

    const formattedResults = results.map((result) => ({
      id: result.id,
      content: result.content,
      sourceDoc: result.sourceDoc,
      score: result._distance !== undefined ? 1 - result._distance : null,
    }));

    console.log("Formatted search results:");
    console.log(formattedResults);

    return formattedResults;
  } catch (error) {
    console.error('Error searching documents:', error.message);
    throw error;
  }
}

/**
 * Get all documents from the vector store
 * @returns {Promise<Array>} Array of all documents
 */
export async function getAllDocuments() {
  try {
    table = await getTable();
    if (!table) {
      return [];
    }

    const results = await table.vectorSearch([]).toList();
    return results;
  } catch (error) {
    console.error('Error retrieving documents:', error.message);
    throw error;
  }
}

/**
 * Clear the vector store
 * @returns {Promise<void>}
 */
export async function clearVectorStore() {
  try {
    if (db && table) {
      await db.dropTable(config.lancedb.tableName);
      table = null;
      console.log(`Dropped table: ${config.lancedb.tableName}`);
    }
  } catch (error) {
    console.error('Error clearing vector store:', error.message);
    throw error;
  }
}

/**
 * Get vector store statistics
 * @returns {Promise<Object>} Statistics about the vector store
 */
export async function getStats() {
  try {
    table = await getTable();
    if (!table) {
      return { documentCount: 0 };
    }

    const documents = await table.search().toList();
    return {
      documentCount: documents.length,
      tableName: config.lancedb.tableName,
    };
  } catch (error) {
    console.error('Error getting stats:', error.message);
    return { error: error.message };
  }
}

export default {
  initializeVectorStore,
  addDocuments,
  search,
  getAllDocuments,
  clearVectorStore,
  getStats,
};
