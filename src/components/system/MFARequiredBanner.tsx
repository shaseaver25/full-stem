import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MFARequiredBannerProps {
  role: string;
}

export const MFARequiredBanner = ({ role }: MFARequiredBannerProps) => {
  const navigate = useNavigate();

  return (
    <Alert variant="destructive" className="mb-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        <Shield className="h-5 w-5" />
      </div>
      <AlertTitle className="font-semibold">
        Multi-Factor Authentication Required
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>
          Your account role ({role}) requires MFA to be enabled for security compliance.
          Please complete MFA setup to access all features.
        </p>
        <Button 
          onClick={() => navigate('/auth/setup-mfa')}
          variant="outline"
          size="sm"
          className="mt-2"
        >
          <Shield className="h-4 w-4 mr-2" />
          Enable MFA Now
        </Button>
      </AlertDescription>
    </Alert>
  );
};
