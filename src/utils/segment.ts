/**
 * International word segmentation utility using Intl.Segmenter
 * Falls back to regex splitting for unsupported environments
 */

export function segmentWords(text: string, language?: string): string[] {
  try {
    // Use Intl.Segmenter for proper international word segmentation
    const segmenter = new (Intl as any).Segmenter(language, { granularity: 'word' });
    return Array.from(segmenter.segment(text))
      .map((segment: any) => segment.segment)
      .filter((word: string) => word.trim().length > 0);
  } catch {
    // Fallback for environments without Intl.Segmenter support
    return text.split(/(\s+)/).filter(token => token.trim().length > 0);
  }
}

/**
 * Calculate word weight for timing purposes
 * Strips punctuation and uses grapheme length
 */
export function calculateWordWeight(word: string): number {
  // Strip punctuation and get grapheme length
  const cleanWord = word.replace(/[^\p{L}\p{N}]/gu, '');
  return cleanWord.length || 1;
}

/**
 * Common language code mapping for BCP-47 compliance
 */
export const LANGUAGE_CODES: Record<string, string> = {
  en: 'en',
  es: 'es', 
  ar: 'ar',
  fr: 'fr',
  zh: 'zh',
  hi: 'hi',
  ja: 'ja',
  ko: 'ko',
  de: 'de',
  it: 'it',
  pt: 'pt',
  ru: 'ru'
};

/**
 * Normalize language code to BCP-47 format
 */
export function normalizeLanguageCode(language?: string): string {
  if (!language) return 'en';
  const normalized = language.toLowerCase().split('-')[0];
  return LANGUAGE_CODES[normalized] || language;
}