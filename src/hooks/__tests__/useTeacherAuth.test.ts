
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useTeacherAuth } from '../useTeacherAuth';

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

describe('useTeacherAuth', () => {
  it('returns user and authentication status', () => {
    const mockUser = { id: 'user123', email: 'test@example.com' };
    
    const { useAuth } = require('@/contexts/AuthContext');
    useAuth.mockReturnValue({ user: mockUser });

    const { result } = renderHook(() => useTeacherAuth());
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('returns false for isAuthenticated when user is null', () => {
    const { useAuth } = require('@/contexts/AuthContext');
    useAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useTeacherAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
