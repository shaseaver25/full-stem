#!/usr/bin/env node

/**
 * Schema.org JSON-LD Validation Script
 * Validates structured data on TailorEDU pages
 */

const http = require('http');
const fs = require('fs');

const TARGET_URL = 'http://localhost:8080';
const ROUTES_TO_CHECK = [
  '/',
  '/teacher',
  '/student'
];

// Required properties for each schema type
const REQUIRED_PROPERTIES = {
  'EducationalOrganization': ['@context', '@type', 'name', 'url'],
  'Organization': ['@context', '@type', 'name', 'url'],
  'Course': ['@context', '@type', 'name', 'provider'],
  'Person': ['@context', '@type', 'name'],
  'BreadcrumbList': ['@context', '@type', 'itemListElement'],
  'LearningResource': ['@context', '@type', 'name'],
  'WebPage': ['@context', '@type', 'name']
};

async function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractSchemas(html) {
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const matches = [...html.matchAll(jsonLdRegex)];
  
  return matches.map(match => {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      return { error: 'Invalid JSON', raw: match[1] };
    }
  });
}

function validateSchema(schema) {
  const errors = [];
  const warnings = [];

  // Check if schema has error flag
  if (schema.error) {
    errors.push(`JSON parsing failed: ${schema.error}`);
    return { valid: false, errors, warnings };
  }

  // Check required properties
  const type = schema['@type'];
  const requiredProps = REQUIRED_PROPERTIES[type];

  if (!type) {
    errors.push('Missing @type property');
  }

  if (!schema['@context'] || !schema['@context'].includes('schema.org')) {
    errors.push('Missing or invalid @context (must include schema.org)');
  }

  if (requiredProps) {
    requiredProps.forEach(prop => {
      if (!schema[prop]) {
        errors.push(`Missing required property: ${prop}`);
      }
    });
  }

  // Validate specific types
  if (type === 'Course') {
    if (schema.provider && !schema.provider['@type']) {
      warnings.push('Course provider missing @type');
    }
  }

  if (type === 'BreadcrumbList') {
    if (!Array.isArray(schema.itemListElement) || schema.itemListElement.length === 0) {
      errors.push('BreadcrumbList must have at least one item');
    } else {
      schema.itemListElement.forEach((item, index) => {
        if (!item.position || !item.name) {
          errors.push(`Breadcrumb item ${index} missing position or name`);
        }
      });
    }
  }

  if (type === 'EducationalOrganization' || type === 'Organization') {
    if (!schema.sameAs || !Array.isArray(schema.sameAs) || schema.sameAs.length === 0) {
      warnings.push('Organization should have sameAs links for entity consistency');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

async function validateRoute(route) {
  console.log(`\n📄 Validating: ${route}`);
  
  try {
    const html = await fetchHTML(`${TARGET_URL}${route}`);
    const schemas = extractSchemas(html);

    if (schemas.length === 0) {
      console.log('  ⚠️  No schema.org markup found');
      return {
        route,
        found: false,
        valid: false,
        schemas: []
      };
    }

    console.log(`  ✓ Found ${schemas.length} schema(s)`);

    const results = schemas.map((schema, index) => {
      const validation = validateSchema(schema);
      const type = schema['@type'] || 'Unknown';

      console.log(`\n  Schema ${index + 1}: ${type}`);
      
      if (validation.valid) {
        console.log('    ✅ Valid');
      } else {
        console.log('    ❌ Invalid');
        validation.errors.forEach(err => console.log(`      - ${err}`));
      }

      if (validation.warnings.length > 0) {
        console.log('    ⚠️  Warnings:');
        validation.warnings.forEach(warn => console.log(`      - ${warn}`));
      }

      return {
        type,
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings
      };
    });

    return {
      route,
      found: true,
      valid: results.every(r => r.valid),
      schemas: results
    };

  } catch (error) {
    console.log(`  ❌ Error fetching route: ${error.message}`);
    return {
      route,
      found: false,
      valid: false,
      error: error.message
    };
  }
}

async function main() {
  console.log('🔍 Schema.org Validation Tool\n');
  console.log(`Target: ${TARGET_URL}`);
  console.log(`Routes: ${ROUTES_TO_CHECK.join(', ')}\n`);

  const results = [];
  
  for (const route of ROUTES_TO_CHECK) {
    const result = await validateRoute(route);
    results.push(result);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Validation Summary\n');

  const totalRoutes = results.length;
  const routesWithSchema = results.filter(r => r.found).length;
  const validRoutes = results.filter(r => r.valid).length;
  const totalSchemas = results.reduce((sum, r) => sum + (r.schemas?.length || 0), 0);

  console.log(`Total routes checked: ${totalRoutes}`);
  console.log(`Routes with schema: ${routesWithSchema}/${totalRoutes}`);
  console.log(`Routes with valid schema: ${validRoutes}/${totalRoutes}`);
  console.log(`Total schemas found: ${totalSchemas}`);

  const schemaTypes = new Set();
  results.forEach(r => {
    r.schemas?.forEach(s => schemaTypes.add(s.type));
  });
  console.log(`\nSchema types present: ${Array.from(schemaTypes).join(', ')}`);

  // Calculate score (0-100)
  const schemaScore = routesWithSchema / totalRoutes;
  const validityScore = validRoutes / totalRoutes;
  const diversityScore = schemaTypes.size >= 3 ? 1 : schemaTypes.size / 3;
  
  const overallScore = Math.round(
    (schemaScore * 0.4 + validityScore * 0.4 + diversityScore * 0.2) * 100
  );

  console.log(`\n🎯 Schema Validation Score: ${overallScore}/100`);

  // Save results
  const jsonReport = {
    timestamp: new Date().toISOString(),
    score: overallScore,
    summary: {
      totalRoutes,
      routesWithSchema,
      validRoutes,
      totalSchemas,
      schemaTypes: Array.from(schemaTypes)
    },
    routes: results
  };

  fs.writeFileSync('schema-validation.json', JSON.stringify(jsonReport, null, 2));
  console.log('\n✅ Validation complete! Report saved to schema-validation.json');

  // Exit with error if any route has invalid schema
  if (validRoutes < totalRoutes) {
    console.log('\n⚠️  Some routes have invalid or missing schema');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});
