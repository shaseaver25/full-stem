# Accessibility Checklist

Quick reference checklist for ensuring accessibility compliance when developing new features.

---

## Before Starting Development

- [ ] Review [ACCESSIBILITY_NOTES.md](ACCESSIBILITY_NOTES.md) for patterns
- [ ] Check [ACCESSIBILITY_AUDIT.md](ACCESSIBILITY_AUDIT.md) for known issues
- [ ] Understand WCAG 2.1 Level AA requirements for your feature

---

## During Development

### Interactive Elements

- [ ] All buttons have descriptive labels or `aria-label`
- [ ] Icon-only buttons use `aria-label="Descriptive action"`
- [ ] Decorative icons have `aria-hidden="true"`
- [ ] Toggle buttons use `aria-pressed` state
- [ ] Links have descriptive text (avoid "click here")

### Forms

- [ ] All inputs have associated `<Label>` components
- [ ] Required fields marked with `aria-required="true"`
- [ ] Error messages linked via `aria-describedby`
- [ ] Error messages use `role="alert"`
- [ ] Form validation provides clear feedback

### Modals & Dialogs

- [ ] Use Radix UI Dialog/Sheet/AlertDialog primitives
- [ ] Include `DialogTitle` (required for screen readers)
- [ ] Include `DialogDescription` with unique ID
- [ ] Link description with `aria-describedby`
- [ ] Focus trap works (test with Tab key)
- [ ] Escape key closes modal
- [ ] Focus returns to trigger element

### Dynamic Content

- [ ] Success messages use `announce('message', 'polite')`
- [ ] Error messages use `announce('error', 'assertive')`
- [ ] Loading states announced to screen readers
- [ ] Toast notifications have proper ARIA attributes

### Keyboard Navigation

- [ ] All interactive elements reachable via Tab
- [ ] Tab order is logical
- [ ] Enter/Space activates buttons
- [ ] Escape closes overlays
- [ ] Focus indicators visible
- [ ] No keyboard traps (except intentional focus trap in modals)

### Colors & Contrast

- [ ] Text meets 4.5:1 contrast ratio (normal text)
- [ ] Large text meets 3:1 contrast ratio (18pt+)
- [ ] Use semantic color tokens from design system
- [ ] Don't rely on color alone to convey information
- [ ] Test in high contrast mode

### Images & Media

- [ ] All meaningful images have descriptive `alt` text
- [ ] Decorative images have `alt=""` or `aria-hidden="true"`
- [ ] Videos have captions/transcripts
- [ ] Complex images have detailed descriptions

### Structure & Semantics

- [ ] Use semantic HTML (`<nav>`, `<main>`, `<header>`, etc.)
- [ ] Heading hierarchy is logical (h1 → h2 → h3)
- [ ] Lists use proper list elements (`<ul>`, `<ol>`)
- [ ] Tables use proper table markup with headers

---

## Testing

### Automated Testing

- [ ] Run `npm run test:a11y` and fix all violations
- [ ] Check browser console for axe-core warnings (dev mode)
- [ ] Run Lighthouse accessibility audit (90+ score)

### Manual Testing

- [ ] Navigate entire feature using only keyboard
  - [ ] Tab through all interactive elements
  - [ ] Use Enter/Space to activate
  - [ ] Use Escape to close overlays
  - [ ] Test Shift+Tab (reverse navigation)

- [ ] Test with screen reader (at least one):
  - [ ] VoiceOver (macOS: Cmd+F5)
  - [ ] NVDA (Windows, free)
  - [ ] JAWS (Windows, paid)

- [ ] Verify focus indicators
  - [ ] Focus visible on all interactive elements
  - [ ] Focus follows logical order
  - [ ] Focus trapped in modals

- [ ] Test zoom levels
  - [ ] 100% (default)
  - [ ] 150%
  - [ ] 200%
  - [ ] No horizontal scrolling
  - [ ] All functionality still works

- [ ] Test responsive design
  - [ ] Mobile (touch targets 44×44px minimum)
  - [ ] Tablet
  - [ ] Desktop

---

## Documentation

- [ ] Add WCAG compliance header to component
- [ ] Document any accessibility exceptions
- [ ] Update ACCESSIBILITY_NOTES.md if introducing new patterns
- [ ] Add accessibility tests to test suite

### Component Header Template

```tsx
/**
 * ComponentName
 * 
 * ✅ WCAG 2.1 Level AA Compliant
 * - Feature 1 description
 * - Feature 2 description
 * - Feature 3 description
 */
```

---

## Common Patterns

### Icon Button
```tsx
<Button 
  aria-label="Delete assignment"
  onClick={handleDelete}
>
  <Trash className="h-4 w-4" aria-hidden="true" />
</Button>
```

### Modal
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent aria-describedby="modal-description">
    <DialogTitle>Title</DialogTitle>
    <DialogDescription id="modal-description">
      Description
    </DialogDescription>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Form Input
```tsx
<Label htmlFor="email">Email</Label>
<Input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={!!error}
  aria-describedby={error ? 'email-error' : undefined}
/>
{error && (
  <span id="email-error" role="alert">
    {error}
  </span>
)}
```

### Dynamic Update
```tsx
import { useAccessibility } from '@/contexts/AccessibilityContext';

const { announce } = useAccessibility();

// On success
announce('Assignment submitted successfully', 'polite');

// On error
announce('Failed to submit assignment', 'assertive');
```

---

## Resources

### Quick Links
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [Accessibility Notes](ACCESSIBILITY_NOTES.md)
- [Accessibility Audit](ACCESSIBILITY_AUDIT.md)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- [WAVE](https://wave.webaim.org/extension/) - Browser extension
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)

### Screen Readers
- VoiceOver (macOS) - Built-in, Cmd+F5
- NVDA (Windows) - [Free download](https://www.nvaccess.org/)
- JAWS (Windows) - [Trial available](https://www.freedomscientific.com/products/software/jaws/)

---

## Getting Help

If you encounter accessibility issues:

1. Check [ACCESSIBILITY_NOTES.md](ACCESSIBILITY_NOTES.md) for similar patterns
2. Review [ACCESSIBILITY_AUDIT.md](ACCESSIBILITY_AUDIT.md) for known issues
3. Search codebase for similar implementations
4. Ask team members for guidance
5. Consult WCAG 2.1 documentation

---

**Remember:** Accessibility is not optional. It's a core requirement for all features.

**Target:** WCAG 2.1 Level AA compliance (minimum 90% automated test pass rate)

---

*Last Updated: 2025-10-19*
