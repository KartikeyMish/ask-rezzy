import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, Question } from '../types/types';
import { queryAPI } from '../api/api';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      content: "Hi! I'm Rezzy, your AI study assistant. How can I help you today?",
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [relatedQuestions, setRelatedQuestions] = useState<Question[]>([]);
  const [currentStream, setCurrentStream] = useState<EventSource | null>(null);

  // Clean up any existing stream when component unmounts
  useEffect(() => {
    return () => {
      if (currentStream) {
        currentStream.close();
      }
    };
  }, [currentStream]);

  const sendMessage = useCallback(async (content: string) => {
    // Don't send empty messages
    if (!content.trim()) return;

    // Add user message to the chat
    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Set loading state
    setIsLoading(true);
    
    // Close any existing stream
    if (currentStream) {
      currentStream.close();
    }

    try {
      // Create a placeholder for the assistant's response
      const assistantMessageId = uuidv4();
      setMessages(prev => [
        ...prev,
        {
          id: assistantMessageId,
          content: '',
          role: 'assistant',
          timestamp: new Date(),
        },
      ]);

      // Query the API
      const { stream, relatedQuestions: relatedQuestionsPromise } = await queryAPI(content);
      setCurrentStream(stream);

      // Initialize the assistant's response content
      let responseContent = '';

      // Listen for message chunks
      stream.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          responseContent += data.content || '';
          
          // Update the assistant's message with the accumulated content
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: responseContent } 
                : msg
            )
          );
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      // Listen for the end of the stream
      stream.addEventListener('end', () => {
        setIsLoading(false);
        stream.close();
      });

      // Listen for errors
      stream.addEventListener('error', (error) => {
        console.error('Stream error:', error);
        setIsLoading(false);
        stream.close();
      });

      // Get related questions
      const questions = await relatedQuestionsPromise;
      setRelatedQuestions(questions);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      
      // Add an error message
      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          content: 'Sorry, there was an error processing your request. Please try again.',
          role: 'assistant',
          timestamp: new Date(),
        },
      ]);
    }
  }, [currentStream]);

  return {
    messages,
    isLoading,
    sendMessage,
    relatedQuestions,
  };
};