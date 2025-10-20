import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BootstrapDemo() {
  const [isCreating, setIsCreating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const createDemoAccounts = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-demo-accounts');
      
      if (error) throw error;

      console.log('Demo accounts created:', data);
      setIsComplete(true);
      toast({
        title: 'Success',
        description: 'All demo accounts have been created successfully!',
      });
    } catch (error: any) {
      console.error('Error creating demo accounts:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create demo accounts',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Bootstrap Demo Accounts</CardTitle>
          <CardDescription>
            Create standardized test accounts for all roles to get started with TailorEDU
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isComplete ? (
            <>
              <div className="space-y-4">
                <h3 className="font-semibold">Accounts that will be created:</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Student Account</span>
                    <code className="text-xs">student@test.com</code>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Teacher Account</span>
                    <code className="text-xs">teacher@test.com</code>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Parent Account</span>
                    <code className="text-xs">parent@test.com</code>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Admin Account</span>
                    <code className="text-xs">admin@test.com</code>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Super Admin Account</span>
                    <code className="text-xs">superadmin@test.com</code>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Developer Account</span>
                    <code className="text-xs">developer@test.com</code>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Passwords: <code className="bg-muted px-2 py-1 rounded">Student123!</code>, <code className="bg-muted px-2 py-1 rounded">Teacher123!</code>, <code className="bg-muted px-2 py-1 rounded">Parent123!</code>, <code className="bg-muted px-2 py-1 rounded">Admin123!</code>, <code className="bg-muted px-2 py-1 rounded">Dev123!</code>
                </p>
              </div>

              <Button 
                onClick={createDemoAccounts} 
                disabled={isCreating}
                className="w-full"
                size="lg"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Demo Accounts...
                  </>
                ) : (
                  'Create Demo Accounts'
                )}
              </Button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold mb-2">All Set!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Demo accounts have been created successfully. You can now log in with any of the test accounts.
                </p>
              </div>
              <Button onClick={() => navigate('/auth')} size="lg" className="w-full">
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
