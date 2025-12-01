import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function CreateTestStudents() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const createStudents = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('create-test-students-simple', {
        body: {}
      });

      if (invokeError) throw invokeError;

      setResult(data);
    } catch (err: any) {
      console.error('Error creating students:', err);
      setError(err.message || 'Failed to create students');
    } finally {
      setLoading(false);
    }
  };

  const enrollStudents = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('enroll-test-students', {
        body: {}
      });

      if (invokeError) throw invokeError;

      setResult(data);
    } catch (err: any) {
      console.error('Error enrolling students:', err);
      setError(err.message || 'Failed to enroll students');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Test Student Accounts</CardTitle>
          <CardDescription>
            Click the button below to create 4 test student accounts with credentials:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <p>• MelStudent@test.com - Test1234!</p>
            <p>• MichaelStudent@test.com - Test1234!</p>
            <p>• KariStudent@test.com - Test1234!</p>
            <p>• ManjeetStudent@test.com - Test1234!</p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={createStudents} 
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Auth Accounts
            </Button>
            
            <Button 
              onClick={enrollStudents} 
              disabled={loading}
              className="flex-1"
              variant="secondary"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enroll in Richfield Excel
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Results:</p>
                  {result.results?.map((r: any, i: number) => (
                    <p key={i}>
                      {r.email}: {r.status}
                      {r.error && ` - ${r.error}`}
                    </p>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
