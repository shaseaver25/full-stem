
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, GraduationCap, ArrowLeft } from 'lucide-react';
import { redirectToRoleDashboard } from '@/utils/roleRedirect';
import { supabase } from '@/integrations/supabase/client';

const TeacherAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  // Use ref to prevent multiple redirect attempts
  const hasCheckedRole = React.useRef(false);
  
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (user && !hasCheckedRole.current) {
        hasCheckedRole.current = true;
        
        // Check if user has a teacher role before redirecting
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'teacher')
          .maybeSingle();
        
        if (roleData) {
          console.log('User authenticated with teacher role, redirecting to dashboard');
          redirectToRoleDashboard(user.id, navigate);
        }
      }
    };
    
    checkAndRedirect();
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Attempting sign in with email:', email);

    const { error } = await signIn(email, password);
    
    if (error) {
      console.error('Sign in error:', error);
      setError(error.message);
      setLoading(false);
    } else {
      console.log('Sign in successful');
      
      // Check if this is first login (requires preferences setup)
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.requires_onboarding) {
        navigate('/preferences');
      } else {
        // Redirect to teacher dashboard
        navigate('/teacher/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center text-sm text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Teacher Portal</CardTitle>
            <CardDescription>
              Access your Full STEM teaching dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter your password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Sign In
              </Button>
            </form>

            {error && (
              <Alert className="mt-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mt-4 text-center text-sm text-gray-600">
              <p>Don't have an account? Contact your school administrator for an invitation.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherAuth;
