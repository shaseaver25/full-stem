export interface WordFrequency {
  text: string;
  value: number; // frequency count
  percentage: number;
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'is', 'was', 'are', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
  'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her',
  'its', 'our', 'their', 'me', 'him', 'us', 'them'
]);

interface ProcessOptions {
  removeStopWords?: boolean;
  minLength?: number;
  maxWords?: number;
}

export function processWordCloudResponses(
  responses: string[],
  options: ProcessOptions = {}
): WordFrequency[] {
  const {
    removeStopWords = true,
    minLength = 2,
    maxWords = 100,
  } = options;

  // Count word frequencies
  const wordCounts = new Map<string, number>();
  let totalWords = 0;

  responses.forEach(response => {
    if (!response || typeof response !== 'string') return;

    // Clean and split into words
    const words = response
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => {
        if (word.length < minLength) return false;
        if (removeStopWords && STOP_WORDS.has(word)) return false;
        return true;
      });

    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      totalWords++;
    });
  });

  // Convert to array and calculate percentages
  const wordFrequencies: WordFrequency[] = Array.from(wordCounts.entries())
    .map(([text, value]) => ({
      text,
      value,
      percentage: totalWords > 0 ? (value / totalWords) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, maxWords);

  return wordFrequencies;
}

export function filterInappropriateWords(words: WordFrequency[]): WordFrequency[] {
  // Basic profanity filter - extend as needed
  const inappropriateWords = new Set([
    // Add inappropriate words as needed
  ]);

  return words.filter(word => !inappropriateWords.has(word.text.toLowerCase()));
}
