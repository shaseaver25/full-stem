
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Class {
  id: string;
  name: string;
  grade_level: string | null;
  subject: string | null;
  teacher_id: string;
  school_year: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useClasses = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching classes:', error);
        toast({
          title: "Error",
          description: "Failed to load classes.",
          variant: "destructive",
        });
        return;
      }

      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: "Failed to load classes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createClass = async (classData: {
    name: string;
    grade_level: string;
    subject: string;
    school_year?: string;
  }) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('classes')
        .insert({
          name: classData.name,
          grade_level: classData.grade_level,
          subject: classData.subject,
          teacher_id: user.id,
          school_year: classData.school_year || new Date().getFullYear().toString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating class:', error);
        toast({
          title: "Error",
          description: "Failed to create class. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Add the new class to the local state
      setClasses(prev => [data, ...prev]);
      
      toast({
        title: "Success!",
        description: "Class created successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error creating class:', error);
      toast({
        title: "Error",
        description: "Failed to create class. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [user]);

  return {
    classes,
    loading,
    createClass,
    refetch: fetchClasses,
  };
};
