# Accessibility Implementation Notes

**Last Updated:** 2025-10-19  
**Standard:** WCAG 2.1 Level AA

---

## Overview

This document provides practical guidance for implementing and maintaining accessibility features in the TailorEdu platform. It covers common patterns, best practices, and exceptions specific to our codebase.

---

## Table of Contents

1. [ARIA Labels and Descriptions](#aria-labels-and-descriptions)
2. [Focus Management](#focus-management)
3. [Keyboard Navigation](#keyboard-navigation)
4. [Live Regions and Dynamic Updates](#live-regions-and-dynamic-updates)
5. [Form Accessibility](#form-accessibility)
6. [Modal and Dialog Patterns](#modal-and-dialog-patterns)
7. [Icon Buttons](#icon-buttons)
8. [Navigation Components](#navigation-components)
9. [Testing Accessibility](#testing-accessibility)
10. [Known Exceptions](#known-exceptions)

---

## ARIA Labels and Descriptions

### Icon-Only Buttons

**Pattern:**
```tsx
// ✅ CORRECT - Icon button with descriptive label
<Button aria-label="Delete assignment" onClick={handleDelete}>
  <Trash className="h-4 w-4" aria-hidden="true" />
</Button>

// ❌ INCORRECT - No label
<Button onClick={handleDelete}>
  <Trash className="h-4 w-4" />
</Button>
```

**Guidelines:**
- Always provide descriptive `aria-label` for icon-only buttons
- Be specific: "Delete assignment" not "Delete"
- Include context: "Edit student profile" not "Edit"
- Mark decorative icons with `aria-hidden="true"`
- Dynamic labels for state: `aria-label={isOpen ? "Close menu" : "Open menu"}`

### Notification Badges

**Pattern:**
```tsx
// ✅ CORRECT - Badge with accessible count
<Button aria-label={`Notifications (${unreadCount} unread)`}>
  <Bell aria-hidden="true" />
  <Badge aria-label={`${unreadCount} unread notifications`}>
    {unreadCount}
  </Badge>
</Button>
```

### Toggle Buttons

**Pattern:**
```tsx
// ✅ CORRECT - Toggle with state
<Button
  aria-label="Toggle high contrast mode"
  aria-pressed={isHighContrast}
  onClick={toggleHighContrast}
>
  <Eye aria-hidden="true" />
  {isHighContrast && <span className="sr-only">Active</span>}
</Button>
```

---

## Focus Management

### Modal Focus Trap

**Implementation:**
```tsx
import { useFocusTrap } from '@/hooks/useFocusTrap';

function MyModal({ open, onClose }) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Automatically trap focus when modal opens
  useFocusTrap(modalRef, open);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent ref={modalRef} aria-describedby="modal-description">
        <DialogTitle>Modal Title</DialogTitle>
        <DialogDescription id="modal-description">
          Modal description for screen readers
        </DialogDescription>
        {/* Content */}
      </DialogContent>
    </Dialog>
  );
}
```

**What `useFocusTrap` does:**
1. Moves focus to first focusable element when modal opens
2. Prevents Tab from leaving modal container
3. Cycles focus back to first element after last element
4. Handles Shift+Tab for reverse cycling
5. Returns focus to trigger element when modal closes

### Drawer/Sheet Focus

**Pattern:**
```tsx
// ✅ Radix UI Sheet handles focus automatically
<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetTrigger asChild>
    <Button aria-label="Open navigation menu">
      <Menu aria-hidden="true" />
    </Button>
  </SheetTrigger>
  <SheetContent>
    <SheetTitle>Navigation</SheetTitle>
    {/* Content */}
  </SheetContent>
</Sheet>
```

**Note:** Radix UI primitives (Dialog, Sheet, AlertDialog) include built-in focus trap. No additional implementation needed.

---

## Keyboard Navigation

### Global Keyboard Shortcuts

**Implemented Shortcuts:**
- `Esc` - Close current modal/dialog/dropdown
- `Tab` - Move to next focusable element
- `Shift+Tab` - Move to previous focusable element
- `Enter` - Activate button/link
- `Space` - Toggle checkbox/switch, activate button
- `Arrow Keys` - Navigate within components (tabs, select, radio groups)

### Custom Shortcuts

**Pattern:**
```tsx
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function MyComponent() {
  useKeyboardShortcuts({
    'ctrl+s': handleSave,
    'ctrl+k': openSearch,
    'esc': closeModal,
  });
  
  return <div>Content</div>;
}
```

### Skip Links

**Pattern:**
```tsx
// Add to main layout
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

// In content area
<main id="main-content" role="main">
  {children}
</main>
```

---

## Live Regions and Dynamic Updates

### Using AccessibilityContext

**Pattern:**
```tsx
import { useAccessibility } from '@/contexts/AccessibilityContext';

function SubmitForm() {
  const { announce } = useAccessibility();
  
  const handleSubmit = async () => {
    try {
      await submitData();
      // ✅ Announce success
      announce('Assignment submitted successfully', 'polite');
    } catch (error) {
      // ✅ Announce error assertively
      announce('Error: Failed to submit assignment', 'assertive');
    }
  };
}
```

### Priority Levels

**Polite (`aria-live="polite"`):**
- Success messages
- Loading complete notifications
- Non-urgent updates
- Background process completions

**Assertive (`aria-live="assertive"`):**
- Error messages
- Critical warnings
- Form validation errors
- Time-sensitive alerts

### Toast Notifications

**Implementation:**
```tsx
// Toasts automatically use ARIA live regions
import { toast } from 'sonner';

// ✅ Success toast (polite)
toast.success('Grade updated successfully');

// ✅ Error toast (assertive by default)
toast.error('Failed to save changes');

// Custom toast with action
toast('New assignment available', {
  action: {
    label: 'View',
    onClick: () => navigate('/assignments')
  }
});
```

**Note:** Our toast components automatically include `role="status"` and `aria-live="polite"`.

---

## Form Accessibility

### Input Labels

**Pattern:**
```tsx
// ✅ CORRECT - Label associated with input
<Label htmlFor="student-name">Student Name</Label>
<Input 
  id="student-name" 
  name="studentName"
  aria-required="true"
/>

// Using react-hook-form with shadcn Form components
<Form {...form}>
  <FormField
    control={form.control}
    name="studentName"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Student Name</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage /> {/* Errors automatically linked */}
      </FormItem>
    )}
  />
</Form>
```

### Error Messages

**Pattern:**
```tsx
// ✅ CORRECT - Error linked to input
<Input
  id="email"
  type="email"
  aria-invalid={!!error}
  aria-describedby={error ? 'email-error' : undefined}
/>
{error && (
  <span id="email-error" role="alert" className="text-destructive">
    {error}
  </span>
)}
```

### Required Fields

**Pattern:**
```tsx
// ✅ CORRECT - Multiple indicators
<Label htmlFor="assignment-title">
  Assignment Title
  <span className="text-destructive ml-1" aria-label="required">*</span>
</Label>
<Input
  id="assignment-title"
  aria-required="true"
  required
/>
```

---

## Modal and Dialog Patterns

### Dialog Accessibility

**Complete Pattern:**
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button aria-label="Create new assignment">
      <Plus aria-hidden="true" />
      New Assignment
    </Button>
  </DialogTrigger>
  
  <DialogContent aria-describedby="dialog-description">
    <DialogHeader>
      <DialogTitle>Create Assignment</DialogTitle>
      <DialogDescription id="dialog-description">
        Fill out the form below to create a new assignment
      </DialogDescription>
    </DialogHeader>
    
    {/* Form content */}
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button type="submit">
        Create
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Key Points:**
- `DialogTitle` is required (provides accessible name)
- `DialogDescription` should have ID linked to `aria-describedby`
- Radix Dialog handles focus trap automatically
- Escape key closes dialog
- Focus returns to trigger button on close

### AlertDialog Pattern

**For Destructive Actions:**
```tsx
<AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Assignment?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. The assignment and all submissions will be permanently deleted.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction 
        onClick={handleDelete}
        className="bg-destructive text-destructive-foreground"
      >
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## Icon Buttons

### Component Examples

**Edit Button:**
```tsx
<Button 
  variant="ghost" 
  size="icon"
  aria-label={`Edit ${studentName}'s profile`}
  onClick={handleEdit}
>
  <Edit className="h-4 w-4" aria-hidden="true" />
</Button>
```

**Delete Button:**
```tsx
<Button 
  variant="ghost" 
  size="icon"
  aria-label={`Delete ${assignmentTitle}`}
  onClick={handleDelete}
>
  <Trash className="h-4 w-4" aria-hidden="true" />
</Button>
```

**Settings Button:**
```tsx
<Button 
  variant="ghost" 
  size="icon"
  aria-label="Open settings"
  onClick={openSettings}
>
  <Settings className="h-4 w-4" aria-hidden="true" />
</Button>
```

**Toggle Button:**
```tsx
<Button
  variant="ghost"
  size="icon"
  aria-label="Toggle sidebar"
  aria-pressed={isSidebarOpen}
  onClick={toggleSidebar}
>
  {isSidebarOpen ? (
    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
  ) : (
    <ChevronRight className="h-4 w-4" aria-hidden="true" />
  )}
</Button>
```

---

## Navigation Components

### Mobile Menu

**Pattern:**
```tsx
<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
  <SheetTrigger asChild>
    <Button 
      variant="ghost" 
      size="icon"
      aria-label="Open navigation menu"
      aria-expanded={mobileMenuOpen}
    >
      <Menu aria-hidden="true" />
    </Button>
  </SheetTrigger>
  
  <SheetContent side="right" aria-label="Navigation menu">
    <SheetTitle>Menu</SheetTitle>
    <nav aria-label="Main navigation">
      {/* Navigation links */}
    </nav>
  </SheetContent>
</Sheet>
```

### Dropdown Menu

**Pattern:**
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button 
      variant="ghost"
      aria-label="User menu"
      aria-haspopup="true"
    >
      <User aria-hidden="true" />
    </Button>
  </DropdownMenuTrigger>
  
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuItem>Sign Out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Breadcrumbs

**Pattern:**
```tsx
<nav aria-label="Breadcrumb">
  <ol className="flex items-center space-x-2">
    <li>
      <Link to="/" aria-label="Home">
        Home
      </Link>
    </li>
    <li aria-hidden="true">/</li>
    <li>
      <Link to="/courses">Courses</Link>
    </li>
    <li aria-hidden="true">/</li>
    <li aria-current="page">Current Page</li>
  </ol>
</nav>
```

---

## Testing Accessibility

### Automated Testing

**Run Accessibility Tests:**
```bash
# Run all accessibility tests
npm run test:a11y

# Watch mode
npm run test:a11y:watch

# With coverage
npm run test:a11y:coverage
```

### Test New Components

**Pattern:**
```tsx
// src/test/accessibility-scan.test.tsx
import { axe } from 'jest-axe';
import { render } from '@testing-library/react';

describe('MyComponent Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<MyComponent />, { 
      wrapper: AllTheProviders 
    });
    
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
  
  it('should have proper ARIA labels', () => {
    const { getByRole } = render(<MyComponent />);
    const button = getByRole('button', { name: 'Submit form' });
    expect(button).toBeInTheDocument();
  });
});
```

### Manual Testing Checklist

Before merging:
- [ ] Navigate entire component using only keyboard
- [ ] Test with Tab, Shift+Tab, Enter, Space, Escape
- [ ] Verify all interactive elements can be reached and activated
- [ ] Check focus indicators are visible
- [ ] Test screen reader announcements (VoiceOver/NVDA)
- [ ] Verify modal focus trap
- [ ] Test form validation error announcements
- [ ] Check color contrast (4.5:1 minimum)
- [ ] Test at 200% zoom

### Browser DevTools

**Chrome/Edge:**
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "Accessibility" category
4. Click "Generate report"

**Firefox:**
1. Open DevTools (F12)
2. Go to Accessibility tab
3. Enable accessibility features
4. Inspect element properties

---

## Known Exceptions

### Decorative Elements

**Pattern:**
```tsx
// ✅ Background images don't need alt text
<div 
  className="bg-cover" 
  style={{ backgroundImage: `url(${decorativeImage})` }}
  role="presentation"
  aria-hidden="true"
/>

// ✅ Decorative icons in buttons with text labels
<Button>
  <Star className="mr-2 h-4 w-4" aria-hidden="true" />
  Favorite
</Button>
```

### Radix UI False Positives

Automated tools may flag Radix UI components for missing ARIA attributes that are actually handled internally by the library. Common false positives:

- Dialog missing `aria-modal` (handled by Radix)
- Select missing `role="combobox"` (handled by Radix)
- Tooltip missing `aria-describedby` (handled by Radix)

**Resolution:** These warnings can be safely ignored. Radix UI components are WCAG compliant by design.

### Color Contrast Exceptions

Some automated tools may incorrectly calculate contrast for:
- CSS custom properties (HSL variables)
- Overlays with opacity
- Text on gradient backgrounds

**Resolution:** Manually verify with browser DevTools color picker or contrast checker tools.

### Third-Party Embeds

Some external content (YouTube videos, Google Drive embeds) may have accessibility issues outside our control.

**Mitigation:**
- Provide accessible alternative (transcript, download link)
- Use `title` attribute on iframes
- Include descriptive text before embed

---

## Component Compliance Status

### ✅ Fully Compliant Components

All components marked with this header have 100% WCAG 2.1 Level AA compliance:

```tsx
/**
 * ComponentName
 * 
 * ✅ WCAG 2.1 Level AA Compliant
 * - List of accessibility features
 */
```

**List:**
- Button
- Dialog, AlertDialog
- Sheet (Drawer)
- Input, Textarea, Select
- Checkbox, RadioGroup, Switch
- Tabs, Accordion
- Tooltip
- AddComponentButton
- EditProfileModal
- CreateThreadModal
- CreateClassModal
- EditClassModal
- NotificationBell
- Header

### ⚠️ Components Needing Updates

Components without compliance header should be audited and updated.

---

## Resources

### Standards
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Inclusive Components](https://inclusive-components.design/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Libraries
- [Radix UI Accessibility](https://www.radix-ui.com/docs/primitives/overview/accessibility)
- [React ARIA](https://react-spectrum.adobe.com/react-aria/)

---

## Getting Help

### Common Issues

**Issue:** "I can't Tab to my custom button"
- **Solution:** Ensure it's an actual `<button>` element or has `tabIndex={0}`

**Issue:** "Screen reader isn't announcing my toast"
- **Solution:** Use `announce()` from AccessibilityContext or ensure toast has `role="status"`

**Issue:** "Focus is leaving my modal"
- **Solution:** Use `useFocusTrap` hook or ensure using Radix Dialog/Sheet primitives

**Issue:** "My icon button has no name"
- **Solution:** Add `aria-label="Descriptive action"` to the button

### Contact

For accessibility questions or to report issues:
- Review this documentation
- Check [docs/ACCESSIBILITY_AUDIT.md](ACCESSIBILITY_AUDIT.md) for known issues
- Search codebase for similar patterns
- Ask in development team chat

---

## Checklist for New Features

When adding new components or features:

- [ ] Add descriptive `aria-label` to all icon-only buttons
- [ ] Implement focus management for modals/dialogs
- [ ] Add keyboard navigation support
- [ ] Include ARIA live regions for dynamic updates
- [ ] Test with keyboard only
- [ ] Test with screen reader
- [ ] Run automated accessibility tests
- [ ] Add compliance header to component
- [ ] Update this document if new patterns emerge

---

**Last Updated:** 2025-10-19  
**Next Review:** 2026-01-19  
**Maintainer:** Development Team
