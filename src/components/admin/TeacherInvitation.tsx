import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const TeacherInvitation = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInviteTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { data, error: inviteError } = await supabase.functions.invoke('invite-teacher', {
        body: { 
          email, 
          fullName,
          invitedBy: (await supabase.auth.getUser()).data.user?.id 
        }
      });

      if (inviteError) throw inviteError;

      setSuccess(true);
      setEmail('');
      setFullName('');
      toast.success('Teacher invitation sent successfully!');
    } catch (err: any) {
      console.error('Error inviting teacher:', err);
      setError(err.message || 'Failed to send invitation');
      toast.error('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Invite New Teacher
        </CardTitle>
        <CardDescription>
          Send an invitation email with temporary credentials to a new teacher
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInviteTeacher} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter teacher's full name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter teacher's email"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Send Invitation
          </Button>
        </form>

        {success && (
          <Alert className="mt-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Invitation sent successfully! The teacher will receive an email with login instructions.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mt-4" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
