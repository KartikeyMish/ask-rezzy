const express = require('express');
const router = express.Router();
const { queryPinecone } = require('../services/pinecone');
const { generateEmbedding, streamCompletion } = require('../services/openai');
const { createSSEResponse } = require('../services/stream');
const { parseQuery } = require('../utils/parseQuery');

// Endpoint for querying with semantic search
router.get('/query', async (req, res) => {
  const query = req.query.q;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    // Set up SSE response
    createSSEResponse(res);

    // Parse the query to extract key information
    const parsedQuery = parseQuery(query);
    
    // Generate embedding for the query
    const embedding = await generateEmbedding(query);
    
    // Search Pinecone for similar questions
    const results = await queryPinecone(embedding, 5);
    
    // Send related questions to the client
    res.write(`event: related\ndata: ${JSON.stringify({ questions: results })}\n\n`);
    
    // Stream the completion from OpenAI
    await streamCompletion(query, results, res);
    
    // End the stream
    res.write('event: end\ndata: {}\n\n');
  } catch (error) {
    console.error('Error processing query:', error);
    
    // If headers haven't been sent yet, send a regular error response
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Error processing query' });
    }
    
    // Otherwise, send an error event
    res.write(`event: error\ndata: ${JSON.stringify({ error: 'Error processing query' })}\n\n`);
    res.write('event: end\ndata: {}\n\n');
  }
});

// Endpoint to get all questions
router.get('/questions', async (req, res) => {
  try {
    // In a real implementation, this would fetch from Pinecone or another database
    // For now, we'll return a placeholder response
    res.json([
      {
        id: '1',
        question: 'What is vector search?',
        answer: 'Vector search is a technique that converts text to numerical vectors and finds similar items by measuring vector distances.',
        category: 'Technology',
        tags: ['search', 'vectors', 'similarity']
      },
      {
        id: '2',
        question: 'How does Pinecone work?',
        answer: 'Pinecone is a vector database that stores embeddings and allows for efficient similarity search at scale.',
        category: 'Technology',
        tags: ['database', 'vectors', 'search']
      }
    ]);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Error fetching questions' });
  }
});

module.exports = router;