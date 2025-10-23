import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StudentSignupFormData } from './studentSignupSchema';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { redirectToRoleDashboard } from '@/utils/roleRedirect';

interface SignupError {
  message: string;
  code?: string;
}

export const useStudentSignup = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: StudentSignupFormData) => {
      const redirectUrl = `${window.location.origin}/`;

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            grade_level: data.gradeLevel,
            preferred_language: data.preferredLanguage,
            role: 'student'
          }
        }
      });

      if (error) {
        throw error;
      }

      return authData;
    },
    onSuccess: (data) => {
      toast({
        title: 'Welcome to TailorEDU!',
        description: 'Your account has been created. Check your email to verify your address.',
        variant: 'default'
      });

      // Check if email confirmation is required
      if (data.user && !data.session) {
        toast({
          title: 'Verify your email',
          description: 'Please check your inbox and click the verification link to activate your account.',
          variant: 'default'
        });
      }

      // Redirect after a short delay to allow toast to display
      setTimeout(() => {
        // Check teacher portal flag before redirecting
        const isTeacherPortalLogin = sessionStorage.getItem('teacherPortalLogin') === 'true';
        if (isTeacherPortalLogin) {
          navigate('/teacher/dashboard');
        } else if (data.user) {
          redirectToRoleDashboard(data.user.id, navigate);
        } else {
          navigate('/dashboard/student');
        }
      }, 2000);
    },
    onError: (error: SignupError) => {
      console.error('Signup error:', error);

      let errorMessage = 'An error occurred during signup. Please try again.';

      if (error.code === 'user_already_exists' || error.message?.includes('already registered')) {
        errorMessage = 'This email is already registered. Please use a different email or try logging in.';
      } else if (error.code === 'email_exists') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'weak_password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Signup Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });
};
