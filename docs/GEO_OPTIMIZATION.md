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

---

## Structured Data Implementation in TailorEDU

TailorEDU uses a modular, React-based system for dynamically injecting schema.org JSON-LD into every page.

### Architecture Overview

```
src/components/seo/
  ├── SchemaMarkup.tsx          # Reusable component for JSON-LD injection
  └── GlobalSchemaMarkup.tsx    # Organization-level schema

src/utils/
  └── schemaGenerators.ts       # Schema type generators

src/hooks/
  ├── useClassSchema.ts         # Dynamic Course schema from Supabase
  └── useBreadcrumbSchema.ts    # Auto-generated breadcrumbs
```

### Core Components

#### 1. SchemaMarkup Component

The base component that injects structured data into `<head>`:

```tsx
import { Helmet } from 'react-helmet';

export const SchemaMarkup = ({ json }) => (
  <Helmet>
    <script type="application/ld+json">
      {JSON.stringify(json)}
    </script>
  </Helmet>
);
```

**Usage:**
```tsx
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { generateCourseSchema } from '@/utils/schemaGenerators';

function ClassPage({ classData }) {
  const schema = generateCourseSchema({
    id: classData.id,
    name: classData.name,
    description: classData.description,
    instructor: { name: classData.teacher_name }
  });

  return (
    <>
      <SchemaMarkup json={schema} />
      {/* Page content */}
    </>
  );
}
```

#### 2. Schema Generators

Pre-built generators for common schema types:

**Organization Schema:**
```tsx
import { generateOrganizationSchema } from '@/utils/schemaGenerators';

const orgSchema = generateOrganizationSchema({
  name: 'TailorEDU',
  description: 'Personalized K-12 education platform',
  sameAs: [
    'https://twitter.com/tailoredu',
    'https://linkedin.com/company/tailoredu',
    'https://github.com/tailoredu'
  ]
});
```

**Course Schema (with Supabase data):**
```tsx
import { useClassSchema } from '@/hooks/useClassSchema';

function ClassDetailPage({ classId }) {
  const courseSchema = useClassSchema(classId);

  return (
    <>
      {courseSchema && <SchemaMarkup json={courseSchema} />}
      {/* Page content */}
    </>
  );
}
```

**Person Schema (for teachers):**
```tsx
import { generatePersonSchema } from '@/utils/schemaGenerators';

const teacherSchema = generatePersonSchema({
  name: 'Dr. Jane Smith',
  jobTitle: 'Math Instructor',
  affiliation: 'TailorEDU',
  email: 'jane.smith@tailoredu.com'
});
```

**BreadcrumbList (automatic):**
```tsx
import { useBreadcrumbSchema } from '@/hooks/useBreadcrumbSchema';

function Layout() {
  const breadcrumbSchema = useBreadcrumbSchema(); // Auto-generated from URL

  return (
    <>
      {breadcrumbSchema && <SchemaMarkup json={breadcrumbSchema} />}
      {/* Layout content */}
    </>
  );
}
```

#### 3. Dynamic Data Integration

**Fetching real data from Supabase:**

The `useClassSchema` hook demonstrates pulling live data:

```tsx
// src/hooks/useClassSchema.ts
export const useClassSchema = (classId) => {
  const { data } = useQuery({
    queryKey: ['class-schema', classId],
    queryFn: async () => {
      // Fetch class and teacher data
      const { data: classInfo } = await supabase
        .from('classes')
        .select('id, name, description, subject, teacher_id')
        .eq('id', classId)
        .maybeSingle();

      // Fetch teacher profile
      const { data: teacher } = await supabase
        .from('teacher_profiles')
        .select('user_id')
        .eq('id', classInfo.teacher_id)
        .maybeSingle();

      // Generate schema with real data
      return generateCourseSchema({
        id: classInfo.id,
        name: classInfo.name,
        description: classInfo.description,
        instructor: { name: teacher.full_name }
      });
    }
  });

  return data;
};
```

**Graceful fallbacks:**

All generators support optional props with sensible defaults:

```tsx
// Minimal usage (uses defaults)
const schema = generateOrganizationSchema();

// Full customization
const schema = generateOrganizationSchema({
  name: 'Custom Name',
  logo: 'https://example.com/logo.png',
  sameAs: ['https://twitter.com/example']
});
```

### Implementation Examples

#### Example 1: Organization Schema (Global)

Added to `App.tsx` for site-wide coverage:

```tsx
import { GlobalSchemaMarkup } from '@/components/seo/GlobalSchemaMarkup';

export default function App() {
  return (
    <BrowserRouter>
      <GlobalSchemaMarkup />
      <Routes>
        {/* All routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

#### Example 2: Course Schema (Class Pages)

Dynamically generated for each class:

```tsx
import { useClassSchema } from '@/hooks/useClassSchema';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';

export function ClassDetailPage({ classId }) {
  const courseSchema = useClassSchema(classId);

  return (
    <div>
      {courseSchema && <SchemaMarkup json={courseSchema} />}
      <h1>Class Details</h1>
      {/* Rest of the page */}
    </div>
  );
}
```

#### Example 3: Multiple Schemas

You can render multiple schema types on a single page:

```tsx
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { 
  generateCourseSchema, 
  generatePersonSchema,
  generateBreadcrumbSchema 
} from '@/utils/schemaGenerators';

export function LessonPage({ lesson, teacher }) {
  const schemas = [
    generateCourseSchema({
      id: lesson.course_id,
      name: lesson.title,
      instructor: { name: teacher.name }
    }),
    generatePersonSchema({
      name: teacher.name,
      jobTitle: 'Instructor',
      affiliation: 'TailorEDU'
    }),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Courses', url: '/courses' },
      { name: lesson.title, url: `/lessons/${lesson.id}` }
    ])
  ];

  return (
    <>
      <SchemaMarkup json={schemas} />
      {/* Page content */}
    </>
  );
}
```

### Validation & Testing

#### Automated CI Validation

Every commit triggers schema validation via `.github/workflows/geo-audit.yml`:

```yaml
- name: Validate schema.org markup
  run: node scripts/schema-validate.js
```

The validation script (`scripts/schema-validate.js`) checks:
- ✅ All required properties present
- ✅ Valid JSON-LD syntax
- ✅ Correct @context and @type
- ✅ Schema diversity (multiple types)
- ✅ Entity consistency (sameAs links)

#### Manual Testing Tools

**Google Rich Results Test:**
```bash
# Test a specific URL
https://search.google.com/test/rich-results?url=YOUR_URL
```

**Schema.org Validator:**
```bash
# Validate JSON-LD structure
https://validator.schema.org/
```

**Local Validation:**
```bash
# Run validation script locally
npm run build
npx serve -s dist -l 8080 &
node scripts/schema-validate.js
```

### Best Practices

1. **Always include Organization schema** on every page (via GlobalSchemaMarkup)
2. **Use dynamic data** from Supabase when available (useClassSchema, etc.)
3. **Provide fallbacks** for when data isn't available (default instructor names, etc.)
4. **Validate regularly** using CI/CD pipeline and manual tools
5. **Keep schemas DRY** by using generator functions instead of hardcoding JSON-LD
6. **Test with real AI systems** (ChatGPT, Perplexity) to verify discoverability

### Troubleshooting

**Schema not appearing in Rich Results Test?**
- Verify build output includes `<script type="application/ld+json">` in HTML
- Check that react-helmet is properly rendering to `<head>`
- Ensure no JSON syntax errors (run schema-validate.js)

**Multiple schemas conflicting?**
- Use array syntax in SchemaMarkup: `<SchemaMarkup json={[schema1, schema2]} />`
- Ensure each schema has unique @id if applicable

**Supabase query failing?**
- Check RLS policies allow reading class/teacher data
- Use .maybeSingle() instead of .single() to gracefully handle missing data
- Always provide fallback values

---

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
