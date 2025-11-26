import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function CreateTestTeachers() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const createTeachers = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('create-test-teachers', {
        body: {}
      });

      if (invokeError) throw invokeError;

      setResult(data);
    } catch (err: any) {
      console.error('Error creating teachers:', err);
      setError(err.message || 'Failed to create teachers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Test Teacher Accounts</CardTitle>
          <CardDescription>
            Click the button below to create 4 test teacher accounts with credentials:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <p>• MelTeacher@test.com - Test1234!</p>
            <p>• MichaelTeacher@test.com - Test1234!</p>
            <p>• KariTeacher@test.com - Test1234!</p>
            <p>• ManjeetTeacher@test.com - Test1234!</p>
          </div>

          <Button 
            onClick={createTeachers} 
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Teacher Accounts
          </Button>

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
