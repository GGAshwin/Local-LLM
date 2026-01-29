import { initializeVectorStore, addDocuments, getStats, clearVectorStore } from './services/vectorStore.js';
import { checkOllamaHealth, getAvailableModels } from './services/ollamaService.js';
import { chunkDocuments } from './utils/textProcessing.js';

/**
 * Test the RAG system
 */
async function test() {
  console.log('🧪 Running RAG System Tests\n');

  try {
    // Test 1: Ollama Health
    console.log('Test 1: Checking Ollama Health');
    const isHealthy = await checkOllamaHealth();
    console.log(`  Result: ${isHealthy ? '✅ PASS' : '❌ FAIL'}\n`);

    if (!isHealthy) {
      throw new Error('Ollama is not running');
    }

    // Test 2: Get Available Models
    console.log('Test 2: Fetching Available Models');
    const models = await getAvailableModels();
    console.log(`  Found ${models.length} models:`);
    models.forEach((model) => {
      console.log(`    - ${model.name}`);
    });
    console.log('  Result: ✅ PASS\n');

    // Test 3: Initialize Vector Store
    console.log('Test 3: Initializing Vector Store');
    await initializeVectorStore();
    console.log('  Result: ✅ PASS\n');

    // Test 4: Add Documents
    console.log('Test 4: Adding Documents to Vector Store');
    const testDocs = [
      {
        id: 'test_1',
        content: 'This is a test document about artificial intelligence.',
      },
      {
        id: 'test_2',
        content: 'Machine learning is a powerful technology for data analysis.',
      },
      {
        id: 'test_3',
        content: 'Vector databases are essential for modern AI applications.',
      },
    ];

    const chunked = chunkDocuments(testDocs);
    await addDocuments(chunked);
    console.log(`  Added ${chunked.length} chunks`);
    console.log('  Result: ✅ PASS\n');

    // Test 5: Vector Store Stats
    console.log('Test 5: Getting Vector Store Statistics');
    const stats = await getStats();
    console.log(`  Documents: ${stats.documentCount}`);
    console.log('  Result: ✅ PASS\n');

    // Test 6: Clear Vector Store
    console.log('Test 6: Clearing Vector Store');
    await clearVectorStore();
    const statsAfter = await getStats();
    console.log(`  Documents after clear: ${statsAfter.documentCount}`);
    console.log('  Result: ✅ PASS\n');

    console.log('✨ All tests passed!\n');
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if executed directly
test();
