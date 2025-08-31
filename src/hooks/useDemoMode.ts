import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDemoMode = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoDataExists, setDemoDataExists] = useState(false);

  useEffect(() => {
    checkDemoMode();
  }, []);

  const checkDemoMode = async () => {
    try {
      // Check if demo data exists by looking for demo profiles
      const { data: demoProfiles } = await supabase
        .from('profiles')
        .select('id')
        .like('id', 'demo_%')
        .limit(1);

      const hasDemo = demoProfiles && demoProfiles.length > 0;
      setDemoDataExists(hasDemo);
      
      // Check if we're in demo mode (URL param, localStorage, or self-serve demo session)
      const urlParams = new URLSearchParams(window.location.search);
      const hasDemoTenantId = !!localStorage.getItem('demo_tenant_id');
      const isDemo = urlParams.get('demo') === 'true' || 
                     localStorage.getItem('demo_mode') === 'true' ||
                     hasDemoTenantId ||
                     hasDemo;
      
      setIsDemoMode(isDemo);
      
      // Store in localStorage for persistence
      if (isDemo) {
        localStorage.setItem('demo_mode', 'true');
      }
    } catch (error) {
      console.error('Error checking demo mode:', error);
    }
  };

  const enableDemoMode = () => {
    localStorage.setItem('demo_mode', 'true');
    setIsDemoMode(true);
  };

  const disableDemoMode = () => {
    localStorage.removeItem('demo_mode');
    localStorage.removeItem('demo_tenant_id');
    setIsDemoMode(false);
  };

  return {
    isDemoMode,
    demoDataExists,
    enableDemoMode,
    disableDemoMode,
    checkDemoMode
  };
};