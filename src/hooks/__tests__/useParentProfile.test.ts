
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useParentProfile } from '../useParentProfile';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

// Mock toast
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('useParentProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with null parent profile', () => {
    const { result } = renderHook(() => useParentProfile());
    
    expect(result.current.parentProfile).toBeNull();
  });

  it('provides fetchParentProfile function', () => {
    const { result } = renderHook(() => useParentProfile());
    
    expect(typeof result.current.fetchParentProfile).toBe('function');
  });

  it('returns null when user is not authenticated', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    supabase.auth.getUser = vi.fn().mockResolvedValue({
      data: { user: null }
    });

    const { result } = renderHook(() => useParentProfile());
    
    const profile = await result.current.fetchParentProfile();
    expect(profile).toBeNull();
  });

  it('fetches parent profile successfully', async () => {
    const mockUser = { id: 'user123' };
    const mockProfile = { id: 'profile123' };
    
    const { supabase } = await import('@/integrations/supabase/client');
    
    supabase.auth.getUser = vi.fn().mockResolvedValue({
      data: { user: mockUser }
    });
    
    supabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockProfile,
            error: null
          })
        })
      })
    });

    const { result } = renderHook(() => useParentProfile());
    
    const profile = await result.current.fetchParentProfile();
    
    await waitFor(() => {
      expect(profile).toEqual(mockProfile);
      expect(result.current.parentProfile).toEqual(mockProfile);
    });
  });
});
