import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProtectedParentRouteProps {
  children: React.ReactNode;
}

const ProtectedParentRoute = ({ children }: ProtectedParentRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const [isParent, setIsParent] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkParentRole = async () => {
      if (!user) {
        setIsParent(false);
        setChecking(false);
        return;
      }

      try {
        // Check if user has a parent profile
        const { data, error } = await supabase
          .from('parent_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking parent profile:', error);
          setIsParent(false);
        } else {
          setIsParent(data !== null);
        }
      } catch (error) {
        console.error('Error checking parent profile:', error);
        setIsParent(false);
      } finally {
        setChecking(false);
      }
    };

    checkParentRole();
  }, [user]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isParent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">This page is only accessible to parent accounts.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedParentRoute;
