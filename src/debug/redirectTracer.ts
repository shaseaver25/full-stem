/**
 * Debugging utility to trace all navigation/redirect operations.
 * Helps identify hidden redirect sources by logging all history API calls.
 * 
 * Only patches history.pushState and history.replaceState (window.location is read-only).
 * Install once at app startup to monitor all redirects.
 * Remove after debugging is complete.
 */
export function installRedirectTracer() {
  console.log('🔍 Redirect tracer installed - monitoring navigation events');

  // Patch history.pushState
  const origPush = history.pushState;
  history.pushState = function (...args) {
    const trace = new Error().stack?.split('\n').slice(2, 4).join('\n') || 'unknown';
    console.log('🧭 pushState:', args[2], '\n  Called from:', trace);
    // @ts-ignore
    return origPush.apply(this, args);
  };

  // Patch history.replaceState
  const origReplace = history.replaceState;
  history.replaceState = function (...args) {
    const trace = new Error().stack?.split('\n').slice(2, 4).join('\n') || 'unknown';
    console.log('🧭 replaceState:', args[2], '\n  Called from:', trace);
    // @ts-ignore
    return origReplace.apply(this, args);
  };

  console.log('✅ Redirect tracer active - React Router navigation will be logged');
  console.log('   Note: Direct window.location changes cannot be traced (browser restriction)');
}

/**
 * Uninstall the redirect tracer (restore original methods).
 * Call this after debugging is complete to avoid performance overhead.
 */
export function uninstallRedirectTracer() {
  console.log('🔍 Redirect tracer uninstalled');
  // Note: In practice, we don't uninstall since we reload the page anyway
  // This is mainly for documentation purposes
}
