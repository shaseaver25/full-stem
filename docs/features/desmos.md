# Desmos Integration in TailorEDU

## Overview

TailorEDU includes a fully integrated Desmos Interactive Math Tool that allows teachers to embed interactive graphing calculators and classroom activities directly into lessons, quizzes, and professional development sessions.

## Features

### 🎯 Dual Mode Support
- **Graphing Calculator**: Full-featured Desmos calculator with expression editor, graphing, and analysis tools
- **Classroom Activities**: Embed pre-built Desmos classroom activities via activity ID

### 💾 State Persistence
- Automatically saves student work to Supabase
- Students can restore previous sessions
- Teachers can view student progress

### ♿ Accessibility Compliance (WCAG 2.1 AA)
- Full keyboard navigation support
- High-contrast mode compatible
- Dyslexia-friendly font integration
- Screen reader announcements for state changes

---

## Usage Guide

### 1. Embedding in Lessons

#### Basic Calculator Embed
```tsx
import DesmosSection from '@/components/lesson/DesmosSection';

<DesmosSection 
  desmosType="calculator"
  lessonId="lesson-uuid"
  saveState={true}
/>
```

#### Read-Only Calculator (Teacher Demonstrations)
```tsx
<DesmosSection 
  desmosType="calculator"
  lessonId="lesson-uuid"
  readOnly={true}
  saveState={false}
/>
```

#### Classroom Activity Embed
```tsx
<DesmosSection 
  desmosType="activity"
  activityId="your-activity-id"
  lessonId="lesson-uuid"
/>
```

#### Geometry Tool
```tsx
<DesmosSection 
  desmosType="geometry"
/>
```

### 2. Direct Component Usage

For more control, use the `DesmosEmbed` component directly:

```tsx
import DesmosEmbed from '@/components/interactive/DesmosEmbed';

<DesmosEmbed
  mode="calculator"
  lessonId="lesson-uuid"
  activityId="optional-activity-id"
  readOnly={false}
  saveState={true}
  initialState={{
    expressions: {
      list: [
        { id: '1', latex: 'y=x^2', color: '#2d70b3' }
      ]
    }
  }}
/>
```

---

## Teacher Controls

### Adding Desmos to Lesson Builder

1. Open Lesson Builder
2. Click "Add Component" or "Insert Block"
3. Select "Desmos Math Tool"
4. Configure options:
   - **Mode**: Calculator, Activity, or Geometry
   - **Activity ID**: (if using Classroom Activities)
   - **Save Student Work**: Toggle state persistence
   - **Read-Only**: For demonstrations

### Pre-Loading Expressions

You can pre-load calculator expressions by passing `initialState`:

```tsx
const preloadedState = {
  version: 9,
  graph: {
    viewport: {
      xmin: -10,
      xmax: 10,
      ymin: -10,
      ymax: 10
    }
  },
  expressions: {
    list: [
      {
        id: '1',
        type: 'expression',
        latex: 'y=x^2',
        color: '#c74440'
      },
      {
        id: '2',
        type: 'expression',
        latex: 'y=\\sin(x)',
        color: '#2d70b3'
      }
    ]
  }
};

<DesmosEmbed 
  mode="calculator"
  initialState={preloadedState}
  lessonId="lesson-uuid"
/>
```

---

## Student Experience

### Saving Work

Students see "Save Work" and "Restore" buttons when state persistence is enabled:
- **Save Work**: Manually save current calculator state
- **Restore**: Load previously saved work
- Auto-save occurs when leaving the page (future enhancement)

### Progress Tracking

All student interactions are stored in the `student_math_sessions` table:
- User ID
- Lesson ID
- Activity ID (optional)
- Calculator state (full JSON snapshot)
- Timestamp

Teachers can query this data to monitor student engagement and understanding.

---

## API Reference

### DesmosEmbed Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'calculator' \| 'activity'` | Required | Type of Desmos embed |
| `activityId` | `string` | `undefined` | Desmos Classroom Activity ID |
| `lessonId` | `string` | `undefined` | Associated lesson UUID |
| `readOnly` | `boolean` | `false` | Disable editing (view-only) |
| `saveState` | `boolean` | `true` | Enable state persistence |
| `initialState` | `object` | `undefined` | Pre-load calculator state |
| `className` | `string` | `''` | Additional CSS classes |

### useDesmosState Hook

```tsx
const {
  savedState,      // Previously saved calculator state
  isLoading,       // Loading state from Supabase
  saveCalculatorState,   // Function to save state
  clearCalculatorState,  // Function to clear state
  loadSavedState,        // Function to reload state
} = useDesmosState(lessonId, activityId);
```

---

## Database Schema

### Table: `student_math_sessions`

```sql
CREATE TABLE student_math_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  activity_id TEXT,
  calculator_state JSONB NOT NULL DEFAULT '{}',
  session_type TEXT NOT NULL DEFAULT 'calculator',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_user_lesson_activity UNIQUE(user_id, lesson_id, activity_id)
);
```

### RLS Policies
- Students can CRUD their own sessions
- Teachers can view sessions for enrolled students
- Developers have read-only access

---

## Accessibility Features

### Keyboard Navigation
- **Tab**: Navigate between calculator UI elements
- **Enter/Space**: Activate buttons and inputs
- **Escape**: Close dialogs and popups
- **Arrow Keys**: Navigate expression lists

### Screen Reader Support
- ARIA labels on all interactive elements
- Live region announcements for state changes:
  - "Calculator work saved successfully"
  - "Previous calculator work restored"
  - "Desmos calculator loaded and ready for input"

### High Contrast Mode
The calculator respects TailorEDU's global high-contrast setting via CSS classes:

```css
.desmos-calculator-container.high-contrast {
  /* Enhanced contrast styles applied automatically */
}
```

### Dyslexia-Friendly Font
Applies OpenDyslexic font when enabled:

```css
.desmos-calculator-container.dyslexia-font * {
  font-family: 'OpenDyslexic', sans-serif;
}
```

---

## Testing Guidelines

### Manual Testing Checklist

#### Functionality
- [ ] Calculator loads without errors
- [ ] Can create and edit expressions
- [ ] Save Work button saves state to Supabase
- [ ] Restore button loads previous state
- [ ] Activity mode embeds correctly
- [ ] Geometry mode works in fallback iframe

#### Accessibility
- [ ] Tab navigation works throughout calculator
- [ ] Screen reader announces state changes
- [ ] High-contrast mode displays correctly
- [ ] Dyslexia font applies when enabled
- [ ] All buttons have ARIA labels
- [ ] Focus indicators visible

#### Cross-Browser
- [ ] Chrome/Edge (Chromium)
- [ ] Safari (WebKit)
- [ ] Firefox (Gecko)

#### Performance
- [ ] Calculator loads in < 2 seconds
- [ ] No lag when creating expressions
- [ ] Save operation completes quickly
- [ ] Multiple calculators on page don't conflict

---

## Example: Graphing y = x²

### Code
```tsx
<DesmosEmbed
  mode="calculator"
  lessonId="demo-lesson"
  initialState={{
    version: 9,
    expressions: {
      list: [
        {
          id: '1',
          type: 'expression',
          latex: 'y=x^2',
          color: '#c74440',
          lineStyle: 'SOLID',
          lineWidth: '2.5'
        }
      ]
    },
    graph: {
      viewport: {
        xmin: -5,
        xmax: 5,
        ymin: -2,
        ymax: 10
      }
    }
  }}
  saveState={true}
/>
```

### Result
Students see a pre-graphed parabola with optimal viewport settings. They can:
- Modify the equation
- Add new expressions
- Save their work
- Restore to the pre-loaded state

---

## Troubleshooting

### Calculator Doesn't Load
**Error**: "Failed to load Desmos calculator"

**Solution**:
1. Check browser console for network errors
2. Verify Desmos API CDN is accessible: `https://www.desmos.com/api/v1.7/calculator.js`
3. Ensure no ad blockers are interfering
4. Try clearing browser cache

### State Not Saving
**Error**: "Could not save your work"

**Solution**:
1. Verify user is authenticated (`useAuth` returns valid user)
2. Check `lessonId` prop is provided and valid UUID
3. Inspect Supabase RLS policies (students must have INSERT/UPDATE on `student_math_sessions`)
4. Check browser console for Supabase errors

### Activity Embed Not Displaying
**Error**: Blank iframe or 404

**Solution**:
1. Verify `activityId` is correct
2. Ensure activity is published in Desmos Teacher dashboard
3. Check iframe isn't blocked by CSP headers
4. Try opening activity URL directly: `https://teacher.desmos.com/activitybuilder/custom/{activityId}`

---

## Future Enhancements

- [ ] Auto-save on blur (leave calculator)
- [ ] Export graphs as images (PNG/SVG)
- [ ] Collaborative sessions (real-time multi-user)
- [ ] Teacher analytics dashboard (aggregate student data)
- [ ] Pre-built activity library (curated by subject/grade)
- [ ] Integration with quiz components (auto-grade graph responses)

---

## Resources

- [Desmos API Documentation](https://www.desmos.com/api/v1.7/docs/index.html)
- [Desmos Classroom Activities](https://teacher.desmos.com/)
- [TailorEDU Accessibility Guide](./accessibility.md)
- [Supabase RLS Policies](../database/rls-policies.md)

---

**Last Updated**: 2025-11-11  
**Maintainer**: TailorEDU Development Team
