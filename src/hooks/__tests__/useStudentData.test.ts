
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStudentData } from '../useStudentData';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          // Mock return value
        }))
      }))
    }))
  }
}));

describe('useStudentData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty students array and null selected student', () => {
    const { result } = renderHook(() => useStudentData());
    
    expect(result.current.students).toEqual([]);
    expect(result.current.selectedStudent).toBeNull();
  });

  it('provides setSelectedStudent function', () => {
    const { result } = renderHook(() => useStudentData());
    
    expect(typeof result.current.setSelectedStudent).toBe('function');
  });

  it('provides fetchStudents function', () => {
    const { result } = renderHook(() => useStudentData());
    
    expect(typeof result.current.fetchStudents).toBe('function');
  });

  it('updates selected student when setSelectedStudent is called', () => {
    const { result } = renderHook(() => useStudentData());
    
    const mockStudent = {
      id: 'student1',
      first_name: 'John',
      last_name: 'Doe',
      grade_level: 'Grade 5',
      reading_level: 'Advanced',
      class_name: 'Math Class'
    };

    act(() => {
      result.current.setSelectedStudent(mockStudent);
    });

    expect(result.current.selectedStudent).toEqual(mockStudent);
  });

  it('fetches students successfully', async () => {
    const mockStudentRelationships = [
      {
        student_id: 'student1',
        students: {
          id: 'student1',
          first_name: 'John',
          last_name: 'Doe',
          grade_level: 'Grade 5',
          reading_level: 'Advanced',
          classes: { name: 'Math Class' }
        }
      }
    ];

    const { supabase } = await import('@/integrations/supabase/client');
    
    supabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: mockStudentRelationships,
          error: null
        })
      })
    });

    const { result } = renderHook(() => useStudentData());
    
    const students = await result.current.fetchStudents('parent123');
    
    expect(students).toHaveLength(1);
    expect(students[0].first_name).toBe('John');
    expect(students[0].class_name).toBe('Math Class');
  });
});
