
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Brain } from 'lucide-react';
import { redirectToRoleDashboard } from '@/utils/roleRedirect';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from "@/components/ui/separator";
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

const Auth = () => {
  useGoogleAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Redirect if already logged in - but allow manual navigation to specific routes
  useEffect(() => {
    const isTeacherPortalLogin = localStorage.getItem('teacherPortalLogin') === 'true';
    
    // If teacher portal login flag is set, skip redirect logic
    if (isTeacherPortalLogin) {
      return;
    }
    
    // Only redirect if on auth page and NOT teacher portal login
    if (user && location.pathname === '/auth') {
      redirectToRoleDashboard(user.id, navigate);
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, fullName);
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        if (isLogin) {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in."
          });
        } else {
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account."
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'email profile openid https://www.googleapis.com/auth/drive.file',
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline', // Request refresh token
            prompt: 'consent', // Force consent screen to ensure all scopes are granted
          },
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate Google sign-in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <img 
              src="/lovable-uploads/3674debe-cc91-44e5-b661-71199ab7a186.png" 
              alt="Full STEM Logo" 
              className="h-16 mx-auto hover:scale-105 transition-transform duration-300 cursor-pointer mb-4"
            />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Join Full STEM'}
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to continue your learning journey' : 'Create your account to get started'}
          </p>
        </div>

        <Card className="bg-white/90 backdrop-blur-md shadow-xl border-2 border-gray-100">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              {isLogin ? 'Sign In' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    placeholder="Enter your full name"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  minLength={6}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>

            <div className="relative my-4">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
                or
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? 'Connecting...' : 'Continue with Google'}
            </Button>
            
            <div className="mt-6 text-center space-y-3">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
              
              <div className="border-t pt-3">
                <p className="text-sm text-gray-600 mb-2">Are you a student?</p>
                <Link 
                  to="/signup/student" 
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  Create a Student Account →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
