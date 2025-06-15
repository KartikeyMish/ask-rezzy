# Ask Rezzy Design Document

## Problem Statement

Ask Rezzy is an AI-powered study assistant that helps students find answers to their questions by searching through their study materials. The application needs to:

1. Allow users to ask questions in natural language
2. Search through a dataset of study materials to find relevant information
3. Provide accurate and helpful answers based on the retrieved information
4. Present related questions that might be of interest to the user
5. Deliver responses in a streaming fashion for better user experience

## Architecture Overview

Ask Rezzy follows a client-server architecture with the following components:

1. **Frontend**: A React Native mobile application built with Expo
2. **Backend**: A Node.js Express server that handles API requests
3. **Vector Database**: Pinecone for storing and searching vector embeddings
4. **AI Service**: OpenAI for generating embeddings and completions

The application flow is as follows:

1. User submits a question through the frontend
2. Backend converts the question to a vector embedding using OpenAI
3. Backend searches Pinecone for similar questions/flashcards
4. Backend streams a response from OpenAI that incorporates the retrieved information
5. Frontend displays the streaming response and related questions

## Vector Search Implementation

Vector search is implemented using the following approach:

1. **Data Preparation**:
   - Study materials (questions and flashcards) are processed into a format suitable for embedding
   - OpenAI's text-embedding-ada-002 model generates embeddings for each item
   - Embeddings and metadata are stored in Pinecone

2. **Query Processing**:
   - User queries are parsed to extract key information
   - Queries are converted to embeddings using the same model
   - Pinecone's similarity search finds the most relevant items
   - Retrieved items are used as context for generating responses

3. **Relevance Ranking**:
   - Items are ranked by cosine similarity to the query embedding
   - Top-k results are returned based on this ranking

## Data Model

The application uses the following data models:

1. **Question**:
   ```typescript
   interface Question {
     id: string;
     question: string;
     answer: string;
     category: string;
     tags: string[];
     embeddings?: number[];
   }
   ```

2. **Flashcard**:
   ```typescript
   interface Flashcard {
     id: string;
     front: string;
     back: string;
     category: string;
     tags: string[];
     embeddings?: number[];
   }
   ```

3. **Message**:
   ```typescript
   interface Message {
     id: string;
     content: string;
     role: 'user' | 'assistant';
     timestamp: Date;
   }
   ```

## Streaming Implementation

The application implements streaming responses using Server-Sent Events (SSE):

1. **Backend**:
   - Sets appropriate headers for SSE
   - Streams chunks of the response as they are generated
   - Sends related questions as a separate event
   - Implements heartbeat to keep the connection alive

2. **Frontend**:
   - Uses EventSource (with polyfill for React Native) to connect to the streaming endpoint
   - Updates the UI in real-time as chunks arrive
   - Handles connection errors and reconnection

## Component Breakdown

### Frontend Components

1. **ChatMessage**: Renders individual messages in the chat
2. **TypingIndicator**: Shows when the AI is generating a response
3. **QuestionCard**: Displays questions or flashcards
4. **HomeScreen**: Welcome screen with app introduction
5. **ChatScreen**: Main chat interface
6. **useChat**: Custom hook for managing chat state and API communication

### Backend Components

1. **API Routes**: Express routes for handling requests
2. **Pinecone Service**: Handles vector search operations
3. **OpenAI Service**: Manages embedding generation and completions
4. **Stream Service**: Implements SSE for streaming responses
5. **Parse Query Utility**: Extracts key information from user queries

## Limitations and Future Improvements

1. **Scalability**:
   - Current implementation is suitable for moderate-sized datasets
   - For larger datasets, consider implementing batching and caching

2. **Performance**:
   - Vector search performance depends on Pinecone's capabilities
   - Consider implementing client-side caching for frequently asked questions

3. **Features**:
   - Add user authentication for personalized experiences
   - Implement history tracking to remember past conversations
   - Add support for uploading custom study materials
   - Implement offline mode with local storage

4. **UX Improvements**:
   - Add voice input for questions
   - Implement text-to-speech for answers
   - Add support for images and diagrams in responses