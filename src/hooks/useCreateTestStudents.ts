import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TestStudentResult {
  success: boolean;
  email: string;
  password?: string;
  fullName: string;
  readingLevel?: string;
  language?: string;
  error?: string;
}

interface CreateTestStudentsResponse {
  success: boolean;
  message: string;
  classId: string;
  className: string;
  results: TestStudentResult[];
  credentials: {
    email: string;
    password: string;
    name: string;
    readingLevel: string;
    language: string;
  }[];
}

export const useCreateTestStudents = () => {
  return useMutation({
    mutationFn: async (): Promise<CreateTestStudentsResponse> => {
      console.log('🎓 Calling create-test-students edge function...');
      
      const { data, error } = await supabase.functions.invoke('create-test-students', {
        body: {}
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(error.message || 'Failed to create test students');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to create test students');
      }

      return data;
    },
    onSuccess: (data) => {
      const successCount = data.results.filter(r => r.success).length;
      
      toast({
        title: '✅ Test Students Created',
        description: `Successfully created ${successCount} test student accounts in "${data.className}"`,
      });

      // Log credentials to console for easy access
      console.log('📋 Test Student Credentials:');
      console.table(data.credentials);
    },
    onError: (error: Error) => {
      console.error('❌ Failed to create test students:', error);
      toast({
        title: 'Failed to Create Test Students',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};