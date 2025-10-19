# Anti-Theft & Content Protection Guide

## Overview

TailorEDU implements multi-layered content protection to make pages **machine-readable for AI discovery** while preventing **wholesale content theft**. This guide covers rate limits, watermarking, access controls, and takedown procedures.

---

## Protection Philosophy

**Readable but Not Stealable**

- ✅ **Public Metadata**: AI systems can read structured data, snippets, and provenance
- ✅ **Preview Access**: Short descriptions and summaries are publicly available
- ❌ **Full Content**: Complete lessons, PDFs, and high-res images require authentication
- ❌ **Bulk Export**: Rate limits prevent mass scraping

---

## 1. Content Gating

### Public vs. Protected Content

| Content Type | Public Access | Protected Access |
|--------------|---------------|------------------|
| **Metadata** | ✅ JSON-LD, meta tags, provenance | - |
| **Preview Snippets** | ✅ 160-200 characters | - |
| **Full Lessons** | ❌ | ✅ Requires auth token |
| **PDFs/Documents** | ❌ | ✅ Server-side watermarked |
| **High-Res Images** | ❌ | ✅ Optimized versions only |

### Implementation

```typescript
// Public: Metadata + preview only
<ContentProvenance 
  previewSnippet="Brief overview of the lesson..."
/>

// Protected: Full content via API
const lesson = await fetch('/api/content/lesson-123', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 2. API Rate Limiting

### Per-Key Limits

All API endpoints enforce rate limits to prevent bulk scraping:

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| `/api/content/*` | 60 requests | 1 hour | Lesson access |
| `/api/export/*` | 10 requests | 1 hour | Export/download |
| `/api/provenance/verify` | 100 requests | 1 hour | Verification |

### Rate Limit Headers

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1698765432
```

### Exceeding Limits

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 3600,
  "message": "Too many requests. Please try again in 1 hour."
}
```

---

## 3. Watermarking

### Server-Side Watermarking

All exported assets (PDFs, images, documents) are watermarked with:

- **User ID**: Traceable to the account that downloaded it
- **Timestamp**: When the content was accessed
- **Invisible Markers**: Forensic identifiers for tracking

### PDF Watermarking Example

```typescript
// Watermark applied server-side before download
const watermarkedPdf = await watermarkDocument({
  userId: user.id,
  documentId: lesson.id,
  timestamp: new Date().toISOString(),
  originalPdf: lessonPdf
});
```

### Image Watermarking

- **Display Images**: Optimized, low-res versions for web display
- **Downloaded Images**: Watermarked with user identifier
- **Forensic Tracking**: Hidden metadata for copyright enforcement

```typescript
// Public display: Optimized only
<img src="/api/images/lesson-thumb.jpg" />

// Protected download: Watermarked
<Button onClick={downloadWatermarkedImage}>
  Download Full Resolution
</Button>
```

---

## 4. Access Logging

### Download Tracking

Every content access is logged:

```typescript
{
  userId: "uuid-123",
  contentId: "lesson-456",
  type: "pdf_download",
  timestamp: "2025-10-19T10:30:00Z",
  ipAddress: "203.0.113.42",
  userAgent: "Mozilla/5.0...",
  watermarkId: "wm-abc123"
}
```

### Audit Trail

Administrators can review all content access:

```sql
SELECT * FROM content_access_logs
WHERE content_id = 'lesson-456'
ORDER BY timestamp DESC;
```

---

## 5. Short-Lived Tokens

### Trusted Agent Access

API keys expire automatically:

| Token Type | Validity | Use Case |
|------------|----------|----------|
| **Session Token** | 24 hours | Authenticated users |
| **Download Token** | 5 minutes | Single-use export links |
| **API Key** | 90 days | Third-party integrations |

### Token Generation

```typescript
// Short-lived download token
const token = await generateDownloadToken({
  userId: user.id,
  contentId: lesson.id,
  expiresIn: 300 // 5 minutes
});

// Single-use download URL
const downloadUrl = `/api/export/${lesson.id}?token=${token}`;
```

---

## 6. DMCA & Copyright Policy

### Copyright Notice

All pages include copyright metadata:

```html
<meta name="copyright" content="Copyright © 2025 TailorEDU. All rights reserved." />
<meta name="rights" content="Copyright © 2025 TailorEDU. All rights reserved." />
```

### DMCA Takedown Contact

For copyright infringement reports:

**Email**: [legal@tailoredu.com](mailto:legal@tailoredu.com)

**Required Information**:
- Your contact information
- Description of copyrighted work
- URL of infringing content
- Statement of good faith belief
- Physical or electronic signature

### Takedown Process

1. **Report Received**: Review within 24 hours
2. **Investigation**: Verify claim and check watermark logs
3. **Action**: Remove content or dispute if watermarked to specific user
4. **Notification**: Inform reporting party of action taken
5. **Counter-Notice**: Allow 10-14 days for counter-claims

---

## 7. License & Terms

### Content License

```json
{
  "@type": "CreativeWork",
  "license": "Copyright © 2025 TailorEDU. All rights reserved.",
  "copyrightHolder": {
    "@type": "Organization",
    "name": "TailorEDU"
  },
  "copyrightYear": 2025
}
```

### Terms of Use

- ✅ **Permitted**: Personal use, educational purposes with proper attribution
- ❌ **Prohibited**: Redistribution, commercial use, bulk scraping, content modification

---

## 8. Monitoring & Alerts

### Suspicious Activity Detection

Automated alerts for:

- **High-Volume Downloads**: > 50 lessons/hour
- **Rapid API Calls**: > 100 requests/minute
- **Multiple IPs**: Same user from 5+ IP addresses
- **Bot Detection**: User agents matching known scrapers

### Alert Example

```typescript
{
  alertType: "SUSPICIOUS_DOWNLOAD_VOLUME",
  userId: "uuid-123",
  details: {
    downloadsInHour: 75,
    threshold: 50,
    ipAddresses: ["203.0.113.42", "198.51.100.10"]
  },
  timestamp: "2025-10-19T10:30:00Z",
  action: "RATE_LIMIT_APPLIED"
}
```

---

## 9. Implementation Checklist

### Backend Protection

- [x] Rate limiting on `/api/content/*` endpoints
- [x] Server-side PDF watermarking
- [x] Access logging for all downloads
- [x] Short-lived token generation
- [x] IP-based abuse detection

### Frontend Protection

- [x] Public metadata with preview snippets only
- [x] Auth-gated full content access
- [x] Provenance badge with verification
- [x] Copyright notice in footer
- [ ] Disable right-click on protected images (optional)
- [ ] DevTools detection (optional)

### Legal Compliance

- [x] DMCA contact information
- [x] Copyright notice in metadata
- [x] Terms of service page
- [ ] Privacy policy update (watermarking disclosure)
- [ ] User agreement acknowledgment

---

## 10. Reporting Theft

### Internal Tracking

If watermarked content is found elsewhere:

1. **Identify Watermark**: Extract user ID and timestamp
2. **Review Logs**: Check access history for that user
3. **Contact User**: Inquiry about unauthorized distribution
4. **Enforce Policy**: Suspend account if TOS violation confirmed

### External Takedowns

If stolen content appears on third-party sites:

1. **Document**: Screenshot with timestamp and URL
2. **Check Watermark**: Verify it's TailorEDU content
3. **Send DMCA**: Use contact information above
4. **Follow Up**: Monitor for removal within 14 days

---

## Resources

- [DMCA Guidelines](https://www.copyright.gov/legislation/dmca.pdf)
- [Watermarking Best Practices](https://www.iso.org/standard/52910.html)
- [API Rate Limiting Standards](https://datatracker.ietf.org/doc/html/rfc6585)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

## Support

For questions about content protection:

- **Email**: [security@tailoredu.com](mailto:security@tailoredu.com)
- **Documentation**: [/docs/PROVENANCE_AND_AI_READABILITY.md](/docs/PROVENANCE_AND_AI_READABILITY.md)
- **Legal Inquiries**: [legal@tailoredu.com](mailto:legal@tailoredu.com)
