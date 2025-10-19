# TailorEdu Documentation

This directory contains comprehensive documentation for the TailorEdu platform.

## Contents

### [ACCESSIBILITY_AUDIT.md](ACCESSIBILITY_AUDIT.md)
**WCAG 2.1 Level AA Compliance Report**

Comprehensive accessibility audit report including:
- Automated testing results with axe-core
- Violations categorized by severity (Critical, Serious, Moderate, Minor)
- WCAG 2.1 compliance checklist
- Detailed findings and recommended fixes
- Testing methodology and tools
- Component-by-component compliance status
- Known false positives documentation

**Status:** 98.5% compliant (197/200 checks passing)

---

## Testing

### Accessibility Testing
Run the full accessibility test suite:
```bash
npm run test:a11y
```

Watch mode for development:
```bash
npm run test:a11y:watch
```

Generate coverage report:
```bash
npm run test:a11y:coverage
```

---

## Related Documentation

See the root directory for additional documentation:
- [DEVELOPER_DOCUMENTATION.md](../DEVELOPER_DOCUMENTATION.md) - Development setup and guidelines
- [CODE_STRUCTURE.md](../CODE_STRUCTURE.md) - Project structure and organization
- [CODE_QUALITY.md](../CODE_QUALITY.md) - Code quality standards and ESLint rules
- [IMAGE_OPTIMIZATION.md](../IMAGE_OPTIMIZATION.md) - Image optimization guide
- [SENTRY_SETUP.md](../SENTRY_SETUP.md) - Error monitoring configuration

---

## Contributing

When adding new features or components:
1. Ensure WCAG 2.1 Level AA compliance
2. Add accessibility tests to `src/test/accessibility-scan.test.tsx`
3. Include accessibility compliance comment in component header
4. Update this documentation if needed

---

*Last Updated: 2025-10-19*
