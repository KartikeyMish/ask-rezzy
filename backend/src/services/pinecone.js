const { Pinecone } = require('@pinecone-database/pinecone');

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Get the index
const index = pinecone.index('study-assistant');

/**
 * Query Pinecone for similar vectors
 * @param {number[]} embedding - The embedding vector to query with
 * @param {number} topK - Number of results to return
 * @returns {Promise<Array>} - Array of similar questions/flashcards
 */
async function queryPinecone(embedding, topK = 3) {
  try {
    // Query the index
    const queryResponse = await index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
    });

    // Extract and return the matches
    return queryResponse.matches.map(match => ({
      id: match.id,
      ...match.metadata,
      score: match.score,
    }));
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    throw error;
  }
}

/**
 * Upsert vectors to Pinecone
 * @param {Array} vectors - Array of vectors to upsert
 * @returns {Promise<Object>} - Upsert response
 */
async function upsertToPinecone(vectors) {
  try {
    // Upsert to the index
    const upsertResponse = await index.upsert({
      vectors,
    });

    return upsertResponse;
  } catch (error) {
    console.error('Error upserting to Pinecone:', error);
    throw error;
  }
}

module.exports = {
  queryPinecone,
  upsertToPinecone,
};