import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Question, Flashcard } from '../types/types';

interface QuestionCardProps {
  item: Question | Flashcard;
  onPress?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ item, onPress }) => {
  // Determine if the item is a Question or Flashcard
  const isQuestion = 'question' in item;
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {isQuestion ? (item as Question).question : (item as Flashcard).front}
        </Text>
      </View>
      
      <View style={styles.body}>
        <Text style={styles.content}>
          {isQuestion ? (item as Question).answer : (item as Flashcard).back}
        </Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.category}>{item.category}</Text>
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  body: {
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
});