import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  role: 'teacher' | 'student' | 'admin' | 'developer';
  password: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  sendWelcomeEmail: boolean;
  
  // Student-specific
  gradeLevel?: string;
  studentId?: string;
  classIds?: string[];
  
  // Teacher-specific
  district?: string;
  gradeLevelsTaught?: string[];
  subjectAreas?: string[];
  licenseNumber?: string;
  
  // Admin-specific
  adminType?: 'district' | 'school' | 'super';
  organization?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  gradeLevel?: string;
  classCount?: number;
  status: string;
  createdAt: string;
}

export const useUserManagement = () => {
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get roles for each user
      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);

          // Get student-specific data if student
          let gradeLevel = null;
          let classCount = 0;
          if (roles?.some(r => r.role === 'student')) {
            const { data: studentData } = await supabase
              .from('students')
              .select('grade_level, id')
              .eq('user_id', profile.id)
              .single();

            if (studentData) {
              gradeLevel = studentData.grade_level;
              
              const { count } = await supabase
                .from('class_students')
                .select('*', { count: 'exact', head: true })
                .eq('student_id', studentData.id)
                .eq('status', 'active');
              
              classCount = count || 0;
            }
          }

          const fullName = profile.full_name || '';
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          return {
            id: profile.id,
            email: profile.email || '',
            firstName,
            lastName,
            role: roles?.[0]?.role || 'unknown',
            gradeLevel,
            classCount,
            status: 'active',
            createdAt: profile.created_at || ''
          };
        })
      );

      return usersWithRoles;
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      // Call edge function to create user with admin privileges
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: userData
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast({
        title: '✅ User Created Successfully',
        description: data.sendWelcomeEmail 
          ? `Welcome email sent to ${data.email}` 
          : `User ${data.email} has been created`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Please try again';
      const isEmailExists = errorMessage.includes('already registered') || 
                           errorMessage.includes('EMAIL_EXISTS');
      
      toast({
        title: isEmailExists ? 'Email Already Exists' : 'Failed to Create User',
        description: isEmailExists 
          ? `${errorMessage}. Check the user list below to find this user.`
          : errorMessage,
        variant: 'destructive',
      });

      // Refresh the user list to ensure it's up to date
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    }
  });

  // Get available classes for student assignment
  const { data: availableClasses } = useQuery({
    queryKey: ['availableClasses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;

      return (data || []).map((cls: any) => ({
        id: cls.id,
        name: cls.name,
        teacherName: 'Unknown Teacher'
      }));
    }
  });

  return {
    users,
    usersLoading,
    availableClasses: availableClasses || [],
    createUser: createUserMutation.mutate,
    isCreating: createUserMutation.isPending
  };
};
