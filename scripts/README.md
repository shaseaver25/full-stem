# TailorEDU Scripts

This directory contains automation scripts for GEO (Generative Engine Optimization), schema validation, and content provenance.

## Scripts Overview

### `geo-audit.js`
**Purpose**: Comprehensive GEO audit for AI-friendly metadata and structure.

**Usage**:
```bash
npm run build
npx serve -s dist -l 8080 &
node scripts/geo-audit.js
```

**Checks**:
- Schema.org JSON-LD structured data
- Authorship transparency (author meta tags)
- OpenGraph and Twitter Card metadata
- Canonical and alternate link tags
- Entity consistency (sameAs links)
- Content provenance (manifest, hash, AI metadata)

**Outputs**:
- `GEO_SCORE.md` - Detailed markdown report
- `geo-score.json` - JSON summary for CI/CD

**Target Score**: ≥85/100 overall, ≥90/100 provenance

---

### `schema-validate.js`
**Purpose**: Validate schema.org JSON-LD markup for correctness.

**Usage**:
```bash
npm run build
npx serve -s dist -l 8080 &
node scripts/schema-validate.js
```

**Validates**:
- JSON-LD syntax correctness
- Required properties (@context, @type)
- Schema diversity (Organization, Course, Person, etc.)
- Entity consistency across schemas

**Outputs**:
- `schema-validation.json` - Validation results
- Console output with pass/fail status

**Exit Codes**:
- `0` - All validations passed
- `1` - Validation failures detected

---

### `hash-provenance.js`
**Purpose**: Generate SHA-256 hashes for content provenance verification.

**Usage**:

**Generate manifest**:
```bash
npm run build
node scripts/hash-provenance.js
```

**Verify single file**:
```bash
node scripts/hash-provenance.js --verify dist/index.html
```

**Show help**:
```bash
node scripts/hash-provenance.js --help
```

**What it does**:
1. Scans all HTML files in `dist/`
2. Calculates SHA-256 hash for each file
3. Generates `dist/provenance-manifest.json` mapping URLs to hashes
4. Enables runtime verification via ContentProvenance component

**Manifest Format**:
```json
{
  "/": "a3f8c9e2d1b4f7e6a8c2d9f1e3b7c4a6...",
  "/courses": "b7d3f1e9a2c8d4f6e1b9c3a7d2f8e4...",
  "/dashboard": "c4a8e2d9f3b7c1e6a4d8f2b9e3c7a1..."
}
```

**Manual Verification**:
```bash
# Calculate hash manually
shasum -a 256 dist/index.html

# Compare with manifest
cat dist/provenance-manifest.json | grep "/"
```

---

## CI/CD Integration

All scripts run automatically in GitHub Actions workflows:

### `.github/workflows/geo-audit.yml`
```yaml
- name: Build project
  run: npm run build

- name: Generate provenance hashes
  run: node scripts/hash-provenance.js

- name: Start server
  run: serve -s dist -l 8080 &

- name: Run GEO audit
  run: node scripts/geo-audit.js

- name: Validate schema.org markup
  run: node scripts/schema-validate.js

- name: Verify provenance integrity
  run: node scripts/hash-provenance.js --verify dist/index.html
```

**Artifacts Uploaded**:
- `GEO_SCORE.md`
- `geo-score.json`
- `schema-validation.json`
- `dist/provenance-manifest.json`

---

## Development Workflow

### 1. Local Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Make changes to components/pages
```

### 2. Pre-Commit Testing
```bash
# Build for production
npm run build

# Generate provenance manifest
node scripts/hash-provenance.js

# Serve locally
npx serve -s dist -l 8080 &

# Run all audits
node scripts/geo-audit.js
node scripts/schema-validate.js
node scripts/hash-provenance.js --verify dist/index.html
```

### 3. Review Results
```bash
# View GEO score
cat GEO_SCORE.md

# View schema validation
cat schema-validation.json

# View provenance manifest
cat dist/provenance-manifest.json
```

### 4. Fix Issues
Based on audit results, you might need to:

**Low Schema Score**:
- Add SchemaMarkup components to pages
- Use generateOrganizationSchema, generateCourseSchema, etc.

**Low Authorship Score**:
- Add author meta tags
- Create /about page with team info
- Add OpenGraph metadata

**Low Provenance Score**:
- Add ContentProvenance component to pages
- Regenerate hash manifest
- Ensure ai-readable meta tag is present

---

## Common Issues & Solutions

### Issue: Hash Mismatch
**Problem**: Verification fails with hash mismatch

**Solution**:
```bash
# Clean build
rm -rf dist/
npm run build

# Regenerate manifest
node scripts/hash-provenance.js

# Verify
node scripts/hash-provenance.js --verify dist/index.html
```

### Issue: Missing Manifest
**Problem**: `provenance-manifest.json not found`

**Solution**:
```bash
# Ensure build exists
npm run build

# Generate manifest
node scripts/hash-provenance.js

# Confirm creation
ls dist/provenance-manifest.json
```

### Issue: Schema Validation Fails
**Problem**: JSON-LD syntax errors or missing properties

**Solution**:
```bash
# Check schema in browser dev tools
# Look for <script type="application/ld+json">

# Validate JSON-LD manually
# Copy JSON-LD content to https://validator.schema.org/

# Fix component
# Update SchemaMarkup usage or generator functions
```

### Issue: Low GEO Score
**Problem**: Overall GEO score below 85

**Solution**:
1. Review `GEO_SCORE.md` for specific issues
2. Check documentation:
   - `docs/GEO_OPTIMIZATION.md`
   - `docs/PROVENANCE_AND_AI_READABILITY.md`
   - `docs/SCHEMA_IMPLEMENTATION.md`
3. Implement recommended fixes
4. Re-run audit to verify improvements

---

## Score Targets

| Metric | Target | Weight |
|--------|--------|--------|
| **Overall GEO Score** | ≥85/100 | - |
| Schema.org | ≥90/100 | 25% |
| Authorship | ≥90/100 | 15% |
| OpenGraph | ≥90/100 | 15% |
| Canonical | ≥90/100 | 10% |
| Context | ≥90/100 | 15% |
| **Provenance** | ≥90/100 | 20% |

### Provenance Components
| Component | Target | Weight |
|-----------|--------|--------|
| Manifest Valid | 100/100 | 40% |
| Hash Match | 100/100 | 30% |
| AI Metadata | 100/100 | 30% |

---

## Advanced Usage

### Custom Hash Verification
```bash
# Verify multiple files
for file in dist/**/*.html; do
  node scripts/hash-provenance.js --verify "$file"
done

# Check manifest integrity
node -e "
  const manifest = require('./dist/provenance-manifest.json');
  const hashes = Object.values(manifest);
  const valid = hashes.every(h => /^[a-f0-9]{64}$/i.test(h));
  console.log('Manifest valid:', valid);
  process.exit(valid ? 0 : 1);
"
```

### Automated Deployment Hook
```bash
#!/bin/bash
# deploy-with-provenance.sh

# Build
npm run build

# Generate provenance
node scripts/hash-provenance.js

# Verify
if ! node scripts/geo-audit.js; then
  echo "❌ GEO audit failed. Fix issues before deploying."
  exit 1
fi

# Deploy
# ... your deployment commands ...
```

---

## Resources

- [GEO Optimization Guide](../docs/GEO_OPTIMIZATION.md)
- [Provenance & AI Readability](../docs/PROVENANCE_AND_AI_READABILITY.md)
- [Schema Implementation Guide](../docs/SCHEMA_IMPLEMENTATION.md)
- [Schema.org Validator](https://validator.schema.org/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [OpenGraph Debugger](https://www.opengraph.xyz/)

---

## Contributing

When adding new scripts:
1. Add JSDoc comments explaining purpose and usage
2. Include `--help` flag support
3. Provide clear error messages
4. Update this README
5. Add to CI/CD workflow if applicable
6. Test locally before committing

---

**Questions?** See our [GEO Audit workflow](../.github/workflows/geo-audit.yml) or check the [GEO Score Report](../GEO_SCORE.md).
