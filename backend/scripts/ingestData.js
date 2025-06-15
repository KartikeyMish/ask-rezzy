require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Get the index
const index = pinecone.index('study-assistant');

/**
 * Generate an embedding for a text string
 * @param {string} text - The text to generate an embedding for
 * @returns {Promise<number[]>} - The embedding vector
 */
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Process a dataset and upsert to Pinecone
 * @param {Array} dataset - Array of questions and flashcards
 */
async function processDataset(dataset) {
  console.log(`Processing ${dataset.length} items...`);
  
  const vectors = [];
  
  for (const item of dataset) {
    try {
      // Determine if it's a question or flashcard
      const isQuestion = 'question' in item;
      
      // Generate text for embedding
      const textForEmbedding = isQuestion 
        ? `${item.question} ${item.answer}`
        : `${item.front} ${item.back}`;
      
      // Generate embedding
      const embedding = await generateEmbedding(textForEmbedding);
      
      // Create vector object
      const vector = {
        id: item.id,
        values: embedding,
        metadata: {
          ...item,
          // Remove the embedding from metadata to save space
          embedding: undefined
        }
      };
      
      vectors.push(vector);
      console.log(`Generated embedding for item ${item.id}`);
    } catch (error) {
      console.error(`Error processing item ${item.id}:`, error);
    }
  }
  
  // Upsert vectors to Pinecone
  if (vectors.length > 0) {
    try {
      const upsertResponse = await index.upsert({
        vectors,
      });
      
      console.log(`Successfully upserted ${vectors.length} vectors to Pinecone`);
      console.log('Upsert response:', upsertResponse);
    } catch (error) {
      console.error('Error upserting to Pinecone:', error);
    }
  }
}

// Main function
async function main() {
  try {
    // Read the dataset
    const datasetPath = path.join(__dirname, '../data/sample_dataset.json');
    const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
    
    // Process the dataset
    await processDataset(dataset);
    
    console.log('Data ingestion complete!');
  } catch (error) {
    console.error('Error in data ingestion:', error);
    process.exit(1);
  }
}

// Run the main function
main();