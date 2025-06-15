export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface Question {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  embeddings?: number[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  tags: string[];
  embeddings?: number[];
}