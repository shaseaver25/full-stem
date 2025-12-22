import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { hasPermission, type UserRole } from '@/utils/roleUtils';

// TEMPORARY: Auth bypass flag - must match AuthContext
const AUTH_BYPASS_MODE = true;

interface RequireRoleProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const RequireRole: React.FC<RequireRoleProps> = ({ children, allowedRoles }) => {
  const { user, loading: authLoading } = useAuth();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [checking, setChecking] = useState(!AUTH_BYPASS_MODE);

  useEffect(() => {
    // If bypass mode is enabled, skip role checking
    if (AUTH_BYPASS_MODE) {
      setChecking(false);
      return;
    }

    const checkUserRole = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user roles:', error);
          setUserRoles([]);
        } else {
          setUserRoles((data?.map(r => r.role) || []) as UserRole[]);
        }
      } catch (error) {
        console.error('Error checking user roles:', error);
        setUserRoles([]);
      } finally {
        setChecking(false);Create docs/API_DOCUMENTATION.md documenting all edge functions: text-to-speech, quiz-generation, personalize-assignment, store-oauth-tokens, veCreate docs/DATABASE_SCHEMA.md with: entity relationship diCreate docs/ARCHITECTURE.md with: high-level system architecture diagram, component relationships (frontend/backend/database), data flow through the system, Supabase integration overview, key architectural decisions, scalability considerations
          agram, complete table reference (name, columns, types, constraints), Row Level Security (RLS) policies explanation for each table, migration procedures, and key relationships between tables like classes->lessons->lesson_componCreate docs/FEATURES.md documenting: AI Lesson Generation (how it uses Lovable AI to create lessons), Assessment Proctoring (integrity monitoring, violation detection), Accessibility Features (TTS, translations, dyslexia mode), Google Drive/OneDrive Integration (file management), Pivot AI Assistant (Socratic tutoring), Co-teaching Support (multi-teacher collaboration)
Create docs/SECURITY.md with: security audit findings and status, RLS policy details for sensitive tables, FERPA/COPPA compliance notes, authentication flow, MFA setup and enforcement, encryption for PII (tokens, sensitive data), SQL injection prevention, XSS prevention with SafeHtml componentCreate docs/DEVELOPMENT_WORKFLOW.md with: Git branching strategy, code style and conventions, testing approach (unit tests, integration tests), common development tasks (adding features, debugging), build and deployment process, performance optimization tips, debugging tools available
            Create docs/TROUBLESHOOTING.md with solutions for: Supabase connectivity issues, Google Drive authentication errors and token refresh problems, ElevenLabs TTS quota errors, environment variable configuration issues, common React/TypeScript compilation errors, database migration failures, and where to check logs (browser console, Supabase dashboard)
            
            ents
          rify-mfa, setup-mfa. Include RPC functions: has_role(), is_teacher_of_class(), can_view_student(). For each include parameters, response format, error codes, example usage
        
      }
    };

    if (!authLoading) {
      checkUserRole();
    }
  }, [user, authLoading]);

  // In bypass mode, allow everything
  if (AUTH_BYPASS_MODE) {
    return <>{children}</>;
  }

  if (authLoading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (userRoles.length === 0) {
    console.warn('User has no roles assigned');
    return <Navigate to="/" replace />;
  }

  // Developer has access to everything
  if (userRoles.includes('developer')) {
    return <>{children}</>;
  }

  // Check if user has any of the allowed roles
  const hasAccess = userRoles.some(role => allowedRoles.includes(role));

  if (!hasAccess) {
    console.warn(`Access denied: User roles "${userRoles.join(', ')}" not in allowed roles:`, allowedRoles);
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};

export default RequireRole;
