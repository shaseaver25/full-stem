import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const DemoStart = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid demo link - missing token');
      return;
    }

    consumeToken(token);
  }, [searchParams]);

  const consumeToken = async (token: string) => {
    try {
      const response = await fetch('/functions/v1/demo-consume-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Store demo session info
      localStorage.setItem('demo_mode', 'true');
      localStorage.setItem('demo_tenant_id', data.demoTenantId);
      
      setStatus('success');
      
      toast({
        title: "Welcome to TailorEDU Demo!",
        description: "You're now in a sandbox with demo data. Explore freely!"
      });

      // Redirect to demo home after a brief success message
      setTimeout(() => {
        navigate('/demo/home');
      }, 2000);

    } catch (error) {
      console.error('Error consuming demo token:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to start demo session');
      
      toast({
        title: "Demo Access Failed",
        description: error instanceof Error ? error.message : 'Failed to start demo session',
        variant: "destructive"
      });
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <CardTitle>Starting Your Demo...</CardTitle>
            <CardDescription>
              Setting up your personalized sandbox environment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>Validating demo access</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>Loading demo data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>Preparing AI features</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-700">Access Error</CardTitle>
            <CardDescription>
              Unable to start your demo session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                This could happen if:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 text-left">
                <li>• The demo link has expired (valid for 1 hour)</li>
                <li>• The link has already been used</li>
                <li>• There was a technical issue</li>
              </ul>
              
              <div className="mt-6">
                <a 
                  href="/demo" 
                  className="text-primary underline hover:no-underline text-sm"
                >
                  Request a new demo link
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-green-700">Demo Ready!</CardTitle>
          <CardDescription>
            Redirecting you to the demo environment...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Success!</strong> Your demo session is active. You'll be redirected automatically.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoStart;