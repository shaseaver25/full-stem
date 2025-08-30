import { describe, it, expect } from 'vitest';
import { synthesizeTimings, validateTimings } from '../timing';

describe('synthesizeTimings', () => {
  it('should create timings with correct length', () => {
    const tokens = ['hello', 'world', 'test'];
    const weights = [5, 5, 4];
    const duration = 10;
    
    const result = synthesizeTimings(tokens, weights, duration);
    
    expect(result).toHaveLength(tokens.length);
  });

  it('should create strictly increasing time windows', () => {
    const tokens = ['a', 'b', 'c'];
    const weights = [1, 1, 1];
    const duration = 10;
    
    const result = synthesizeTimings(tokens, weights, duration);
    
    for (let i = 1; i < result.length; i++) {
      expect(result[i].start).toBeGreaterThanOrEqual(result[i - 1].end);
    }
  });

  it('should respect total duration bounds', () => {
    const tokens = ['hello', 'world'];
    const weights = [5, 5];
    const duration = 10;
    
    const result = synthesizeTimings(tokens, weights, duration);
    
    expect(result[0].start).toBeGreaterThanOrEqual(0);
    expect(result[result.length - 1].end).toBeLessThanOrEqual(duration);
  });

  it('should distribute time proportionally to weights', () => {
    const tokens = ['short', 'verylongword'];
    const weights = [1, 4]; // Second word should get ~4x more time
    const duration = 10;
    
    const result = synthesizeTimings(tokens, weights, duration);
    const firstDuration = result[0].end - result[0].start;
    const secondDuration = result[1].end - result[1].start;
    
    expect(secondDuration).toBeGreaterThan(firstDuration * 3);
  });

  it('should handle empty arrays', () => {
    const result = synthesizeTimings([], [], 10);
    expect(result).toEqual([]);
  });

  it('should handle single token', () => {
    const result = synthesizeTimings(['hello'], [5], 10);
    
    expect(result).toHaveLength(1);
    expect(result[0].start).toBe(0);
    expect(result[0].end).toBe(10);
    expect(result[0].text).toBe('hello');
    expect(result[0].index).toBe(0);
  });
});

describe('validateTimings', () => {
  it('should validate correct timings', () => {
    const timings = [
      { start: 0, end: 2, index: 0, text: 'hello' },
      { start: 2, end: 5, index: 1, text: 'world' },
      { start: 5, end: 8, index: 2, text: 'test' }
    ];
    
    expect(validateTimings(timings, 10)).toBe(true);
  });

  it('should reject overlapping timings', () => {
    const timings = [
      { start: 0, end: 3, index: 0, text: 'hello' },
      { start: 2, end: 5, index: 1, text: 'world' } // Overlaps with previous
    ];
    
    expect(validateTimings(timings, 10)).toBe(false);
  });

  it('should reject timings starting before 0', () => {
    const timings = [
      { start: -1, end: 2, index: 0, text: 'hello' }
    ];
    
    expect(validateTimings(timings, 10)).toBe(false);
  });

  it('should reject timings ending after duration', () => {
    const timings = [
      { start: 0, end: 11, index: 0, text: 'hello' }
    ];
    
    expect(validateTimings(timings, 10)).toBe(false);
  });

  it('should handle empty timings array', () => {
    expect(validateTimings([], 10)).toBe(true);
  });
});