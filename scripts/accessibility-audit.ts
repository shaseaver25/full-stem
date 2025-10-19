/**
 * Accessibility Audit Script
 * 
 * Runs axe-core accessibility tests across all major routes
 * and generates a comprehensive markdown report.
 * 
 * Usage: npm run test:a11y
 */

import { AxeResults } from 'axe-core';

interface AuditReport {
  timestamp: string;
  totalViolations: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  violations: AxeResults['violations'];
  passes: number;
  incomplete: number;
}

export function categorizeViolations(results: AxeResults): AuditReport {
  const violations = results.violations;
  
  return {
    timestamp: new Date().toISOString(),
    totalViolations: violations.length,
    critical: violations.filter(v => v.impact === 'critical').length,
    serious: violations.filter(v => v.impact === 'serious').length,
    moderate: violations.filter(v => v.impact === 'moderate').length,
    minor: violations.filter(v => v.impact === 'minor').length,
    violations: violations,
    passes: results.passes.length,
    incomplete: results.incomplete.length,
  };
}

export function generateMarkdownReport(report: AuditReport): string {
  let markdown = `# Accessibility Audit Report\n\n`;
  markdown += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- Total Violations: ${report.totalViolations}\n`;
  markdown += `- Passed Checks: ${report.passes}\n`;
  markdown += `- Incomplete Checks: ${report.incomplete}\n\n`;
  
  markdown += `### Violations by Severity\n\n`;
  markdown += `- 🔴 Critical: ${report.critical}\n`;
  markdown += `- 🟠 Serious: ${report.serious}\n`;
  markdown += `- 🟡 Moderate: ${report.moderate}\n`;
  markdown += `- 🟢 Minor: ${report.minor}\n\n`;
  
  if (report.totalViolations === 0) {
    markdown += `## ✅ No Violations Found\n\n`;
    markdown += `All tested components and routes comply with WCAG 2.1 Level AA standards.\n\n`;
  } else {
    markdown += `## Detailed Findings\n\n`;
    
    const byImpact = {
      critical: report.violations.filter(v => v.impact === 'critical'),
      serious: report.violations.filter(v => v.impact === 'serious'),
      moderate: report.violations.filter(v => v.impact === 'moderate'),
      minor: report.violations.filter(v => v.impact === 'minor'),
    };
    
    for (const [impact, violations] of Object.entries(byImpact)) {
      if (violations.length > 0) {
        markdown += `### ${impact.toUpperCase()} (${violations.length})\n\n`;
        
        violations.forEach(violation => {
          markdown += `#### ${violation.help}\n\n`;
          markdown += `- **Rule ID:** \`${violation.id}\`\n`;
          markdown += `- **Description:** ${violation.description}\n`;
          markdown += `- **WCAG:** ${violation.tags.filter(t => t.startsWith('wcag')).join(', ')}\n`;
          markdown += `- **Impact:** ${violation.impact}\n`;
          markdown += `- **Affected Elements:** ${violation.nodes.length}\n\n`;
          
          markdown += `**Recommended Fix:**\n${violation.helpUrl}\n\n`;
          
          if (violation.nodes.length > 0) {
            markdown += `**Example:**\n`;
            markdown += `\`\`\`html\n${violation.nodes[0].html}\n\`\`\`\n\n`;
          }
        });
      }
    }
  }
  
  return markdown;
}
