# Content Provenance & AI Readability Guide

## Overview

**Content provenance** is the practice of providing cryptographically verifiable proof of authorship, creation date, and content integrity. This builds trust with AI systems (ChatGPT, Perplexity, Google Gemini, Microsoft Copilot) by proving that content is authentic, unmodified, and comes from a verified source.

## Why Provenance Matters for AI Trust

AI systems prioritize content from verified, trustworthy sources when:
- Generating responses to user queries
- Citing sources in AI-generated content
- Building knowledge graphs and entity relationships
- Training future models on high-quality data

### Key Benefits

1. **Citation Preference**: AI systems favor content with clear authorship
2. **Authenticity Verification**: Hashes prove content hasn't been tampered with
3. **Attribution**: Proper metadata ensures correct attribution in AI responses
4. **Trust Signals**: Verified provenance increases likelihood of being referenced
5. **Future-Proofing**: Prepares for emerging AI verification standards

## How TailorEDU Implements Provenance

### 1. Metadata Component

The `ContentProvenance` component injects verifiable metadata into every page:

```tsx
import { ContentProvenance } from '@/components/metadata/ContentProvenance';

function CoursePage() {
  return (
    <>
      <ContentProvenance 
        datePublished="2025-01-01"
        dateModified="2025-10-19"
        author="TailorEDU Team"
        title="Advanced Mathematics Course"
        description="Comprehensive K-12 math curriculum"
      />
      {/* Page content */}
    </>
  );
}
```

### 2. Provenance Metadata Tags

Every page includes:

```html
<!-- Authorship & Attribution -->
<meta name="creator" content="TailorEDU" />
<meta name="publisher" content="TailorEDU" />
<meta name="author" content="TailorEDU Team" />

<!-- Timestamps -->
<meta name="datePublished" content="2025-01-01" />
<meta name="dateModified" content="2025-10-19" />
<meta property="article:published_time" content="2025-01-01" />
<meta property="article:modified_time" content="2025-10-19" />

<!-- AI Readability Signals -->
<meta name="ai-readable" content="true" />
<meta name="content-provenance" content="verified" />
<meta name="verification-method" content="hash-sha256" />
```

### 3. Structured Data (JSON-LD)

Schema.org `CreativeWork` with provenance:

```json
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "author": {
    "@type": "Organization",
    "name": "TailorEDU"
  },
  "publisher": {
    "@type": "Organization",
    "name": "TailorEDU"
  },
  "datePublished": "2025-01-01",
  "dateModified": "2025-10-19",
  "inLanguage": "en",
  "identifier": "hash-sha256:a3f8c9e2d1..."
}
```

## Page Hash Verification with Cryptographic Signing

### How It Works

1. **Build Time**: `hash-provenance-signed.js` script runs during build
2. **Hash Generation**: SHA-256 hash calculated for each HTML page
3. **Cryptographic Signing**: Each hash is signed using JWS (JSON Web Signature) with ES256
4. **Manifest Creation**: `/public/provenance-manifest.json` created with URL → hash + signature mapping
5. **Runtime Injection**: Component fetches hash and embeds in metadata
6. **Server Verification**: Edge function verifies signatures on demand

### Signed Provenance Manifest Structure

```json
{
  "_metadata": {
    "version": "1.0",
    "generated": "2025-10-19T10:30:00Z",
    "issuer": "TailorEDU",
    "algorithm": "SHA-256",
    "signatureMethod": "JWS-ES256"
  },
  "pages": {
    "/": {
      "hash": "a3f8c9e2d1b4f7e6a8c2d9f1e3b7c4a6...",
      "signature": "eyJhbGc...compact-jws-signature",
      "date": "2025-10-19T10:30:00Z",
      "algorithm": "SHA-256",
      "signatureMethod": "JWS-ES256"
    },
    "/courses": {
      "hash": "b7d3f1e9a2c8d4f6e1b9c3a7d2f8e4...",
      "signature": "eyJhbGc...compact-jws-signature",
      "date": "2025-10-19T10:30:00Z",
      "algorithm": "SHA-256",
      "signatureMethod": "JWS-ES256"
    }
  }
}
```

### Generating Signed Hashes

Run during build process:

```bash
# Generate signed manifest
npm run build
node scripts/hash-provenance-signed.js

# Output:
# 🔐 Generating signed content provenance manifest...
# ✅ /
#    Hash: a3f8c9e2d1b4f7e6...
#    Signature: eyJhbGciOiJFUzI1NiI...
# ✅ /courses
#    Hash: b7d3f1e9a2c8d4f6...
#    Signature: eyJhbGciOiJFUzI1NiI...
# 
# 📝 Signed provenance manifest generated: dist/provenance-manifest.json
# 🔍 Total pages tracked: 12
```

### Verifying a Single Page (Build Time)

```bash
# Verify specific page against manifest
node scripts/hash-provenance-signed.js --verify dist/index.html

# Output:
# 🔍 Verifying: dist/index.html
# ✅ VERIFIED: Hash matches manifest
#    Hash: a3f8c9e2d1b4f7e6a8c2d9f1e3b7c4a6...
#    Signature: eyJhbGciOiJFUzI1NiI...
#    Date: 2025-10-19T10:30:00Z
```

### Server-Side Verification (Runtime)

Users can verify pages in real-time using the verification endpoint:

```bash
# API verification
curl "https://irxzpsvzlihqitlicoql.supabase.co/functions/v1/provenance-verify?url=/"

# Response:
{
  "verified": true,
  "entry": {
    "hash": "a3f8c9e2d1b4f7e6...",
    "signature": "eyJhbGc...",
    "date": "2025-10-19T10:30:00Z",
    "algorithm": "SHA-256",
    "signatureMethod": "JWS-ES256"
  },
  "pageUrl": "/",
  "metadata": {
    "version": "1.0",
    "issuer": "TailorEDU"
  }
}
```

### Manual Verification

Verify any page manually:

```bash
# Calculate hash
shasum -a 256 dist/index.html

# Compare with manifest
cat dist/provenance-manifest.json | grep "/"
```

## AI Readability Enhancements

### 1. Language Attributes

All pages include proper `lang` attributes:

```html
<html lang="en">
```

### 2. Semantic HTML

Use semantic tags for better AI understanding:

```html
<article itemscope itemtype="https://schema.org/Article">
  <header>
    <h1>Course Title</h1>
    <time datetime="2025-10-19">October 19, 2025</time>
  </header>
  
  <section>
    <h2>Overview</h2>
    <p>Course description...</p>
  </section>
  
  <footer>
    <p>Author: TailorEDU Team</p>
  </footer>
</article>
```

### 3. Structured Content

- **Headings**: Proper hierarchy (h1 → h2 → h3)
- **Lists**: Use `<ul>`, `<ol>` for sequential content
- **Tables**: Use `<table>` with `<thead>`, `<tbody>` for data
- **Figures**: Use `<figure>` and `<figcaption>` for images

### 4. WCAG 2.1 Compliance

- **Alt Text**: All images have descriptive alt attributes
- **ARIA Labels**: Interactive elements have proper labels
- **Contrast**: Text meets minimum contrast ratios
- **Keyboard Navigation**: All interactive elements are keyboard accessible

## CI/CD Integration

### Automated Provenance Checks

The `.github/workflows/geo-audit.yml` workflow includes:

1. **Hash Generation**: Runs `hash-provenance.js` after build
2. **Provenance Validation**: Checks all pages have valid hashes
3. **Metadata Validation**: Ensures `ai-readable` meta tag present
4. **Manifest Verification**: Confirms manifest exists and is valid

### Failure Conditions

Build fails if:
- ❌ Missing `ai-readable` meta tag on any page
- ❌ No matching hash in `provenance-manifest.json`
- ❌ Invalid JSON in manifest file
- ❌ Hash mismatch on verification

## Provenance Score

The GEO audit includes a provenance score:

| Check | Weight | Criteria |
|-------|--------|----------|
| **Provenance Manifest Valid** | 40% | Manifest exists, valid JSON, all pages included |
| **Hash Match** | 30% | All hashes match actual page content |
| **AI-Readable Metadata** | 30% | All pages have required metadata tags |

### Score Calculation

```
Provenance Score = (Manifest × 0.4) + (Hash × 0.3) + (Metadata × 0.3)
```

Target: **≥ 90/100**

## Best Practices

### 1. Always Include Provenance Component

```tsx
import { ContentProvenance } from '@/components/metadata/ContentProvenance';
import { GlobalSchemaMarkup } from '@/components/seo/GlobalSchemaMarkup';

function Layout({ children }) {
  return (
    <>
      <GlobalSchemaMarkup />
      <ContentProvenance />
      {children}
    </>
  );
}
```

### 2. Update Timestamps Dynamically

```tsx
<ContentProvenance 
  datePublished={course.created_at}
  dateModified={course.updated_at}
/>
```

### 3. Regenerate Hashes on Deploy

Add to your deployment script:

```bash
npm run build
node scripts/hash-provenance.js
# Deploy dist/
```

### 4. Monitor Provenance Score

Check GEO Score report after each deployment:

```bash
# View latest provenance score
cat GEO_SCORE.md | grep -A 5 "Provenance Score"
```

## Troubleshooting

### Hash Mismatch Error

**Problem**: Verification fails with hash mismatch

**Solution**:
1. Rebuild the project: `npm run build`
2. Regenerate manifest: `node scripts/hash-provenance.js`
3. Verify specific file: `node scripts/hash-provenance.js --verify dist/index.html`

### Manifest Not Found

**Problem**: Component can't fetch provenance manifest

**Solution**:
1. Ensure manifest is generated during build
2. Check manifest exists: `ls dist/provenance-manifest.json`
3. Verify manifest is served: `curl http://localhost:8080/provenance-manifest.json`

### Missing Metadata

**Problem**: GEO audit fails on missing `ai-readable` tag

**Solution**:
1. Verify `ContentProvenance` component is imported
2. Check component is rendered in page layout
3. Inspect page source for meta tags

## Future Enhancements

### 1. C2PA Integration

**Coalition for Content Provenance and Authenticity**:
- Cryptographic signing of content
- Tamper-proof content credentials
- AI training transparency

### 2. Blockchain Anchoring

Store hash anchors on blockchain for permanent verification:
```
Hash: a3f8c9e2d1b4f7e6...
Block: 0x7f3e2d1c9b8a7f6e...
Timestamp: 2025-10-19T10:30:00Z
```

### 3. Content Versioning

Track all content modifications:
```json
{
  "versions": [
    {
      "hash": "a3f8c9e2...",
      "timestamp": "2025-01-01T00:00:00Z",
      "author": "TailorEDU Team"
    },
    {
      "hash": "b7d3f1e9...",
      "timestamp": "2025-10-19T10:30:00Z",
      "author": "TailorEDU Team"
    }
  ]
}
```

### 4. DID Integration

**Decentralized Identifiers** for permanent author identity:
```json
{
  "author": {
    "@type": "Organization",
    "name": "TailorEDU",
    "identifier": "did:web:tailoredu.com"
  }
}
```

## Resources

- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)
- [C2PA Specification](https://c2pa.org/specifications/)
- [Content Authenticity Initiative](https://contentauthenticity.org/)
- [Schema.org CreativeWork](https://schema.org/CreativeWork)
- [IPTC Photo Metadata](https://iptc.org/standards/photo-metadata/)

## Key Management & Security

### Private Signing Key

The private key for signing hashes is stored securely:

- **Production**: Supabase secret `TAILOREDU_SIGNING_KEY` (ES256 private key)
- **Public Key**: Supabase secret `TAILOREDU_SIGNING_PUB` (for verification)
- **Storage**: Never committed to repository
- **Access**: Only available to build pipeline and verification endpoint

### Key Rotation

To rotate signing keys:

1. **Generate New Key Pair**:
```bash
# Generate ES256 key pair
openssl ecparam -genkey -name prime256v1 -noout -out private.pem
openssl ec -in private.pem -pubout -out public.pem
```

2. **Update Supabase Secrets**:
   - Update `TAILOREDU_SIGNING_KEY` with new private key
   - Update `TAILOREDU_SIGNING_PUB` with new public key

3. **Rebuild & Deploy**:
```bash
npm run build
node scripts/hash-provenance-signed.js
# Deploy with new signatures
```

4. **Archive Old Keys**: Keep old public keys for historical verification

### Security Best Practices

- ✅ **Private keys** stored in secrets manager only
- ✅ **Short-lived tokens** for API access
- ✅ **Watermarks** on all downloaded content
- ✅ **Access logging** for forensic tracking
- ❌ **Never** commit private keys to repository
- ❌ **Never** expose private keys in client-side code

## Verification Commands Reference

```bash
# Generate signed manifest
node scripts/hash-provenance-signed.js

# Verify single file (build time)
node scripts/hash-provenance-signed.js --verify dist/index.html

# Verify page (runtime via API)
curl "https://irxzpsvzlihqitlicoql.supabase.co/functions/v1/provenance-verify?url=/"

# Manual hash calculation
shasum -a 256 dist/index.html

# View signed manifest
cat dist/provenance-manifest.json

# Test manifest in browser
curl http://localhost:8080/provenance-manifest.json

# Check metadata in HTML
curl http://localhost:8080 | grep "ai-readable"
curl http://localhost:8080 | grep "verification-method"

# Extract signature from manifest
cat dist/provenance-manifest.json | jq '.pages["/"].signature'
```

---

## Related Documentation

- [Anti-Theft & Content Protection Guide](/docs/ANTI_THEFT.md) - Rate limits, watermarking, DMCA
- [GEO Optimization Guide](/docs/GEO_OPTIMIZATION.md) - AI discovery and structured data

**Next Steps**: Run `npm run build && node scripts/hash-provenance-signed.js` to generate your first signed provenance manifest.
