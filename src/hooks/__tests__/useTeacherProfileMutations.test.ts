import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTeacherProfileMutations } from '../useTeacherProfileMutations';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn(() => ({
        // Mock upsert return
      }))
    }))
  }
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

describe('useTeacherProfileMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with saving false', () => {
    const { result } = renderHook(() => useTeacherProfileMutations());
    
    expect(result.current.saving).toBe(false);
  });

  it('provides saveProfile function', () => {
    const { result } = renderHook(() => useTeacherProfileMutations());
    
    expect(typeof result.current.saveProfile).toBe('function');
  });

  it('returns false when no userId provided', async () => {
    const { result } = renderHook(() => useTeacherProfileMutations());
    
    const success = await result.current.saveProfile('', {});
    
    expect(success).toBe(false);
  });

  it('saves profile successfully', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const { toast } = await import('@/hooks/use-toast');
    
    supabase.from = vi.fn().mockReturnValue({
      upsert: vi.fn().mockResolvedValue({
        error: null
      })
    });

    const { result } = renderHook(() => useTeacherProfileMutations());
    
    const mockOnSuccess = vi.fn();
    const profileData = { school_name: 'Test School' };
    
    const success = await result.current.saveProfile('user123', profileData, mockOnSuccess);
    
    await waitFor(() => {
      expect(success).toBe(true);
      expect(toast).toHaveBeenCalledWith({
        title: "Success",
        description: "Profile saved successfully!",
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles save errors', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const { toast } = await import('@/hooks/use-toast');
    
    supabase.from = vi.fn().mockReturnValue({
      upsert: vi.fn().mockResolvedValue({
        error: { message: 'Database error' }
      })
    });

    const { result } = renderHook(() => useTeacherProfileMutations());
    
    const success = await result.current.saveProfile('user123', {});
    
    await waitFor(() => {
      expect(success).toBe(false);
      expect(toast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to save profile.",
        variant: "destructive",
      });
    });
  });
});
