import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface ImpersonationContextType {
  isImpersonating: boolean;
  impersonatedUser: any | null;
  impersonatedRole: string | null;
  startImpersonation: (userId: string, role: string) => Promise<void>;
  stopImpersonation: () => Promise<void>;
  logAction: (action: string, details?: any) => void;
  isDeveloper: boolean;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

export const useImpersonation = () => {
  const context = useContext(ImpersonationContext);
  if (context === undefined) {
    throw new Error('useImpersonation must be used within an ImpersonationProvider');
  }
  return context;
};

export const ImpersonationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<any | null>(null);
  const [impersonatedRole, setImpersonatedRole] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isDeveloper, setIsDeveloper] = useState(false);

  // Check if current user is a developer
  useEffect(() => {
    const checkDeveloperStatus = async () => {
      if (!user) {
        setIsDeveloper(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_developer', { _user_id: user.id });
        if (error) {
          console.error('Error checking developer status:', error);
          setIsDeveloper(false);
        } else {
          setIsDeveloper(data || false);
        }
      } catch (error) {
        console.error('Error checking developer status:', error);
        setIsDeveloper(false);
      }
    };

    checkDeveloperStatus();
  }, [user]);

  const startImpersonation = async (userId: string, role: string) => {
    if (!user || !isDeveloper) {
      throw new Error('Only developers can impersonate users');
    }

    try {
      // Create impersonation log
      const { data: logData, error: logError } = await supabase
        .from('impersonation_logs')
        .insert({
          developer_id: user.id,
          impersonated_user_id: userId,
          impersonated_role: role,
          ip_address: await getClientIP(),
          user_agent: navigator.userAgent
        })
        .select('id')
        .single();

      if (logError) throw logError;

      // Fetch user data for impersonation
      let userData = null;
      if (role === 'teacher') {
        const { data } = await supabase
          .from('teacher_profiles')
          .select('*, profiles(*)')
          .eq('user_id', userId)
          .single();
        userData = data;
      } else if (role === 'parent') {
        const { data } = await supabase
          .from('parent_profiles')
          .select('*, profiles(*)')
          .eq('user_id', userId)
          .single();
        userData = data;
      } else if (role === 'student') {
        const { data } = await supabase
          .from('students')
          .select('*')
          .eq('id', userId)
          .single();
        userData = data;
      }

      setIsImpersonating(true);
      setImpersonatedUser(userData);
      setImpersonatedRole(role);
      setCurrentSessionId(logData.id);

      console.log(`Started impersonating ${role} user:`, userData);
    } catch (error) {
      console.error('Error starting impersonation:', error);
      throw error;
    }
  };

  const stopImpersonation = async () => {
    if (!currentSessionId) return;

    try {
      // Update impersonation log with end time
      await supabase
        .from('impersonation_logs')
        .update({ session_end: new Date().toISOString() })
        .eq('id', currentSessionId);

      setIsImpersonating(false);
      setImpersonatedUser(null);
      setImpersonatedRole(null);
      setCurrentSessionId(null);

      console.log('Stopped impersonation');
    } catch (error) {
      console.error('Error stopping impersonation:', error);
    }
  };

  const logAction = async (action: string, details?: any) => {
    if (!currentSessionId) return;

    try {
      // Get current actions
      const { data: currentLog } = await supabase
        .from('impersonation_logs')
        .select('actions_performed')
        .eq('id', currentSessionId)
        .single();

      const currentActions = Array.isArray(currentLog?.actions_performed) ? currentLog.actions_performed : [];
      const newAction = {
        action,
        details,
        timestamp: new Date().toISOString()
      };

      // Update actions in impersonation log
      await supabase
        .from('impersonation_logs')
        .update({ 
          actions_performed: [...currentActions, newAction]
        })
        .eq('id', currentSessionId);

      // Also log to activity_log for audit trail
      if (user && impersonatedUser) {
        await supabase
          .from('activity_log')
          .insert({
            user_id: user.id,
            role: 'developer',
            action,
            details,
            is_impersonation: true,
            impersonated_user_id: impersonatedUser.id || impersonatedUser.user_id,
            impersonated_role: impersonatedRole
          });
      }
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  const value = {
    isImpersonating,
    impersonatedUser,
    impersonatedRole,
    startImpersonation,
    stopImpersonation,
    logAction,
    isDeveloper
  };

  return (
    <ImpersonationContext.Provider value={value}>
      {children}
    </ImpersonationContext.Provider>
  );
};