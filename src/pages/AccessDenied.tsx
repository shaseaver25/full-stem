import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { getRoleDashboardPath, UserRole } from '@/utils/roleRedirect';

const AccessDenied = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string; userRole?: UserRole } | null;

  const handleGoToDashboard = () => {
    if (state?.userRole) {
      const dashboardPath = getRoleDashboardPath(state.userRole);
      navigate(dashboardPath);
    } else {
      navigate('/');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">403 - Access Denied</CardTitle>
          <CardDescription className="text-base mt-2">
            You don't have permission to access this page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state?.from && (
            <p className="text-sm text-muted-foreground text-center">
              The page <span className="font-mono text-foreground">{state.from}</span> is restricted to authorized users only.
            </p>
          )}
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleGoToDashboard}
              className="w-full"
              size="lg"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
            
            <Button 
              onClick={handleGoBack}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground text-center">
              If you believe you should have access to this page, please contact your administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDenied;
