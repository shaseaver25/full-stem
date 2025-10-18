import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Shield, Copy, CheckCircle } from 'lucide-react';

export default function MFASetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    generateMFASecret();
  }, [user, navigate]);

  const generateMFASecret = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('setup-mfa', {
        body: { action: 'generate' }
      });

      if (error) throw error;

      setQrCode(data.qrCode);
      setSecret(data.secret);
    } catch (error) {
      console.error('Error generating MFA secret:', error);
      toast({
        title: "Error",
        description: "Failed to generate MFA secret. Please try again.",
        variant: "destructive",
      });
    }
  };

  const verifyAndEnableMFA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-mfa', {
        body: { 
          action: 'verify',
          token: verificationCode,
          secret: secret
        }
      });

      if (error) throw error;

      if (data.verified) {
        setBackupCodes(data.backupCodes);
        setStep('backup');
        toast({
          title: "MFA Enabled",
          description: "Two-factor authentication has been enabled successfully.",
        });
      } else {
        toast({
          title: "Invalid Code",
          description: "The verification code is incorrect. Please try again.",
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const finishSetup = () => {
    navigate('/dev');
  };

  if (step === 'backup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Backup Codes</CardTitle>
            </div>
            <CardDescription>
              Save these backup codes in a secure location. Each code can be used once.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Store these codes securely. You'll need them if you lose access to your authenticator app.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
              {backupCodes.map((code, index) => (
                <div key={index} className="font-mono text-sm flex items-center justify-between">
                  <span>{code}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(code)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              onClick={() => copyToClipboard(backupCodes.join('\n'))}
              variant="outline"
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy All Codes
            </Button>

            <Button onClick={finishSetup} className="w-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Enable Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Secure your account with an authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              Your role requires MFA to be enabled. Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.).
            </AlertDescription>
          </Alert>

          {qrCode && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img 
                  src={qrCode} 
                  alt="MFA QR Code" 
                  className="border rounded-lg p-4"
                  loading="eager"
                  width="256"
                  height="256"
                />
              </div>

              <div className="space-y-2">
                <Label>Manual Entry Code</Label>
                <div className="flex gap-2">
                  <Input
                    value={secret}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(secret)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              <Button
                onClick={verifyAndEnableMFA}
                disabled={isVerifying || verificationCode.length !== 6}
                className="w-full"
              >
                {isVerifying ? 'Verifying...' : 'Verify and Enable MFA'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
