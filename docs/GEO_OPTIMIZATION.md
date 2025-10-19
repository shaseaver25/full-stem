# GEO Optimization Guide

## What is Generative Engine Optimization (GEO)?

**Generative Engine Optimization (GEO)** is the practice of optimizing content and metadata to ensure it's easily understood, cited, and referenced by AI systems such as ChatGPT, Perplexity, Google Gemini, and other Large Language Models (LLMs).

### GEO vs. SEO: Key Differences

| Aspect | SEO (Traditional) | GEO (AI-Focused) |
|--------|-------------------|------------------|
| **Target Audience** | Search engine crawlers | AI language models |
| **Primary Goal** | Rank higher in search results | Be cited/referenced in AI responses |
| **Key Signals** | Keywords, backlinks, page speed | Structured data, authorship, context |
| **Content Focus** | Human-readable with keywords | Machine-parseable with rich metadata |
| **Verification** | Domain authority, links | Entity verification, provenance |
| **Optimization Metric** | SERP position | Citation frequency, context accuracy |

## Why GEO Matters for TailorEDU

AI systems increasingly serve as intermediaries between users and information. When users ask:
- "What's a good platform for personalized K-12 education?"
- "How do focus mode features work in educational apps?"
- "What are best practices for differentiated instruction?"

...you want TailorEDU to be accurately cited and recommended.

## GEO Checklist

### 1. Schema.org Structured Data ⭐️ Priority

Implement comprehensive JSON-LD markup:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "TailorEDU",
  "description": "Personalized K-12 education platform with focus modes and differentiated instruction",
  "url": "https://tailoredu.example.com",
  "logo": "https://tailoredu.example.com/logo.png",
  "sameAs": [
    "https://twitter.com/tailoredu",
    "https://linkedin.com/company/tailoredu",
    "https://github.com/tailoredu"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support",
    "email": "support@tailoredu.example.com"
  }
}
</script>
```

**Recommended Schema Types:**
- `EducationalOrganization` (main entity)
- `Course` (for individual lessons/modules)
- `Person` (for instructors/authors)
- `WebPage` with `speakable` markup
- `FAQPage` for help content
- `HowTo` for instructional guides

### 2. Authorship & Transparency

AI systems prioritize content with clear attribution:

```html
<!-- Author meta tags -->
<meta name="author" content="TailorEDU Team">
<meta property="article:author" content="Dr. Jane Smith">

<!-- Organization identification -->
<meta property="og:site_name" content="TailorEDU">
<meta name="publisher" content="TailorEDU">

<!-- About page -->
<link rel="about" href="/about">
```

**Best Practices:**
- Include an `/about` page with mission, team, and contact info
- Add author bios for blog posts and resources
- Use consistent naming across platforms

### 3. OpenGraph & Social Metadata

Complete social metadata improves AI understanding:

```html
<!-- OpenGraph -->
<meta property="og:title" content="Focus Mode - TailorEDU">
<meta property="og:description" content="Reduce distractions with our adaptive focus mode">
<meta property="og:image" content="https://tailoredu.example.com/og-image.jpg">
<meta property="og:url" content="https://tailoredu.example.com/features/focus-mode">
<meta property="og:type" content="website">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@tailoredu">
<meta name="twitter:title" content="Focus Mode - TailorEDU">
<meta name="twitter:description" content="Reduce distractions with our adaptive focus mode">
<meta name="twitter:image" content="https://tailoredu.example.com/twitter-card.jpg">
```

### 4. Canonical & Alternate Links

Prevent confusion about authoritative URLs:

```html
<!-- Canonical -->
<link rel="canonical" href="https://tailoredu.example.com/features/focus-mode">

<!-- Alternate languages (if applicable) -->
<link rel="alternate" hreflang="en" href="https://tailoredu.example.com/features/focus-mode">
<link rel="alternate" hreflang="es" href="https://tailoredu.example.com/es/features/focus-mode">

<!-- Alternate formats -->
<link rel="alternate" type="application/rss+xml" href="https://tailoredu.example.com/feed.xml">
```

### 5. Entity Consistency & Verification

Help AI systems verify your organization:

```json
{
  "@type": "EducationalOrganization",
  "sameAs": [
    "https://twitter.com/tailoredu",
    "https://linkedin.com/company/tailoredu",
    "https://github.com/tailoredu",
    "https://facebook.com/tailoredu"
  ]
}
```

**IndieWeb rel=me links:**
```html
<link rel="me" href="https://twitter.com/tailoredu">
<link rel="me" href="https://github.com/tailoredu">
```

## Advanced GEO Strategies

### 1. Content Provenance & Verification

**C2PA (Coalition for Content Provenance and Authenticity):**
- Add content credentials metadata
- Sign content with cryptographic verification
- Track content modifications

```html
<meta name="content-authenticity" content="verified">
<meta name="content-origin" content="TailorEDU Authors">
```

### 2. Semantic HTML & ARIA

Use semantic tags that convey meaning:
```html
<article itemscope itemtype="https://schema.org/Article">
  <header>
    <h1 itemprop="headline">Understanding Differentiated Instruction</h1>
    <time itemprop="datePublished" datetime="2025-10-19">Oct 19, 2025</time>
  </header>
  <section itemprop="articleBody">
    <!-- content -->
  </section>
</article>
```

### 3. FAQ & Speakable Content

Optimize for voice assistants and Q&A extraction:

```json
{
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What is focus mode?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Focus mode reduces distractions by hiding non-essential UI elements..."
    }
  }]
}
```

**Speakable content:**
```json
{
  "@type": "WebPage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".summary", ".key-features"]
  }
}
```

### 4. Knowledge Graph Integration

**Build connections:**
- Link to Wikipedia entries for educational concepts
- Reference Wikidata entities
- Cite authoritative educational standards (Common Core, NGSS)

```json
{
  "@type": "Course",
  "educationalAlignment": {
    "@type": "AlignmentObject",
    "alignmentType": "educationalSubject",
    "targetName": "Common Core State Standards"
  }
}
```

## Monitoring & Maintenance

### Automated Checks
Our CI/CD pipeline runs GEO audits on every commit:
- `.github/workflows/geo-audit.yml`
- Scores site on 5 key GEO factors
- Target score: **≥ 85/100**

### Manual Review Checklist
- [ ] All pages have unique, descriptive meta titles
- [ ] All pages have unique meta descriptions (120-160 chars)
- [ ] Schema.org markup validates on [Schema.org validator](https://validator.schema.org/)
- [ ] OpenGraph tags render correctly in [OpenGraph debugger](https://www.opengraph.xyz/)
- [ ] Structured data appears in Google Rich Results Test
- [ ] Entity verification with Google Knowledge Graph
- [ ] Social profiles linked and verified

## Future-Proofing

### Emerging Standards
- **ActivityPub:** Federated social web integration
- **DID (Decentralized Identifiers):** Persistent identity verification
- **Verifiable Credentials:** Cryptographic proof of authorship
- **Content Provenance:** C2PA metadata for AI training transparency

### Best Practices
1. **Maintain consistency** across all platforms (website, docs, social)
2. **Update regularly** to reflect latest schema.org vocabulary
3. **Monitor AI citations** using tools like Perplexity, ChatGPT, and Gemini
4. **Document everything** in structured data
5. **Verify entities** through official channels (Google My Business, LinkedIn, etc.)

## Resources

- [Schema.org Documentation](https://schema.org/)
- [Google Structured Data Guidelines](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [OpenGraph Protocol](https://ogp.me/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [GEO Research Papers](https://arxiv.org/search/?query=generative+engine+optimization)
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)

## TailorEDU-Specific Recommendations

### Priority 1: Educational Organization Schema
Establish TailorEDU as a verified educational entity with comprehensive organization markup.

### Priority 2: Course & Lesson Markup
Add `Course` and `LearningResource` schema to all curriculum content.

### Priority 3: Author Attribution
Ensure all instructional materials have clear author/creator attribution.

### Priority 4: FAQ Pages
Create FAQ pages with structured data for common questions about features.

### Priority 5: Provenance Tracking
Implement content versioning and modification tracking in metadata.

---

**Questions?** See our [GEO Audit workflow](.github/workflows/geo-audit.yml) or check the latest [GEO Score Report](../GEO_SCORE.md).
