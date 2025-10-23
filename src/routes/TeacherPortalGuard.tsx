import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Global guard that enforces teacher dashboard navigation when teacherPortalLogin flag is set.
 * Acts as a "traffic cop" to prevent any late redirects from overriding teacher portal login.
 */
export default function TeacherPortalGuard() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const isTeacherPortalLogin = sessionStorage.getItem('teacherPortalLogin') === 'true';

    if (!isTeacherPortalLogin) return;

    const path = location.pathname;
    const isTeacherArea = path === '/teacher/dashboard' || path.startsWith('/teacher');

    // Hard rule: while the flag is set, do not allow leaving /teacher/*
    if (!isTeacherArea) {
      console.log('🛡️ TeacherPortalGuard: blocking navigation to', path, '→ forcing /teacher/dashboard');
      navigate('/teacher/dashboard', { replace: true });
    }
  }, [location, navigate]);

  return null;
}
