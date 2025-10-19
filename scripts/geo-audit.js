#!/usr/bin/env node

/**
 * GEO (Generative Engine Optimization) Audit Script
 * Analyzes site for AI-friendly metadata and structure
 */

const http = require('http');
const fs = require('fs');

const TARGET_URL = 'http://localhost:8080';

// Fetch HTML from the served site
async function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Extract JSON-LD structured data
function checkSchemaOrgData(html) {
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const matches = [...html.matchAll(jsonLdRegex)];
  
  if (matches.length === 0) {
    return { score: 0, status: '❌', notes: 'No schema.org JSON-LD found' };
  }

  const schemas = matches.map(m => {
    try {
      return JSON.parse(m[1]);
    } catch {
      return null;
    }
  }).filter(Boolean);

  const types = schemas.map(s => s['@type']).filter(Boolean);
  const hasOrgOrPerson = types.some(t => ['Organization', 'Person', 'EducationalOrganization'].includes(t));
  const hasCourse = types.some(t => ['Course', 'LearningResource'].includes(t));

  if (hasOrgOrPerson && hasCourse) {
    return { score: 100, status: '✅', notes: `Found ${types.join(', ')} schemas` };
  } else if (hasOrgOrPerson || hasCourse) {
    return { score: 70, status: '⚠️', notes: `Partial schema: ${types.join(', ')}` };
  } else {
    return { score: 40, status: '⚠️', notes: `Schema found but missing key types: ${types.join(', ')}` };
  }
}

// Check author and organization transparency
function checkAuthorship(html) {
  const hasAuthorMeta = /<meta[^>]*name=["']author["'][^>]*>/i.test(html);
  const hasOrgMeta = /<meta[^>]*property=["']og:site_name["'][^>]*>/i.test(html);
  const hasAboutLink = /<a[^>]*href=["'][^"']*about[^"']*["'][^>]*>/i.test(html);
  
  const score = [hasAuthorMeta, hasOrgMeta, hasAboutLink].filter(Boolean).length;
  
  if (score === 3) {
    return { score: 100, status: '✅', notes: 'Author meta, org meta, and About link present' };
  } else if (score >= 2) {
    return { score: 70, status: '⚠️', notes: `${score}/3 transparency indicators found` };
  } else {
    return { score: 30, status: '❌', notes: 'Missing author/organization transparency' };
  }
}

// Check OpenGraph and Twitter Card data
function checkOpenGraph(html) {
  const ogTags = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];
  const twitterTags = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'];
  
  const foundOG = ogTags.filter(tag => 
    new RegExp(`<meta[^>]*property=["']${tag}["'][^>]*>`, 'i').test(html)
  );
  
  const foundTwitter = twitterTags.filter(tag => 
    new RegExp(`<meta[^>]*name=["']${tag}["'][^>]*>`, 'i').test(html)
  );
  
  const ogScore = (foundOG.length / ogTags.length) * 100;
  const twitterScore = (foundTwitter.length / twitterTags.length) * 100;
  const totalScore = (ogScore + twitterScore) / 2;
  
  if (totalScore >= 90) {
    return { score: totalScore, status: '✅', notes: `${foundOG.length}/${ogTags.length} OG, ${foundTwitter.length}/${twitterTags.length} Twitter` };
  } else if (totalScore >= 60) {
    return { score: totalScore, status: '⚠️', notes: `Incomplete: ${foundOG.length}/${ogTags.length} OG, ${foundTwitter.length}/${twitterTags.length} Twitter` };
  } else {
    return { score: totalScore, status: '❌', notes: 'Missing critical OpenGraph/Twitter tags' };
  }
}

// Check canonical and alternate links
function checkCanonical(html) {
  const hasCanonical = /<link[^>]*rel=["']canonical["'][^>]*>/i.test(html);
  const hasAlternate = /<link[^>]*rel=["']alternate["'][^>]*>/i.test(html);
  const hasLangAlternate = /<link[^>]*rel=["']alternate["'][^>]*hreflang=/i.test(html);
  
  if (hasCanonical && (hasAlternate || hasLangAlternate)) {
    return { score: 100, status: '✅', notes: 'Canonical and alternate links present' };
  } else if (hasCanonical) {
    return { score: 80, status: '⚠️', notes: 'Canonical found, but no alternate links' };
  } else {
    return { score: 20, status: '❌', notes: 'Missing canonical link tag' };
  }
}

// Check entity consistency (sameAs, social profiles)
function checkContextConsistency(html) {
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const matches = [...html.matchAll(jsonLdRegex)];
  
  let hasSameAs = false;
  let entityCount = 0;
  
  matches.forEach(m => {
    try {
      const data = JSON.parse(m[1]);
      if (data.sameAs && Array.isArray(data.sameAs) && data.sameAs.length > 0) {
        hasSameAs = true;
        entityCount = data.sameAs.length;
      }
    } catch {}
  });
  
  // Also check for rel=me links (IndieWeb style)
  const relMeLinks = (html.match(/<link[^>]*rel=["']me["'][^>]*>/gi) || []).length;
  
  const totalEntities = entityCount + relMeLinks;
  
  if (hasSameAs || relMeLinks >= 2) {
    return { score: 100, status: '✅', notes: `${totalEntities} entity links found (sameAs/rel=me)` };
  } else if (totalEntities >= 1) {
    return { score: 60, status: '⚠️', notes: `Only ${totalEntities} entity link(s) found` };
  } else {
    return { score: 20, status: '❌', notes: 'No entity consistency indicators (sameAs, rel=me)' };
  }
}

// Calculate overall GEO score
function calculateGEOScore(checks) {
  const weights = {
    schema: 0.3,
    authorship: 0.2,
    openGraph: 0.2,
    canonical: 0.1,
    context: 0.2
  };
  
  const score = (
    checks.schema.score * weights.schema +
    checks.authorship.score * weights.authorship +
    checks.openGraph.score * weights.openGraph +
    checks.canonical.score * weights.canonical +
    checks.context.score * weights.context
  );
  
  return Math.round(score);
}

// Generate markdown report
function generateReport(checks, geoScore) {
  const grade = geoScore >= 90 ? '🏆 Excellent' : 
                geoScore >= 75 ? '✅ Good' : 
                geoScore >= 60 ? '⚠️ Needs Improvement' : 
                '❌ Poor';
  
  return `# GEO Audit Report

**Overall GEO Score: ${geoScore}/100** — ${grade}

## Detailed Checks

| Check | Status | Notes |
|-------|--------|-------|
| Schema.org structured data | ${checks.schema.status} | ${checks.schema.notes} |
| Authorship transparency | ${checks.authorship.status} | ${checks.authorship.notes} |
| OpenGraph completeness | ${checks.openGraph.status} | ${checks.openGraph.notes} |
| Canonical & alternate links | ${checks.canonical.status} | ${checks.canonical.notes} |
| Context consistency | ${checks.context.status} | ${checks.context.notes} |

## Score Breakdown

- **Schema.org (30%):** ${checks.schema.score}/100
- **Authorship (20%):** ${checks.authorship.score}/100
- **OpenGraph (20%):** ${checks.openGraph.score}/100
- **Canonical (10%):** ${checks.canonical.score}/100
- **Context (20%):** ${checks.context.score}/100

## Recommendations

${geoScore < 90 ? `
### Priority Actions
${checks.schema.score < 90 ? '- Add comprehensive schema.org JSON-LD markup for Organization, Course, and Person types\n' : ''}
${checks.authorship.score < 90 ? '- Improve author and organization transparency with meta tags and About page\n' : ''}
${checks.openGraph.score < 90 ? '- Complete OpenGraph and Twitter Card metadata\n' : ''}
${checks.canonical.score < 90 ? '- Add canonical and alternate link tags\n' : ''}
${checks.context.score < 90 ? '- Add entity consistency with sameAs links to verified profiles\n' : ''}
` : '✅ Site is well-optimized for Generative Engine Optimization!'}

See \`docs/GEO_OPTIMIZATION.md\` for detailed guidance.

---
*Generated: ${new Date().toISOString()}*
`;
}

// Main execution
async function main() {
  console.log('🤖 Starting GEO Audit...\n');
  
  try {
    const html = await fetchHTML(TARGET_URL);
    console.log('✓ Fetched HTML from', TARGET_URL);
    
    const checks = {
      schema: checkSchemaOrgData(html),
      authorship: checkAuthorship(html),
      openGraph: checkOpenGraph(html),
      canonical: checkCanonical(html),
      context: checkContextConsistency(html)
    };
    
    const geoScore = calculateGEOScore(checks);
    
    console.log('\n📊 GEO Score:', geoScore, '/100\n');
    
    const report = generateReport(checks, geoScore);
    fs.writeFileSync('GEO_SCORE.md', report);
    console.log('✓ Generated GEO_SCORE.md');
    
    const jsonSummary = {
      score: geoScore,
      timestamp: new Date().toISOString(),
      checks: Object.entries(checks).reduce((acc, [key, val]) => {
        acc[key] = { score: val.score, status: val.status, notes: val.notes };
        return acc;
      }, {})
    };
    
    fs.writeFileSync('geo-score.json', JSON.stringify(jsonSummary, null, 2));
    console.log('✓ Generated geo-score.json');
    
    console.log('\n✅ GEO Audit complete!\n');
    
    if (geoScore < 75) {
      console.warn('⚠️  GEO Score below 75. Review recommendations in GEO_SCORE.md\n');
    }
    
  } catch (error) {
    console.error('❌ GEO Audit failed:', error.message);
    process.exit(1);
  }
}

main();
