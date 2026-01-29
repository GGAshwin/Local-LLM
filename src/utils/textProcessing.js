import config from '../config/config.js';

/**
 * Split text into chunks using regex match (avoids substring memory leak)
 * @param {string} text - Text to chunk
 * @param {number} chunkSize - Size of each chunk
 * @param {number} overlap - Overlap between chunks
 * @returns {string[]} Array of text chunks
 */
export function chunkText(text, chunkSize = 300, overlap = 30) {
  if (!text || typeof text !== 'string' || text.length === 0) {
    return [];
  }

  // Use regex to extract chunks - much more efficient than substring loops
  // This pattern matches any chunkSize characters, non-greedy to avoid memory buildup
  const pattern = new RegExp(`.{1,${chunkSize}}`, 'g');
  const matches = text.match(pattern) || [];
  
  if (overlap === 0 || matches.length === 1) {
    return matches;
  }

  // For overlapping chunks, manually handle without substring
  const chunks = [];
  const textArray = Array.from(text); // Convert to array once
  
  for (let i = 0; i < textArray.length; i += (chunkSize - overlap)) {
    const end = Math.min(i + chunkSize, textArray.length);
    const chunk = textArray.slice(i, end).join('');
    
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    
    if (end === textArray.length) break;
  }

  return chunks.length > 0 ? chunks : matches;
}

/**
 * Split multiple documents into chunks (ultra-lightweight)
 * @param {Array} documents - Array of documents with 'id' and 'content'
 * @returns {Array} Array of chunked documents
 */
export function chunkDocuments(documents) {
  const result = [];

  for (const doc of documents) {
    const chunks = chunkText(doc.content);
    
    for (let i = 0; i < chunks.length; i++) {
      result.push({
        id: doc.id + '_' + i,
        content: chunks[i],
        sourceDoc: doc.id,
        chunkIdx: i,
      });
    }
  }

  return result;
}

/**
 * Combine retrieved documents for RAG context
 * @param {Array} retrievedDocs - Retrieved documents from vector store
 * @returns {string} Formatted context string
 */
export function formatContext(retrievedDocs) {
  return retrievedDocs
    .map(
      (doc, index) =>
        `[Document ${index + 1}]\n${doc.content}\n[Source: ${doc.sourceDoc || 'unknown'}]`,
    )
    .join('\n\n');
}

/**
 * Build a prompt for RAG
 * @param {string} query - User query
 * @param {string} context - Retrieved context
 * @returns {string} Formatted prompt for the LLM
 */
export function buildRAGPrompt(query, context) {
  return `You are a helpful assistant. Use the following context to answer the user's question. If you don't know the answer based on the context, say so.

Context:
${context}

Question: ${query}

Answer:`;
}

/**
 * Clean text for better processing
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text
 */
export function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

/**
 * Generate a unique ID for a document
 * @param {string} filename - Filename or title
 * @returns {string} Generated ID
 */
export function generateDocumentId(filename) {
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default {
  chunkText,
  chunkDocuments,
  formatContext,
  buildRAGPrompt,
  cleanText,
  generateDocumentId,
};
