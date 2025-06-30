
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStudentProgress } from '../useStudentProgress';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            // Mock resolved value
          }))
        }))
      }))
    }))
  }
}));

describe('useStudentProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty progress array', () => {
    const { result } = renderHook(() => useStudentProgress());
    
    expect(result.current.progress).toEqual([]);
  });

  it('provides fetchStudentProgress function', () => {
    const { result } = renderHook(() => useStudentProgress());
    
    expect(typeof result.current.fetchStudentProgress).toBe('function');
  });

  it('fetches student progress successfully', async () => {
    const mockProgressData = [
      {
        lesson_id: 1,
        status: 'completed',
        progress_percentage: 100,
        completed_at: '2023-01-01',
        time_spent: 1800,
        Lessons: { Title: 'Introduction to Math' }
      }
    ];

    const { supabase } = await import('@/integrations/supabase/client');
    
    supabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockProgressData,
            error: null
          })
        })
      })
    });

    const { result } = renderHook(() => useStudentProgress());
    
    const progress = await result.current.fetchStudentProgress('student123');
    
    expect(progress).toHaveLength(1);
    expect(progress[0].lesson_title).toBe('Introduction to Math');
    expect(progress[0].status).toBe('completed');
    expect(progress[0].progress_percentage).toBe(100);
  });

  it('handles errors gracefully', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    supabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockRejectedValue(new Error('Database error'))
        })
      })
    });

    const { result } = renderHook(() => useStudentProgress());
    
    const progress = await result.current.fetchStudentProgress('student123');
    
    expect(progress).toEqual([]);
  });
});
