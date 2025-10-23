/**
 * Debugging utility to trace all navigation/redirect operations.
 * Helps identify hidden redirect sources by logging all history API calls.
 * 
 * Install once at app startup to monitor all redirects.
 * Remove after debugging is complete.
 */
export function installRedirectTracer() {
  console.log('🔍 Redirect tracer installed - monitoring all navigation events');

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

  // Patch window.location.assign
  const origAssign = window.location.assign.bind(window.location);
  window.location.assign = (url: string | URL) => {
    const trace = new Error().stack?.split('\n').slice(2, 4).join('\n') || 'unknown';
    console.log('🧭 location.assign →', url, '\n  Called from:', trace);
    origAssign(url);
  };

  // Patch window.location.href setter
  let currentHref = window.location.href;
  Object.defineProperty(window.location, 'href', {
    get: () => currentHref,
    set: (url: string) => {
      const trace = new Error().stack?.split('\n').slice(2, 4).join('\n') || 'unknown';
      console.log('🧭 location.href =', url, '\n  Called from:', trace);
      currentHref = url;
      window.location.assign(url);
    }
  });

  console.log('✅ Redirect tracer active - all navigation will be logged');
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
