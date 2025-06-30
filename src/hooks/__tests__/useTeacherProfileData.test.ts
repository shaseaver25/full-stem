import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTeacherProfileData } from '../useTeacherProfileData';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(),
          single: vi.fn()
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      }))
    }))
  }
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

describe('useTeacherProfileData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with null profile and loading true', () => {
    const { result } = renderHook(() => useTeacherProfileData());
    
    expect(result.current.profile).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('provides fetchProfile function', () => {
    const { result } = renderHook(() => useTeacherProfileData());
    
    expect(typeof result.current.fetchProfile).toBe('function');
  });

  it('sets loading to false when no userId provided', async () => {
    const { result } = renderHook(() => useTeacherProfileData());
    
    await result.current.fetchProfile('');
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('fetches existing profile successfully', async () => {
    const mockProfile = {
      id: 'profile123',
      user_id: 'user123',
      school_name: 'Test School',
      grade_levels: ['5', '6'],
      subjects: ['Math'],
      years_experience: 5,
      certification_status: 'certified',
      pd_hours: 40,
      onboarding_completed: true,
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    };

    const { supabase } = await import('@/integrations/supabase/client');
    
    supabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: mockProfile,
            error: null
          })
        })
      })
    });

    const { result } = renderHook(() => useTeacherProfileData());
    
    await result.current.fetchProfile('user123');
    
    await waitFor(() => {
      expect(result.current.profile).toEqual(mockProfile);
      expect(result.current.loading).toBe(false);
    });
  });

  it('creates initial profile when none exists', async () => {
    const mockNewProfile = {
      id: 'newprofile123',
      user_id: 'user123',
      onboarding_completed: false,
      certification_status: 'pending',
      pd_hours: 0
    };

    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock no existing profile found
    supabase.from = vi.fn()
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      })
      // Mock profile creation
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockNewProfile,
              error: null
            })
          })
        })
      });

    const { result } = renderHook(() => useTeacherProfileData());
    
    await result.current.fetchProfile('user123');
    
    await waitFor(() => {
      expect(result.current.profile).toEqual(mockNewProfile);
    });
  });
});
