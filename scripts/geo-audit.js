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

// Check provenance manifest validity
function checkProvenanceManifest() {
  const path = require('path');
  const manifestPath = path.join(process.cwd(), 'dist', 'provenance-manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    return { score: 0, status: '❌', notes: 'Provenance manifest not found' };
  }
  
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const pageCount = Object.keys(manifest).length;
    
    if (pageCount === 0) {
      return { score: 30, status: '⚠️', notes: 'Manifest exists but is empty' };
    }
    
    // Validate hash format (should be 64 hex characters for SHA-256)
    const hashes = Object.values(manifest);
    const validHashes = hashes.filter(h => /^[a-f0-9]{64}$/i.test(h));
    const validityPercent = (validHashes.length / hashes.length) * 100;
    
    if (validityPercent === 100) {
      return { score: 100, status: '✅', notes: `Valid manifest with ${pageCount} pages tracked` };
    } else {
      return { score: 60, status: '⚠️', notes: `${validHashes.length}/${hashes.length} valid hashes` };
    }
  } catch (error) {
    return { score: 20, status: '❌', notes: `Manifest invalid: ${error.message}` };
  }
}

// Check hash matches for current page
async function checkHashMatch(html) {
  const crypto = require('crypto');
  const path = require('path');
  const manifestPath = path.join(process.cwd(), 'dist', 'provenance-manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    return { score: 0, status: '❌', notes: 'Cannot verify without manifest' };
  }
  
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const indexPath = path.join(process.cwd(), 'dist', 'index.html');
    
    if (!fs.existsSync(indexPath)) {
      return { score: 0, status: '❌', notes: 'index.html not found' };
    }
    
    const actualContent = fs.readFileSync(indexPath, 'utf8');
    const actualHash = crypto.createHash('sha256').update(actualContent).digest('hex');
    const expectedHash = manifest['/'];
    
    if (!expectedHash) {
      return { score: 30, status: '⚠️', notes: 'Root page not in manifest' };
    }
    
    if (actualHash === expectedHash) {
      return { score: 100, status: '✅', notes: 'Hash verified successfully' };
    } else {
      return { score: 0, status: '❌', notes: 'Hash mismatch detected' };
    }
  } catch (error) {
    return { score: 20, status: '❌', notes: `Verification error: ${error.message}` };
  }
}

// Check AI-readable metadata
function checkAIReadableMetadata(html) {
  const requiredMeta = {
    'ai-readable': /<meta[^>]*name=["']ai-readable["'][^>]*content=["']true["'][^>]*>/i.test(html),
    'content-provenance': /<meta[^>]*name=["']content-provenance["'][^>]*>/i.test(html),
    'verification-method': /<meta[^>]*name=["']verification-method["'][^>]*>/i.test(html),
    'dateModified': /<meta[^>]*name=["']dateModified["'][^>]*>/i.test(html),
    'creator': /<meta[^>]*name=["']creator["'][^>]*>/i.test(html)
  };
  
  const foundCount = Object.values(requiredMeta).filter(Boolean).length;
  const totalCount = Object.keys(requiredMeta).length;
  const percentage = (foundCount / totalCount) * 100;
  
  const missingTags = Object.entries(requiredMeta)
    .filter(([_, found]) => !found)
    .map(([tag, _]) => tag);
  
  if (percentage === 100) {
    return { score: 100, status: '✅', notes: 'All AI-readable metadata present' };
  } else if (percentage >= 60) {
    return { score: percentage, status: '⚠️', notes: `Missing: ${missingTags.join(', ')}` };
  } else {
    return { score: percentage, status: '❌', notes: `Only ${foundCount}/${totalCount} metadata tags found` };
  }
}

// Calculate overall GEO score
function calculateGEOScore(checks) {
  const weights = {
    schema: 0.25,
    authorship: 0.15,
    openGraph: 0.15,
    canonical: 0.10,
    context: 0.15,
    provenance: 0.20
  };
  
  const score = (
    checks.schema.score * weights.schema +
    checks.authorship.score * weights.authorship +
    checks.openGraph.score * weights.openGraph +
    checks.canonical.score * weights.canonical +
    checks.context.score * weights.context +
    (checks.provenance?.score || 0) * weights.provenance
  );
  
  return Math.round(score);
}

// Calculate provenance score
function calculateProvenanceScore(checks) {
  const weights = {
    manifest: 0.4,
    hash: 0.3,
    metadata: 0.3
  };
  
  const score = (
    checks.manifest.score * weights.manifest +
    checks.hash.score * weights.hash +
    checks.metadata.score * weights.metadata
  );
  
  return Math.round(score);
}

// Generate markdown report
function generateReport(checks, geoScore, provenanceScore) {
  const grade = geoScore >= 90 ? '🏆 Excellent' : 
                geoScore >= 75 ? '✅ Good' : 
                geoScore >= 60 ? '⚠️ Needs Improvement' : 
                '❌ Poor';
  
  const provenanceGrade = provenanceScore >= 90 ? '✅' : 
                          provenanceScore >= 60 ? '⚠️' : '❌';
  
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

## Provenance Score: ${provenanceScore}/100 ${provenanceGrade}

| Check | Status | Notes |
|-------|--------|-------|
| Provenance manifest valid | ${checks.provenance.manifest.status} | ${checks.provenance.manifest.notes} |
| Hash match | ${checks.provenance.hash.status} | ${checks.provenance.hash.notes} |
| AI-readable metadata present | ${checks.provenance.metadata.status} | ${checks.provenance.metadata.notes} |

## Score Breakdown

### Core GEO Components
- **Schema.org (25%):** ${checks.schema.score}/100
- **Authorship (15%):** ${checks.authorship.score}/100
- **OpenGraph (15%):** ${checks.openGraph.score}/100
- **Canonical (10%):** ${checks.canonical.score}/100
- **Context (15%):** ${checks.context.score}/100
- **Provenance (20%):** ${checks.provenance.score}/100

### Provenance Components
- **Manifest (40%):** ${checks.provenance.manifest.score}/100
- **Hash Match (30%):** ${checks.provenance.hash.score}/100
- **Metadata (30%):** ${checks.provenance.metadata.score}/100

## Recommendations

${geoScore < 90 ? `
### Priority Actions
${checks.schema.score < 90 ? '- Add comprehensive schema.org JSON-LD markup for Organization, Course, and Person types\n' : ''}
${checks.authorship.score < 90 ? '- Improve author and organization transparency with meta tags and About page\n' : ''}
${checks.openGraph.score < 90 ? '- Complete OpenGraph and Twitter Card metadata\n' : ''}
${checks.canonical.score < 90 ? '- Add canonical and alternate link tags\n' : ''}
${checks.context.score < 90 ? '- Add entity consistency with sameAs links to verified profiles\n' : ''}
${checks.provenance.score < 90 ? '- Implement content provenance with hash verification and AI-readable metadata\n' : ''}
` : '✅ Site is well-optimized for Generative Engine Optimization!'}

${provenanceScore < 90 ? `
### Provenance Improvements
${checks.provenance.manifest.score < 90 ? '- Generate provenance manifest: \`node scripts/hash-provenance.js\`\n' : ''}
${checks.provenance.hash.score < 90 ? '- Verify hash integrity matches manifest\n' : ''}
${checks.provenance.metadata.score < 90 ? '- Add ContentProvenance component to all pages\n' : ''}
` : ''}

See \`docs/GEO_OPTIMIZATION.md\` and \`docs/PROVENANCE_AND_AI_READABILITY.md\` for detailed guidance.

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
    
    // Run core checks
    const coreChecks = {
      schema: checkSchemaOrgData(html),
      authorship: checkAuthorship(html),
      openGraph: checkOpenGraph(html),
      canonical: checkCanonical(html),
      context: checkContextConsistency(html)
    };
    
    // Run provenance checks
    const provenanceChecks = {
      manifest: checkProvenanceManifest(),
      hash: await checkHashMatch(html),
      metadata: checkAIReadableMetadata(html)
    };
    
    const provenanceScore = calculateProvenanceScore(provenanceChecks);
    
    const checks = {
      ...coreChecks,
      provenance: {
        score: provenanceScore,
        ...provenanceChecks
      }
    };
    
    const geoScore = calculateGEOScore(checks);
    
    console.log('\n📊 GEO Score:', geoScore, '/100');
    console.log('🔐 Provenance Score:', provenanceScore, '/100\n');
    
    const report = generateReport(checks, geoScore, provenanceScore);
    fs.writeFileSync('GEO_SCORE.md', report);
    console.log('✓ Generated GEO_SCORE.md');
    
    const jsonSummary = {
      score: geoScore,
      provenanceScore: provenanceScore,
      timestamp: new Date().toISOString(),
      checks: {
        schema: { score: coreChecks.schema.score, status: coreChecks.schema.status, notes: coreChecks.schema.notes },
        authorship: { score: coreChecks.authorship.score, status: coreChecks.authorship.status, notes: coreChecks.authorship.notes },
        openGraph: { score: coreChecks.openGraph.score, status: coreChecks.openGraph.status, notes: coreChecks.openGraph.notes },
        canonical: { score: coreChecks.canonical.score, status: coreChecks.canonical.status, notes: coreChecks.canonical.notes },
        context: { score: coreChecks.context.score, status: coreChecks.context.status, notes: coreChecks.context.notes },
        provenance: {
          score: provenanceScore,
          manifest: { score: provenanceChecks.manifest.score, status: provenanceChecks.manifest.status, notes: provenanceChecks.manifest.notes },
          hash: { score: provenanceChecks.hash.score, status: provenanceChecks.hash.status, notes: provenanceChecks.hash.notes },
          metadata: { score: provenanceChecks.metadata.score, status: provenanceChecks.metadata.status, notes: provenanceChecks.metadata.notes }
        }
      }
    };
    
    fs.writeFileSync('geo-score.json', JSON.stringify(jsonSummary, null, 2));
    console.log('✓ Generated geo-score.json');
    
    console.log('\n✅ GEO Audit complete!\n');
    
    if (geoScore < 75) {
      console.warn('⚠️  GEO Score below 75. Review recommendations in GEO_SCORE.md\n');
    }
    
    if (provenanceScore < 90) {
      console.warn('⚠️  Provenance Score below 90. See GEO_SCORE.md for improvements\n');
    }
    
    // Exit with error if critical checks fail
    if (geoScore < 60 || provenanceScore < 50) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ GEO Audit failed:', error.message);
    process.exit(1);
  }
}

main();
