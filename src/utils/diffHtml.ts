export const diffHtml = (original: string, personalized: string) => {
  // Strip HTML tags to get text content for comparison
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');
  
  const originalText = stripHtml(original);
  const personalizedText = stripHtml(personalized);
  
  const originalWords = originalText.split(/\s+/).filter(word => word.length > 0);
  const personalizedWords = personalizedText.split(/\s+/).filter(word => word.length > 0);
  
  // Simple diff algorithm - mark words that are different
  const diffedOriginal = originalWords.map((word, index) => {
    const isChanged = personalizedWords[index] !== word;
    return {
      word,
      isChanged
    };
  });
  
  const diffedPersonalized = personalizedWords.map((word, index) => {
    const isChanged = originalWords[index] !== word;
    return {
      word,
      isChanged
    };
  });
  
  return {
    original: diffedOriginal,
    personalized: diffedPersonalized
  };
};

export const highlightDifferences = (html: string, changedWords: string[]) => {
  let result = html;
  
  // Simple highlighting - wrap changed words in <mark> tags
  changedWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, `<mark class="bg-primary/20 px-1 rounded">${word}</mark>`);
  });
  
  return result;
};