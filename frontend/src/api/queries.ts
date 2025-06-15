import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchQuestions } from './api';
import { Question } from '../types/types';

// Hook to fetch all questions
export const useQuestions = () => {
  return useQuery<Question[], Error>({
    queryKey: ['questions'],
    queryFn: fetchQuestions,
  });
};

// Hook to search questions by category
export const useQuestionsByCategory = (category: string) => {
  return useQuery<Question[], Error>({
    queryKey: ['questions', 'category', category],
    queryFn: async () => {
      const questions = await fetchQuestions();
      return questions.filter(q => q.category.toLowerCase() === category.toLowerCase());
    },
    enabled: !!category,
  });
};

// Hook to search questions by tag
export const useQuestionsByTag = (tag: string) => {
  return useQuery<Question[], Error>({
    queryKey: ['questions', 'tag', tag],
    queryFn: async () => {
      const questions = await fetchQuestions();
      return questions.filter(q => q.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
    },
    enabled: !!tag,
  });
};