/**
 * Parse a user query to extract key information
 * @param {string} query - The user's query
 * @returns {Object} - Parsed information from the query
 */
function parseQuery(query) {
  // This is a simple implementation that could be expanded with NLP techniques
  const result = {
    originalQuery: query,
    keywords: [],
    categories: [],
    isQuestion: query.trim().endsWith('?'),
  };

  // Extract potential keywords (simple approach)
  const words = query.toLowerCase().split(/\s+/);
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'like',
    'from', 'of', 'how', 'what', 'why', 'when', 'where', 'who', 'which',
  ]);

  // Filter out stop words and short words
  result.keywords = words
    .filter(word => !stopWords.has(word) && word.length > 2)
    // Remove punctuation
    .map(word => word.replace(/[.,?!;:'"()]/g, ''))
    // Remove duplicates
    .filter((word, index, self) => self.indexOf(word) === index);

  // Look for potential categories (could be expanded)
  const categoryPatterns = [
    { pattern: /math|algebra|calculus|geometry|equation/i, category: 'Mathematics' },
    { pattern: /physics|force|energy|motion|gravity/i, category: 'Physics' },
    { pattern: /biology|cell|organism|gene|evolution/i, category: 'Biology' },
    { pattern: /history|war|century|ancient|civilization/i, category: 'History' },
    { pattern: /literature|book|author|novel|poem/i, category: 'Literature' },
    { pattern: /computer|algorithm|code|programming|software/i, category: 'Computer Science' },
  ];

  categoryPatterns.forEach(({ pattern, category }) => {
    if (pattern.test(query)) {
      result.categories.push(category);
    }
  });

  return result;
}

module.exports = {
  parseQuery,
};