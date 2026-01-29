import readline from 'readline';
import { initializeVectorStore, search } from './services/vectorStore.js';
import { generateResponse, checkOllamaHealth } from './services/ollamaService.js';
import { buildRAGPrompt, formatContext } from './utils/textProcessing.js';
import config from './config/config.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Interactive query mode
 */
async function queryMode() {
  console.log('🔍 RAG Query Mode\n');

  try {
    // Check Ollama
    console.log('Checking Ollama connection...');
    const isHealthy = await checkOllamaHealth();
    if (!isHealthy) {
      throw new Error('Ollama is not running. Please start it with: ollama serve');
    }
    console.log('✅ Ollama is running\n');

    // Initialize vector store
    console.log('Initializing vector store...');
    await initializeVectorStore();
    console.log('✅ Vector store ready\n');

    console.log('Ask questions about your documents (type "exit" to quit):\n');

    while (true) {
      const query = await prompt('Query: ');

      if (query.toLowerCase() === 'exit') {
        console.log('\nGoodbye!');
        rl.close();
        break;
      }

      if (!query.trim()) {
        console.log('Please enter a valid query.\n');
        continue;
      }

      try {
        console.log('\n⏳ Searching documents...');
        const retrievedDocs = await search(query, config.rag.topK);

        if (retrievedDocs.length === 0) {
          console.log('No relevant documents found.\n');
          continue;
        }

        console.log(`Found ${retrievedDocs.length} relevant documents\n`);

        // Show retrieved documents
        console.log('📄 Retrieved Documents:');
        retrievedDocs.forEach((doc, index) => {
          console.log(
            `  ${index + 1}. [${doc.metadata?.sourceDocId || 'unknown'}] Score: ${(doc.score || 0).toFixed(3)}`,
          );
        });
        console.log();

        // Format context
        const context = formatContext(retrievedDocs);

        // Build prompt
        const prompt = buildRAGPrompt(query, context);

        // Generate response
        console.log('⏳ Generating response...\n');
        const response = await generateResponse(prompt);

        console.log(`Response:\n${response}\n`);
        console.log('-'.repeat(80) + '\n');
      } catch (error) {
        console.error(`Error: ${error.message}\n`);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Run if executed directly
queryMode();
