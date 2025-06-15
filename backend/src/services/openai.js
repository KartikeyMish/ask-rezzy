const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
 * Stream a completion from OpenAI
 * @param {string} query - The user's query
 * @param {Array} context - Context information from Pinecone
 * @param {Object} res - Express response object for streaming
 */
async function streamCompletion(query, context, res) {
  try {
    // Format the context for the prompt
    const formattedContext = context
      .map(item => {
        if (item.question && item.answer) {
          return `Question: ${item.question}\nAnswer: ${item.answer}`;
        } else if (item.front && item.back) {
          return `Flashcard Front: ${item.front}\nFlashcard Back: ${item.back}`;
        }
        return JSON.stringify(item);
      })
      .join('\n\n');

    // Create the system prompt
    const systemPrompt = `You are Rezzy, an AI study assistant. Use the following information to answer the user's question.
If the information provided doesn't answer the question directly, use your knowledge to provide a helpful response.
Always be educational, accurate, and concise.

Context information:
${formattedContext}`;

    // Create a streaming completion
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      stream: true,
    });

    // Process the stream
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
  } catch (error) {
    console.error('Error streaming completion:', error);
    throw error;
  }
}

module.exports = {
  generateEmbedding,
  streamCompletion,
};