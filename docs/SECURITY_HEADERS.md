# Security Headers

## Overview

TailorEDU implements comprehensive HTTP security headers to protect against common web vulnerabilities including XSS, clickjacking, MIME-sniffing attacks, and unauthorized feature access.

## Architecture

### Deployment Models

```
┌─────────────────────────────────────────────────┐
│ Production Deployment                           │
├─────────────────────────────────────────────────┤
│ Vercel/Netlify → vercel.json/netlify.toml      │
│   ↓ Static CDN applies headers automatically   │
│   ↓ No server-side code required               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Development/Preview                             │
├─────────────────────────────────────────────────┤
│ Vite Dev Server → src/middleware/               │
│   ↓ securityHeaders.ts (local parity)          │
│   ↓ Development warnings only (non-blocking)   │
└─────────────────────────────────────────────────┘
```

## Security Headers Implemented

### 1. Content Security Policy (CSP)

**Mode**: Report-Only (default)

**Purpose**: Prevent XSS, code injection, and unauthorized resource loading

**Directives**:

```
Content-Security-Policy-Report-Only: 
  default-src 'self'; 
  script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules' https://*.sentry.io; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: blob:; 
  font-src 'self' data:; 
  connect-src 'self' https://*.supabase.co https://*.sentry.io; 
  frame-ancestors 'none'
```

**Breakdown**:

| Directive | Value | Rationale |
|-----------|-------|-----------|
| `default-src` | `'self'` | Only load resources from same origin by default |
| `script-src` | `'self' 'wasm-unsafe-eval' 'inline-speculation-rules' https://*.sentry.io` | Allow own scripts, WASM, speculation rules, and Sentry monitoring |
| `style-src` | `'self' 'unsafe-inline'` | Allow own styles and inline styles (required for Tailwind/shadcn) |
| `img-src` | `'self' data: blob:` | Allow images from origin, data URIs, and blob URLs |
| `font-src` | `'self' data:` | Allow fonts from origin and data URIs |
| `connect-src` | `'self' https://*.supabase.co https://*.sentry.io` | Allow API calls to Supabase and Sentry |
| `frame-ancestors` | `'none'` | Prevent embedding in iframes (clickjacking protection) |

**Report-Only Mode**:
- CSP violations are logged but not blocked
- Allows testing policies without breaking functionality
- Use browser DevTools Console to monitor violations

**Enabling Enforcement Mode**:
To switch from report-only to enforcement:
1. Update `vercel.json` or `netlify.toml`
2. Change header key from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`
3. Test thoroughly in staging before production

### 2. HTTP Strict Transport Security (HSTS)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Purpose**: Force HTTPS connections, prevent SSL stripping attacks

**Configuration**:
- `max-age=31536000`: 1 year (365 days) enforcement
- `includeSubDomains`: Apply to all subdomains
- `preload`: Eligible for browser preload lists

**Browser Support**: 97%+ (all modern browsers)

**Important Notes**:
- Only applies on HTTPS connections
- Once set, browsers enforce HTTPS for the duration
- To preload: Submit to [hstspreload.org](https://hstspreload.org/)

### 3. X-Content-Type-Options

```
X-Content-Type-Options: nosniff
```

**Purpose**: Prevent MIME-sniffing attacks

**Effect**: 
- Browser must respect declared Content-Type
- Prevents interpreting text/plain as JavaScript
- Blocks execution of mistyped resources

**Browser Support**: 99%+ (all browsers)

### 4. X-Frame-Options

```
X-Frame-Options: DENY
```

**Purpose**: Prevent clickjacking attacks

**Effect**:
- Page cannot be embedded in `<frame>`, `<iframe>`, or `<object>`
- Protects against UI redressing attacks
- Works alongside CSP `frame-ancestors 'none'`

**Browser Support**: 97%+ (all modern browsers)

**Alternatives**:
- `SAMEORIGIN`: Allow framing by same origin
- CSP `frame-ancestors`: More flexible, modern replacement

### 5. Referrer-Policy

```
Referrer-Policy: strict-origin-when-cross-origin
```

**Purpose**: Control referrer information leakage

**Behavior**:
- Same-origin requests: Send full URL
- Cross-origin (HTTPS→HTTPS): Send origin only
- Downgrade (HTTPS→HTTP): Send nothing

**Privacy Benefits**:
- Prevents leaking sensitive URLs to third parties
- Maintains analytics for same-origin navigation
- Complies with privacy regulations

### 6. Permissions-Policy

```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**Purpose**: Disable unnecessary browser features

**Disabled Features**:
- `camera=()`: No camera access
- `microphone=()`: No microphone access
- `geolocation=()`: No location tracking

**Why Minimal Set**:
- TailorEDU doesn't require these permissions
- Reduces attack surface
- Improves privacy posture
- Can be extended as needed

**Browser Support**: 85%+ (modern browsers)

## Deployment

### Vercel (Recommended)

**File**: `vercel.json` (project root)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { 
          "key": "Content-Security-Policy-Report-Only", 
          "value": "default-src 'self'; script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules' https://*.sentry.io; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.sentry.io; frame-ancestors 'none'" 
        },
        { 
          "key": "Strict-Transport-Security", 
          "value": "max-age=31536000; includeSubDomains; preload" 
        },
        { 
          "key": "X-Content-Type-Options", 
          "value": "nosniff" 
        },
        { 
          "key": "X-Frame-Options", 
          "value": "DENY" 
        },
        { 
          "key": "Referrer-Policy", 
          "value": "strict-origin-when-cross-origin" 
        },
        { 
          "key": "Permissions-Policy", 
          "value": "camera=(), microphone=(), geolocation=()" 
        }
      ]
    }
  ]
}
```

**Deployment**:
1. Commit `vercel.json` to repository
2. Deploy via Vercel (automatic detection)
3. Verify headers with: `curl -I https://your-domain.com`

### Netlify

**File**: `netlify.toml` (project root)

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy-Report-Only = "default-src 'self'; script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules' https://*.sentry.io; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.sentry.io; frame-ancestors 'none'"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
```

**Deployment**:
1. Commit `netlify.toml` to repository
2. Deploy via Netlify (automatic detection)
3. Verify headers with: `curl -I https://your-domain.netlify.app`

### Cloudflare Pages

**Configuration**: Dashboard → Pages → Project → Settings → Custom Headers

Or use `_headers` file:

```
/*
  Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules' https://*.sentry.io; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.sentry.io; frame-ancestors 'none'
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Development & Testing

### Local Development

Security headers are **not enforced** in local development to avoid breaking hot module replacement (HMR) and dev tools.

However, you can test headers locally using the middleware:

```typescript
import { securityHeaders } from '@/middleware/securityHeaders';

// In your development server or Express app
app.use(securityHeaders);
```

### Verifying Headers

**Browser DevTools**:
1. Open DevTools (F12)
2. Network tab → Select any request
3. Response Headers section
4. Check for security headers

**Command Line**:
```bash
# Check all headers
curl -I https://your-domain.com

# Check specific header
curl -I https://your-domain.com | grep -i "content-security-policy"
```

**Online Tools**:
- [Security Headers](https://securityheaders.com/) - Grade your security posture
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/) - Test CSP policies
- [Mozilla Observatory](https://observatory.mozilla.org/) - Comprehensive scan

### CSP Violation Monitoring

**Browser Console**:
```javascript
// CSP violations logged to console in report-only mode
// Look for: [Report Only] Refused to load...
```

**Sentry Integration** (optional):
```javascript
// In src/main.tsx
if (isProd && env.VITE_SENTRY_DSN) {
  Sentry.init({
    // ... existing config
    integrations: [
      // Add CSP reporting
      Sentry.reportingObserverIntegration(),
    ],
  });
}
```

**Custom Endpoint**:
Add `report-uri` or `report-to` directive to CSP:
```
Content-Security-Policy-Report-Only: 
  default-src 'self'; 
  ... 
  report-uri https://your-domain.com/api/csp-reports;
```

## Troubleshooting

### Issue: CSP Blocking Inline Scripts

**Symptom**: Console errors like "Refused to execute inline script"

**Solution**: 
1. Move inline scripts to external files
2. Use `script-src 'nonce-xxx'` with generated nonces
3. As last resort, add `'unsafe-inline'` (not recommended)

### Issue: Styles Not Loading

**Symptom**: Unstyled content, CSP violations for styles

**Solution**:
- Ensure `style-src 'unsafe-inline'` is present (required for Tailwind)
- Check for external stylesheets and add domains to `style-src`

### Issue: Images Not Displaying

**Symptom**: Broken images, CSP violations for images

**Solution**:
- Add image CDN domains to `img-src` (e.g., `https://*.cloudinary.com`)
- For user uploads, ensure Supabase storage domain is allowed

### Issue: API Calls Failing

**Symptom**: Network errors, CSP violations for connections

**Solution**:
- Verify `connect-src` includes all API endpoints
- Add third-party API domains (e.g., `https://api.openai.com`)

### Issue: HSTS Not Working

**Symptom**: HSTS header not visible in HTTP requests

**Cause**: HSTS only applies to HTTPS connections

**Solution**:
- Test on HTTPS deployment, not localhost HTTP
- Use `https://localhost` with self-signed cert for local testing

## Security Checklist

Before going to production:

- [ ] `vercel.json` or `netlify.toml` configured
- [ ] All security headers present in deployment
- [ ] CSP tested in report-only mode
- [ ] No CSP violations for legitimate resources
- [ ] HTTPS enforced (HSTS working)
- [ ] Site tested with [securityheaders.com](https://securityheaders.com/)
- [ ] Grade A or higher on security headers scanner
- [ ] X-Frame-Options prevents iframe embedding
- [ ] Referrer policy prevents URL leakage
- [ ] Unnecessary permissions disabled

## Performance Impact

**Overhead**: Negligible
- Headers add ~1-2KB to each response
- Applied at CDN edge (no server processing)
- Cached by browser after first request

**Benefits**:
- Improved security posture
- Compliance with security standards
- Protection against common attacks

## Compliance

### Standards Met

- ✅ **OWASP Top 10**: Protects against A1 (Injection), A7 (XSS)
- ✅ **PCI DSS**: Requirement 6.5.9 (prevent XSS)
- ✅ **NIST 800-53**: SC-28 (protection of information)
- ✅ **GDPR**: Article 32 (security of processing)

### Audit Requirements

For compliance audits:
1. Export headers config (`vercel.json`)
2. Screenshot of [securityheaders.com](https://securityheaders.com/) scan
3. CSP violation reports (if monitoring enabled)
4. Document any exceptions or custom directives

## Evolution & Maintenance

### When to Update CSP

- Adding new third-party services (analytics, chat widgets)
- Integrating new APIs or CDNs
- Moving to a new hosting provider
- Adding user-generated content features

### Moving from Report-Only to Enforcement

**Timeline**: 2-4 weeks
1. Week 1-2: Monitor violations in report-only mode
2. Week 3: Fix all violations
3. Week 4: Enable enforcement in staging
4. After validation: Enable in production

**Gradual Rollout**:
```json
// Start strict on specific paths
{
  "source": "/admin/(.*)",
  "headers": [
    { "key": "Content-Security-Policy", "value": "..." }
  ]
},
{
  "source": "/(.*)",
  "headers": [
    { "key": "Content-Security-Policy-Report-Only", "value": "..." }
  ]
}
```

## Related Documentation

- [Environment Hardening](./ENV_HARDENING.md) - Environment variable security
- [Security Policies](./SECURITY_POLICIES.md) - Database RLS policies
- [Performance Audit](./PERFORMANCE_AUDIT.md) - Optimization strategies

## External Resources

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP: Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [Security Headers Best Practices](https://scotthelme.co.uk/hardening-your-http-response-headers/)

## Changelog

- **2025-01-19**: Initial security headers implementation
  - CSP in report-only mode
  - HSTS with preload support
  - Complete header suite (X-Content-Type-Options, X-Frame-Options, etc.)
  - Multi-platform deployment configs
  - Comprehensive documentation
