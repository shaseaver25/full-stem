/**
 * Web Vitals Monitoring
 * 
 * Tracks Core Web Vitals and sends metrics to analytics
 * for real user monitoring (RUM)
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';
import { supabase } from '@/integrations/supabase/client';

/**
 * Send metric to analytics backend
 */
const sendToAnalytics = async (metric: Metric) => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('📊 Web Vital:', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }

  // Send to Supabase performance_metrics table
  try {
    await supabase.from('performance_metrics').insert({
      metric_name: metric.name,
      value: metric.value,
      metric_type: 'web_vital',
      unit: getMetricUnit(metric.name),
      metadata: {
        id: metric.id,
        delta: metric.delta,
        rating: metric.rating,
        navigationType: metric.navigationType,
        entries: metric.entries?.length || 0,
      },
    });
  } catch (error) {
    // Silently fail to avoid disrupting user experience
    console.error('Failed to send web vital metric:', error);
  }
};

/**
 * Get appropriate unit for metric
 */
const getMetricUnit = (metricName: string): string => {
  switch (metricName) {
    case 'CLS':
      return 'score';
    case 'INP':
      return 'milliseconds';
    case 'FCP':
    case 'LCP':
    case 'TTFB':
      return 'milliseconds';
    default:
      return 'numeric';
  }
};

/**
 * Get performance rating color for UI display
 */
export const getPerformanceRating = (metric: Metric): {
  color: string;
  label: string;
} => {
  const { rating } = metric;
  
  switch (rating) {
    case 'good':
      return { color: 'text-green-600', label: 'Good' };
    case 'needs-improvement':
      return { color: 'text-yellow-600', label: 'Needs Improvement' };
    case 'poor':
      return { color: 'text-red-600', label: 'Poor' };
    default:
      return { color: 'text-gray-600', label: 'Unknown' };
  }
};

/**
 * Format metric value for display
 */
export const formatMetricValue = (metric: Metric): string => {
  const { name, value } = metric;
  
  switch (name) {
    case 'CLS':
      return value.toFixed(3);
    case 'INP':
    case 'FCP':
    case 'LCP':
    case 'TTFB':
      return `${Math.round(value)}ms`;
    default:
      return value.toString();
  }
};

/**
 * Initialize Web Vitals tracking
 * Call this once when the app starts
 */
export const initWebVitalsTracking = () => {
  // Only track in production
  if (import.meta.env.PROD) {
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
    onINP(sendToAnalytics);
  }
};

/**
 * Get current performance metrics
 * Useful for displaying performance data to users/admins
 */
export const getCurrentPerformanceMetrics = (): Promise<PerformanceEntry[]> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const resources = performance.getEntriesByType('resource');
      
      resolve([navigation, ...paint, ...resources]);
    } else {
      resolve([]);
    }
  });
};

/**
 * Get page load metrics summary
 */
export const getPageLoadMetrics = (): {
  dns: number;
  tcp: number;
  ttfb: number;
  download: number;
  domProcessing: number;
  total: number;
} | null => {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return null;
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (!navigation) return null;

  return {
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    ttfb: navigation.responseStart - navigation.requestStart,
    download: navigation.responseEnd - navigation.responseStart,
    domProcessing: navigation.domComplete - navigation.domInteractive,
    total: navigation.loadEventEnd - navigation.fetchStart,
  };
};
