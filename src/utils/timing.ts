import { WordTiming } from '@/types/tts';

/**
 * Synthesize word timings based on token weights and total duration
 * Creates evenly distributed timing windows proportional to word weights
 */
export function synthesizeTimings(
  tokens: string[], 
  weights: number[], 
  duration: number
): WordTiming[] {
  const total = Math.max(1, weights.reduce((a, b) => a + b, 0));
  const out: WordTiming[] = [];
  let acc = 0;
  
  for (let i = 0; i < tokens.length; i++) {
    const start = (acc / total) * duration;
    acc += weights[i] || 1;
    const end = (acc / total) * duration;
    
    out.push({ 
      start, 
      end, 
      index: i, 
      text: tokens[i] 
    });
  }
  
  return out;
}

/**
 * Validate that timings are strictly increasing and within bounds
 */
export function validateTimings(timings: WordTiming[], duration: number): boolean {
  if (timings.length === 0) return true;
  
  // Check first timing starts at or after 0
  if (timings[0].start < 0) return false;
  
  // Check last timing ends at or before duration
  if (timings[timings.length - 1].end > duration) return false;
  
  // Check all timings are strictly increasing
  for (let i = 1; i < timings.length; i++) {
    if (timings[i].start < timings[i - 1].end) return false;
  }
  
  return true;
}