import { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useClassEnrollment } from '@/hooks/useClassEnrollment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, CheckCircle2, Loader2 } from 'lucide-react';

const enrollmentSchema = z.object({
  classCode: z
    .string()
    .min(4, 'Class code must be at least 4 characters')
    .max(10, 'Class code must be at most 10 characters')
    .transform((val) => val.toUpperCase().trim())
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

export default function JoinClassPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const enrollment = useClassEnrollment();
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [enrolledClassName, setEnrolledClassName] = useState('');

  const form = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      classCode: ''
    }
  });

  // Redirect to dashboard after successful enrollment
  useEffect(() => {
    if (enrollmentSuccess) {
      const timer = setTimeout(() => {
        navigate('/dashboard/student');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [enrollmentSuccess, navigate]);

  const onSubmit = async (data: EnrollmentFormData) => {
    if (!data.classCode) return;
    
    const result = await enrollment.mutateAsync({ classCode: data.classCode });
    
    if (result.success && result.classTitle) {
      setEnrollmentSuccess(true);
      setEnrolledClassName(result.classTitle);
      form.reset();
    }
  };

  // Auth protection
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-background">
      <div className="w-full max-w-2xl space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-primary/10">
                <GraduationCap className="w-12 h-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl text-center">Join a Class</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">
              Enter the class code provided by your teacher to join their class
            </p>

            {enrollmentSuccess ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="ml-2 text-green-800">
                  <strong>🎉 Success!</strong> You've joined {enrolledClassName}!
                  <br />
                  <span className="text-sm">Redirecting to your dashboard...</span>
                </AlertDescription>
              </Alert>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="classCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., ABC123"
                            className="text-center text-lg font-mono tracking-wider uppercase"
                            maxLength={10}
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground text-center">
                          Ask your teacher for the class code
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={enrollment.isPending}
                  >
                    {enrollment.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      'Join Class'
                    )}
                  </Button>
                </form>
              </Form>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Don't have a class code yet?
              </p>
              <Button variant="outline" asChild>
                <Link to="/dashboard/student">← Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">What happens when you join?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ Access personalized lessons from your teacher</li>
              <li>✅ Submit assignments and get feedback</li>
              <li>✅ Track your progress throughout the course</li>
              <li>✅ Receive tailored content based on your learning profile</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
