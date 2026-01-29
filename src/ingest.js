import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeVectorStore, addDocuments } from './services/vectorStore.js';
import { chunkDocuments } from './utils/textProcessing.js';
import { generateDocumentId, cleanText } from './utils/textProcessing.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Ingest documents from the data directory
 */
async function ingestDocuments() {
  console.log('📚 Document Ingestion Script\n');

  try {
    // Initialize vector store
    console.log('🗄️  Initializing vector store...');
    await initializeVectorStore();
    console.log('✅ Vector store initialized\n');

    // Read documents from data directory
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      console.log('📁 Creating data directory...');
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const files = fs.readdirSync(dataDir).filter((file) => file.endsWith('.txt'));

    if (files.length === 0) {
      console.log('⚠️  No .txt files found in data directory');
      console.log('To ingest documents:');
      console.log('1. Add .txt files to the data/ directory');
      console.log('2. Run: npm run ingest\n');
      return;
    }

    // Process files
    const documents = files.map((file) => {
      const filePath = path.join(dataDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      return {
        id: generateDocumentId(file),
        title: file.replace('.txt', ''),
        content: cleanText(content),
        source: file,
      };
    });

    console.log(`📄 Found ${documents.length} documents to ingest:\n`);
    documents.forEach((doc) => {
      console.log(`  - ${doc.source} (${doc.content.length} characters)`);
    });
    console.log();

    // Chunk documents
    console.log('✂️  Chunking documents...');
    const chunkedDocs = chunkDocuments(documents);
    console.log(`✅ Created ${chunkedDocs.length} chunks\n`);

    // Add to vector store
    console.log('💾 Adding to vector store...');
    await addDocuments(chunkedDocs);
    console.log('✅ Ingestion completed successfully!\n');
  } catch (error) {
    console.error('❌ Error during ingestion:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
ingestDocuments();
