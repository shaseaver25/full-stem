import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SuperAdminSession {
  id?: string;
  writeOverrideEnabled: boolean;
  writeOverrideExpiresAt?: Date;
  reason?: string;
  viewAsRole?: 'student' | 'teacher' | 'school_admin' | 'district_admin';
  viewAsTenantId?: string;
}

type ViewAsRole = 'student' | 'teacher' | 'school_admin' | 'district_admin';

interface SuperAdminContextType {
  isSuperAdmin: boolean;
  loading: boolean;
  session: SuperAdminSession;
  readOnlyMode: boolean;
  enableWriteOverride: (reason: string, minutes?: number) => Promise<void>;
  disableWriteOverride: () => Promise<void>;
  setViewAs: (role?: string, tenantId?: string) => Promise<void>;
  logAuditAction: (action: string, resource: string, payload?: any) => Promise<void>;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

export const useSuperAdmin = () => {
  const context = useContext(SuperAdminContext);
  if (context === undefined) {
    throw new Error('useSuperAdmin must be used within a SuperAdminProvider');
  }
  return context;
};

export const SuperAdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SuperAdminSession>({
    writeOverrideEnabled: false,
  });

  const readOnlyMode = !session.writeOverrideEnabled || session.viewAsRole !== undefined;

  // Check if user is super admin
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    // No user = not super admin
    if (!user) {
      setIsSuperAdmin(false);
      setLoading(false);
      return;
    }

    const checkSuperAdmin = async () => {
      try {
        const { data, error } = await supabase.rpc('is_super_admin', {
          _user_id: user.id
        });

        if (error) throw error;
        
        setIsSuperAdmin(data || false);
        
        if (data) {
          await loadSession();
        }
      } catch (error) {
        console.error('Error checking super admin status:', error);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkSuperAdmin();
  }, [user, authLoading]);

  // Load current session
  const loadSession = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('super_admin_sessions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const expiresAt = data.write_override_expires_at 
          ? new Date(data.write_override_expires_at)
          : undefined;
        
        const now = new Date();
        const writeOverrideEnabled = data.write_override_enabled && 
          expiresAt && expiresAt > now;

        setSession({
          id: data.id,
          writeOverrideEnabled,
          writeOverrideExpiresAt: expiresAt,
          reason: data.reason || undefined,
          viewAsRole: (data.view_as_role as ViewAsRole) || undefined,
          viewAsTenantId: data.view_as_tenant_id || undefined,
        });
      }
    } catch (error) {
      console.error('Error loading super admin session:', error);
    }
  };

  // Enable write override with reason
  const enableWriteOverride = async (reason: string, minutes = 15) => {
    if (!user || !isSuperAdmin) return;

    try {
      const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

      const { data, error } = await supabase
        .from('super_admin_sessions')
        .upsert({
          user_id: user.id,
          write_override_enabled: true,
          write_override_expires_at: expiresAt.toISOString(),
          reason,
          ip_address: await getClientIP(),
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;

      setSession(prev => ({
        ...prev,
        id: data.id,
        writeOverrideEnabled: true,
        writeOverrideExpiresAt: expiresAt,
        reason,
      }));

      await logAuditAction('super_admin.write_override_enabled', 'session', { 
        minutes, 
        reason,
        expires_at: expiresAt.toISOString()
      });

      toast({
        title: "Write Override Enabled",
        description: `Write access enabled for ${minutes} minutes. All actions will be audited.`,
        variant: "destructive"
      });

      // Auto-disable after expiry
      setTimeout(() => {
        disableWriteOverride();
      }, minutes * 60 * 1000);

    } catch (error) {
      console.error('Error enabling write override:', error);
      toast({
        title: "Error",
        description: "Failed to enable write override",
        variant: "destructive"
      });
    }
  };

  // Disable write override
  const disableWriteOverride = async () => {
    if (!user || !session.id) return;

    try {
      const { error } = await supabase
        .from('super_admin_sessions')
        .update({
          write_override_enabled: false,
          write_override_expires_at: null,
          reason: null,
        })
        .eq('id', session.id);

      if (error) throw error;

      setSession(prev => ({
        ...prev,
        writeOverrideEnabled: false,
        writeOverrideExpiresAt: undefined,
        reason: undefined,
      }));

      await logAuditAction('super_admin.write_override_disabled', 'session');

      toast({
        title: "Write Override Disabled",
        description: "Returning to read-only mode",
      });
    } catch (error) {
      console.error('Error disabling write override:', error);
    }
  };

  // Set view as role/tenant
  const setViewAs = async (role?: string, tenantId?: string) => {
    if (!user || !isSuperAdmin) return;

    try {
      const { error } = await supabase
        .from('super_admin_sessions')
        .upsert({
          user_id: user.id,
          view_as_role: role || null,
          view_as_tenant_id: tenantId || null,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setSession(prev => ({
        ...prev,
        viewAsRole: role as ViewAsRole | undefined,
        viewAsTenantId: tenantId,
      }));

      await logAuditAction('super_admin.view_as_changed', 'session', { 
        role, 
        tenant_id: tenantId 
      });

    } catch (error) {
      console.error('Error setting view as:', error);
    }
  };

  // Log audit action
  const logAuditAction = async (action: string, resource: string, payload?: any) => {
    if (!user || !isSuperAdmin) return;

    try {
      const payloadHash = payload ? 
        btoa(JSON.stringify(payload)).slice(0, 32) : null;

      const { error } = await supabase
        .from('audit_logs')
        .insert({
          actor_user_id: user.id,
          actor_role: 'super_admin',
          tenant_id: session.viewAsTenantId || null,
          action,
          resource,
          payload_hash: payloadHash,
          reason: session.reason || null,
          ip_address: await getClientIP(),
          user_agent: navigator.userAgent,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging audit action:', error);
    }
  };

  const value = {
    isSuperAdmin,
    loading,
    session,
    readOnlyMode,
    enableWriteOverride,
    disableWriteOverride,
    setViewAs,
    logAuditAction,
  };

  return (
    <SuperAdminContext.Provider value={value}>
      {children}
    </SuperAdminContext.Provider>
  );
};

// Helper function to get client IP (simplified)
const getClientIP = async (): Promise<string> => {
  try {
    // In a real implementation, you might use a service to get the IP
    // For now, we'll return a placeholder
    return '127.0.0.1';
  } catch {
    return '127.0.0.1';
  }
};