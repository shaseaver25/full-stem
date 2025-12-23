
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logError, setErrorUser, clearErrorUser } from '@/utils/errorLogging';
import { retryAuth } from '@/utils/queryRetry';
import { handleAuthError } from '@/utils/error';

// Auth bypass flag - disabled for normal operation
const AUTH_BYPASS_MODE = false;

// Mock user for bypass mode
const BYPASS_USER: User = {
  id: 'bypass-dev-user-123',
  email: 'developer@fullstem.dev',
  app_metadata: {},
  user_metadata: { full_name: 'Developer (Bypass Mode)' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User;

const BYPASS_SESSION: Session = {
  access_token: 'bypass-token',
  refresh_token: 'bypass-refresh',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: BYPASS_USER,
} as Session;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isSuperAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(AUTH_BYPASS_MODE ? BYPASS_USER : null);
  const [session, setSession] = useState<Session | null>(AUTH_BYPASS_MODE ? BYPASS_SESSION : null);
  const [loading, setLoading] = useState(!AUTH_BYPASS_MODE);
  const [isSuperAdmin, setIsSuperAdmin] = useState(AUTH_BYPASS_MODE);

  // Retry-enabled session fetch
  const fetchSessionWithRetry = useCallback(async () => {
    const result = await retryAuth(
      async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
      },
      { context: { action: 'getSession', page: 'auth' } }
    );
    
    if (!result.success && result.error) {
      handleAuthError(result.error, { action: 'getSession' });
    }
    
    return result.success ? result.data : null;
  }, []);

  // Retry-enabled super admin check
  const checkSuperAdminWithRetry = useCallback(async (userId: string): Promise<boolean> => {
    const result = await retryAuth(
      async () => {
        const { data, error } = await supabase.rpc('is_super_admin', { _user_id: userId });
        if (error) throw error;
        return data || false;
      },
      { context: { action: 'is_super_admin', page: 'auth' } }
    );
    
    if (!result.success && result.error) {
      logError(result.error, 'AuthContext: is_super_admin check failed after retries');
    }
    
    return result.success ? (result.data ?? false) : false;
  }, []);

  useEffect(() => {
    // If bypass mode is enabled, skip all Supabase auth
    if (AUTH_BYPASS_MODE) {
      console.warn('⚠️ AUTH BYPASS MODE ENABLED - All routes accessible without authentication');
      setLoading(false);
      return;
    }

    let isInitialLoad = true;

    // Get initial session with retry logic
    fetchSessionWithRetry().then((session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Set Sentry user context
      if (session?.user) {
        setErrorUser(session.user.id, session.user.email);
      }
      
      // Defer super admin check for initial session
      if (session?.user) {
        setTimeout(() => {
          checkSuperAdminWithRetry(session.user.id).then(setIsSuperAdmin);
        }, 0);
      }
      
      setLoading(false);
      isInitialLoad = false;
    });

    // Set up auth state listener for subsequent changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Skip the initial SIGNED_IN event to avoid race condition
        if (isInitialLoad && event === 'SIGNED_IN') {
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        // Set or clear Sentry user context
        if (session?.user) {
          setErrorUser(session.user.id, session.user.email);
        } else {
          clearErrorUser();
        }
        
        // Defer async operations to avoid deadlocks
        if (session?.user) {
          setTimeout(() => {
            checkSuperAdminWithRetry(session.user.id).then(setIsSuperAdmin);
          }, 0);
        } else {
          setIsSuperAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchSessionWithRetry, checkSuperAdminWithRetry]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const result = await retryAuth(
      async () => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
              role: 'student' // DEFAULT TO STUDENT ROLE
            }
          }
        });
        if (error) throw error;
        return null;
      },
      { context: { action: 'signUp', page: 'auth' } }
    );

    return { error: result.success ? null : result.error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔄 Calling Supabase signInWithPassword with retry...');
    
    const result = await retryAuth(
      async () => {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        console.log('📊 Supabase response:', { hasError: !!error, hasData: !!data });
        
        if (error) {
          console.error('🚫 Supabase auth error:', error);
          throw error;
        }
        
        return data;
      },
      { context: { action: 'signIn', page: 'auth' } }
    );

    if (!result.success && result.error) {
      handleAuthError(result.error, { action: 'signIn' });
    }

    return { error: result.success ? null : result.error };
  };

  const signOut = async () => {
    const result = await retryAuth(
      async () => {
        clearErrorUser();
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return null;
      },
      { context: { action: 'signOut', page: 'auth' } }
    );
    
    if (!result.success && result.error) {
      handleAuthError(result.error, { action: 'signOut' });
      throw result.error;
    }
  };

  const value = {
    user,
    session,
    loading,
    isSuperAdmin,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
