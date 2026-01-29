import { initializeVectorStore, addDocuments, search } from './services/vectorStore.js';
import { generateResponse, checkOllamaHealth } from './services/ollamaService.js';
import { chunkDocuments, formatContext, buildRAGPrompt } from './utils/textProcessing.js';
import config from './config/config.js';

/**
 * Main RAG pipeline
 */
async function runRAG() {
  console.log('🚀 Starting Local RAG System with Ollama and LanceDB\n');

  try {
    // 1. Check Ollama health
    console.log('📋 Checking Ollama connection...');
    const isHealthy = await checkOllamaHealth();
    if (!isHealthy) {
      throw new Error(
        'Ollama is not running. Please start Ollama with: ollama serve\nThen run a model with: ollama run llama2 (or your preferred model)',
      );
    }
    console.log('✅ Ollama is running\n');

    // 2. Initialize vector store
    console.log('🗄️  Initializing LanceDB vector store...');
    await initializeVectorStore();
    console.log('✅ Vector store initialized\n');

    // 3. Sample documents - MINIMAL for demo
    const sampleDocuments = [
      { id: 'doc_1', content: 'AI or artificial engineering is a field of computer science that aims to create intelligent machines.' },
      { id: 'doc_2', content: 'ML or machine learning is a subset of AI that focuses on the development of algorithms that allow computers to learn from and make predictions based on data.' },
      { id: 'doc_3', content: 'LLM or large language models are a type of AI model designed to understand and generate human language.' },
    ];

    // 4. Chunk documents
    console.log('📄 Chunking documents...');
    const chunkedDocs = chunkDocuments(sampleDocuments);
    console.log(`✅ Created ${chunkedDocs.length} chunks from ${sampleDocuments.length} documents\n`);

    // 5. Add to vector store with batch processing
    console.log('💾 Adding documents to vector store...');
    await addDocuments(chunkedDocs, 5); // Process 5 documents at a time
    console.log();

    // 6. Example queries
    const queries = [
      'What is machine learning?',
      'Tell me about neural networks',
      'How do I use Ollama?',
    ];

    console.log('🔍 Running RAG queries:\n');
    console.log('='.repeat(80));

    for (const query of queries) {
      console.log(`\nQuery: "${query}"\n`);

      try {
        // Retrieve relevant documents
        const retrievedDocs = await search(query, config.rag.topK);

        if (retrievedDocs.length === 0) {
          console.log('No relevant documents found.\n');
          continue;
        }

        console.log(`📄 Retrieved ${retrievedDocs.length} relevant documents:`);
        retrievedDocs.forEach((doc, i) => {
          console.log(`  ${i + 1}. [${doc.metadata?.sourceDocId || 'unknown'}] (score: ${(doc.score || 0).toFixed(3)})`);
        });

        // Format context
        const context = formatContext(retrievedDocs);

        // Build prompt
        const prompt = buildRAGPrompt(query, context);

        // Generate response
        console.log('\n⏳ Generating response...\n');
        const response = await generateResponse(prompt);

        console.log(`Response:\n${response}\n`);
      } catch (queryError) {
        console.error(`Error processing query: ${queryError.message}\n`);
      }

      console.log('-'.repeat(80));
    }

    console.log('\n✨ RAG pipeline completed successfully!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
runRAG();
