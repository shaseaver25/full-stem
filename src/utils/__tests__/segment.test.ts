import { describe, it, expect } from 'vitest';
import { segmentWords, calculateWordWeight, normalizeLanguageCode } from '../segment';

describe('segmentWords', () => {
  it('should handle English text with spaces', () => {
    const result = segmentWords('Hello world test');
    expect(result).toEqual(['Hello', 'world', 'test']);
  });

  it('should handle punctuation correctly', () => {
    const result = segmentWords('Hello, world! How are you?');
    expect(result.length).toBeGreaterThan(0);
    expect(result.join(' ').replace(/\s+/g, ' ')).toContain('Hello');
  });

  it('should handle empty and whitespace-only strings', () => {
    expect(segmentWords('')).toEqual([]);
    expect(segmentWords('   ')).toEqual([]);
    expect(segmentWords('\n\t')).toEqual([]);
  });

  it('should handle Chinese characters (fallback)', () => {
    const result = segmentWords('你好世界');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle mixed language content', () => {
    const result = segmentWords('Hello 世界 مرحبا');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('calculateWordWeight', () => {
  it('should calculate weight based on grapheme length', () => {
    expect(calculateWordWeight('hello')).toBe(5);
    expect(calculateWordWeight('test')).toBe(4);
  });

  it('should strip punctuation', () => {
    expect(calculateWordWeight('hello!')).toBe(5);
    expect(calculateWordWeight('test,')).toBe(4);
    expect(calculateWordWeight('hello-world')).toBe(10);
  });

  it('should return minimum weight of 1', () => {
    expect(calculateWordWeight('')).toBe(1);
    expect(calculateWordWeight('!')).toBe(1);
    expect(calculateWordWeight('...')).toBe(1);
  });

  it('should handle unicode characters', () => {
    expect(calculateWordWeight('café')).toBe(4);
    expect(calculateWordWeight('naïve')).toBe(5);
  });
});

describe('normalizeLanguageCode', () => {
  it('should return known language codes', () => {
    expect(normalizeLanguageCode('en')).toBe('en');
    expect(normalizeLanguageCode('es')).toBe('es');
    expect(normalizeLanguageCode('ar')).toBe('ar');
  });

  it('should handle complex language codes', () => {
    expect(normalizeLanguageCode('en-US')).toBe('en');
    expect(normalizeLanguageCode('zh-Hans')).toBe('zh');
  });

  it('should pass through unknown codes', () => {
    expect(normalizeLanguageCode('unknown')).toBe('unknown');
  });

  it('should default to en for undefined/null', () => {
    expect(normalizeLanguageCode()).toBe('en');
    expect(normalizeLanguageCode('')).toBe('en');
  });
});