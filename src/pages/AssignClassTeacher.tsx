import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function AssignClassTeacher() {
  const [status, setStatus] = useState<'idle' | 'updating' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const updateClassTeacher = async () => {
    setStatus('updating');
    setMessage('Updating class teacher...');

    try {
      // Update the Richfield Excel Certification class to assign Sonya as the teacher
      const { data, error } = await supabase
        .from('classes')
        .update({ 
          teacher_id: 'a2b053e9-86f7-494e-af3d-f77f7c0d11ea', // Sonya's teacher profile ID
          updated_at: new Date().toISOString()
        })
        .eq('id', '318f3c33-8240-45ef-b1f6-bc7d30a56309') // Richfield Excel Certification class ID
        .select(`
          id,
          name,
          teacher_id,
          teacher_profiles!classes_teacher_id_fkey (
            id,
            profiles!teacher_profiles_user_id_fkey (
              full_name,
              email
            )
          )
        `)
        .single();

      if (error) {
        console.error('Error updating class:', error);
        setStatus('error');
        setMessage(`Error: ${error.message}`);
        return;
      }

      setStatus('success');
      setMessage(`Successfully assigned Sonya (sonya@creatempls.org) as teacher for "${data.name}"`);
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setStatus('error');
      setMessage(`Unexpected error: ${err.message}`);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Assign Class Teacher</h1>
        <p className="text-muted-foreground mb-6">
          This utility will assign Sonya (sonya@creatempls.org) as the teacher for the Richfield Excel Certification class.
        </p>

        {status === 'idle' && (
          <Button onClick={updateClassTeacher} className="w-full">
            Update Class Teacher
          </Button>
        )}

        {status === 'updating' && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-200">{message}</p>
            </div>
            <Button onClick={() => navigate('/teacher/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">{message}</p>
            </div>
            <Button onClick={updateClassTeacher} variant="outline" className="w-full">
              Try Again
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
