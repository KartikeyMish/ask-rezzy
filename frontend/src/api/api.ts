import { EventSourcePolyfill } from 'event-source-polyfill';
import { Question } from '../types/types';

// Base URL for the API
const API_BASE_URL = 'http://localhost:3000';

// Function to query the API with a question
export const queryAPI = async (query: string): Promise<{
  stream: EventSource;
  relatedQuestions: Promise<Question[]>;
}> => {
  // Create a new EventSource for streaming responses
  const eventSource = new EventSourcePolyfill(`${API_BASE_URL}/api/query?q=${encodeURIComponent(query)}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Create a promise that will resolve with related questions
  const relatedQuestionsPromise = new Promise<Question[]>((resolve) => {
    eventSource.addEventListener('related', (event) => {
      try {
        const data = JSON.parse(event.data);
        resolve(data.questions || []);
      } catch (error) {
        console.error('Error parsing related questions:', error);
        resolve([]);
      }
    });
  });

  return {
    stream: eventSource,
    relatedQuestions: relatedQuestionsPromise,
  };
};

// Function to fetch all available questions
export const fetchQuestions = async (): Promise<Question[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/questions`);
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
};