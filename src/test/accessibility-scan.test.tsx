import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Components to test
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import TeacherDashboard from '@/components/teacher/TeacherDashboard';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { AuthProvider } from '@/contexts/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <AccessibilityProvider>
          {children}
        </AccessibilityProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

describe('Accessibility Scan - Critical Routes', () => {
  it('Landing page should have no accessibility violations', async () => {
    const { container } = render(<Index />, { wrapper: AllTheProviders });
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('Auth page should have no accessibility violations', async () => {
    const { container } = render(<Auth />, { wrapper: AllTheProviders });
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('Teacher Dashboard should have no accessibility violations', async () => {
    const { container } = render(<TeacherDashboard />, { wrapper: AllTheProviders });
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});

describe('Accessibility Scan - UI Components', () => {
  it('should detect and report violations by severity', async () => {
    const { container } = render(
      <div>
        {/* Test cases for common violations */}
        <button>
          <span className="sr-only">Accessible button</span>
          Icon
        </button>
        <img src="test.jpg" alt="Test image" />
        <input type="text" aria-label="Text input" />
      </div>
    );
    
    const results = await axe(container);
    
    // Categorize violations by severity
    const critical = results.violations.filter(v => v.impact === 'critical');
    const serious = results.violations.filter(v => v.impact === 'serious');
    const moderate = results.violations.filter(v => v.impact === 'moderate');
    const minor = results.violations.filter(v => v.impact === 'minor');
    
    console.log('Accessibility Scan Results:');
    console.log(`Critical: ${critical.length}`);
    console.log(`Serious: ${serious.length}`);
    console.log(`Moderate: ${moderate.length}`);
    console.log(`Minor: ${minor.length}`);
  });
});
