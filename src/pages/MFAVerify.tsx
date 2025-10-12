import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

export default function MFAVerify() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const verifyMFA = async () => {
    if (!verificationCode || verificationCode.length < 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-mfa', {
        body: { 
          token: verificationCode,
          isBackupCode: useBackupCode
        }
      });

      if (error) throw error;

      if (data.verified && data.session) {
        // The edge function has updated the JWT with mfa_verified claim
        // Set the new session in Supabase client
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        toast({
          title: "Verified",
          description: "MFA verification successful.",
        });
        
        // Navigate back to intended destination
        const returnUrl = sessionStorage.getItem('mfa_return_url') || '/';
        sessionStorage.removeItem('mfa_return_url');
        navigate(returnUrl);
      } else {
        const errorMessage = data.error || "The verification code is incorrect. Please try again.";
        const attemptsRemaining = data.attemptsRemaining;
        
        toast({
          title: "Invalid Code",
          description: attemptsRemaining !== undefined 
            ? `${errorMessage} (${attemptsRemaining} attempts remaining)`
            : errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error verifying MFA:', error);
      toast({
        title: "Error",
        description: "Failed to verify code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Enter the verification code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification-code">
              {useBackupCode ? 'Backup Code' : 'Verification Code'}
            </Label>
            <Input
              id="verification-code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, useBackupCode ? 8 : 6))}
              placeholder={useBackupCode ? 'Enter backup code' : 'Enter 6-digit code'}
              maxLength={useBackupCode ? 8 : 6}
              className="text-center text-2xl tracking-widest"
            />
          </div>

          <Button
            onClick={verifyMFA}
            disabled={isVerifying || verificationCode.length < 6}
            className="w-full"
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </Button>

          <Button
            onClick={() => {
              setUseBackupCode(!useBackupCode);
              setVerificationCode('');
            }}
            variant="ghost"
            className="w-full"
          >
            {useBackupCode ? 'Use Authenticator App' : 'Use Backup Code'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
