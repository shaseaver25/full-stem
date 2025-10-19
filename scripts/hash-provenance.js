#!/usr/bin/env node

/**
 * Content Provenance Hash Generator
 * 
 * Generates SHA-256 hashes for all HTML pages in the build output
 * and creates a provenance manifest for verifiable content integrity.
 * 
 * Usage:
 *   node scripts/hash-provenance.js                     # Generate manifest
 *   node scripts/hash-provenance.js --verify <file>     # Verify single file
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DIST_DIR = path.join(process.cwd(), 'dist');
const MANIFEST_PATH = path.join(DIST_DIR, 'provenance-manifest.json');

/**
 * Calculate SHA-256 hash of file contents
 */
function calculateHash(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Recursively find all HTML files in directory
 */
function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Generate provenance manifest for all HTML files
 */
function generateManifest() {
  console.log('🔐 Generating content provenance manifest...\n');
  
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Error: dist directory not found. Run `npm run build` first.');
    process.exit(1);
  }

  const htmlFiles = findHtmlFiles(DIST_DIR);
  const manifest = {};
  let successCount = 0;
  let errorCount = 0;

  htmlFiles.forEach(filePath => {
    const relativePath = '/' + path.relative(DIST_DIR, filePath).replace(/\\/g, '/');
    const urlPath = relativePath.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    
    const hash = calculateHash(filePath);
    
    if (hash) {
      manifest[urlPath] = hash;
      console.log(`✅ ${urlPath}`);
      console.log(`   Hash: ${hash.substring(0, 16)}...`);
      successCount++;
    } else {
      console.log(`❌ ${urlPath} - Failed to generate hash`);
      errorCount++;
    }
  });

  // Write manifest to public directory
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  
  console.log(`\n📝 Provenance manifest generated: ${MANIFEST_PATH}`);
  console.log(`✅ Success: ${successCount} files`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount} files`);
  }
  console.log(`\n🔍 Total pages tracked: ${Object.keys(manifest).length}`);
  
  return manifest;
}

/**
 * Verify a single file against the manifest
 */
function verifyFile(filePath) {
  console.log(`🔍 Verifying: ${filePath}\n`);
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ Error: File not found');
    process.exit(1);
  }

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ Error: Provenance manifest not found. Generate it first.');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const actualHash = calculateHash(filePath);
  
  const relativePath = '/' + path.relative(DIST_DIR, filePath).replace(/\\/g, '/');
  const urlPath = relativePath.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  const expectedHash = manifest[urlPath];

  if (!expectedHash) {
    console.log('⚠️  Warning: File not found in manifest');
    console.log(`   Actual hash: ${actualHash}`);
    process.exit(1);
  }

  if (actualHash === expectedHash) {
    console.log('✅ VERIFIED: Hash matches manifest');
    console.log(`   Hash: ${actualHash}`);
    process.exit(0);
  } else {
    console.log('❌ VERIFICATION FAILED: Hash mismatch');
    console.log(`   Expected: ${expectedHash}`);
    console.log(`   Actual:   ${actualHash}`);
    process.exit(1);
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args[0] === '--verify' && args[1]) {
    verifyFile(args[1]);
  } else if (args[0] === '--help' || args[0] === '-h') {
    console.log('Content Provenance Hash Generator\n');
    console.log('Usage:');
    console.log('  node scripts/hash-provenance.js                  Generate manifest');
    console.log('  node scripts/hash-provenance.js --verify <file>  Verify single file');
    console.log('  node scripts/hash-provenance.js --help           Show this help');
  } else {
    generateManifest();
  }
}

main();
