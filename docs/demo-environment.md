# Demo Environment Documentation

## Overview

The demo environment provides a fully-functional classroom simulation for showcasing the Adaptive Assessment features of TailorEdu. It includes a complete class with 15 students, assignments, submissions, and AI-generated analyses across different mastery levels.

## Architecture

### Edge Function Approach

We use a Supabase Edge Function (`seed-demo-classroom`) instead of direct SQL insertion because:

1. **Auth API Integration**: Cannot directly manipulate `auth.users` table - requires proper Auth API calls
2. **Service Role Access**: Edge functions use service role keys for cross-schema operations
3. **Automated Analysis**: Can trigger the `analyze-submission` function automatically
4. **Error Handling**: Built-in rollback and structured error responses
5. **Security**: CORS-enabled, proper authentication, no exposed credentials
6. **Maintainability**: Versioned, testable, and easy to update

### Data Structure

```
Demo Teacher
└── Demo Class (5th Grade Science)
    ├── 15 Students (varied performance levels)
    ├── 3 Assignments
    │   ├── Photosynthesis Explanation (primary demo)
    │   ├── Water Cycle Diagram
    │   └── Ecosystem Interactions
    └── 15 Submissions (all for Assignment 1)
        └── AI Analyses (generated on seed)
```

## Performance Distribution

The demo includes realistic performance distribution:

- **Advanced** (3 students): 92-95% - Comprehensive scientific explanations
- **Proficient** (5 students): 82-88% - Solid understanding with minor gaps
- **Developing** (5 students): 68-75% - Basic understanding, needs support
- **Emerging** (2 students): 45-58% - Minimal understanding, significant support needed

## Demo Credentials

### Teacher Account
```
Email: demo.teacher@tailoredu.local
Password: DemoTeacher2024!
User ID: demo_teacher_001
Class: 5th Grade Science - Room 204
```

### Student Accounts
```
Email Pattern: demo.student.{001-015}@tailoredu.local
Password: DemoStudent2024!
User IDs: demo_student_001 through demo_student_015
```

**Notable Students:**
- **Emma Rodriguez** (001): Advanced - Excellent scientific vocabulary
- **Marcus Chen** (002): Advanced - Comprehensive explanations
- **Jake Wilson** (004): Proficient - Solid understanding
- **Olivia Davis** (009): Developing - Basic concepts only
- **Lucas Anderson** (015): Emerging - Minimal understanding

## Usage

### Method 1: Frontend UI (Recommended)

1. Navigate to `/demo/adaptive-classroom`
2. Click "Seed Demo Data" button
3. Wait for seeding to complete (~30 seconds)
4. View generated credentials in success toast
5. Click "View as Teacher" to explore features

### Method 2: React Hook

```typescript
import { useSeedDemoEnvironment } from '@/hooks/useSeedDemoEnvironment'

function MyComponent() {
  const { mutate: seedDemo, isLoading } = useSeedDemoEnvironment()

  const handleSeed = () => {
    seedDemo() // Automatically shows success/error toasts
  }

  return (
    <button onClick={handleSeed} disabled={isLoading}>
      {isLoading ? 'Seeding...' : 'Seed Demo Data'}
    </button>
  )
}
```

### Method 3: Direct Edge Function Call

```typescript
const { data, error } = await supabase.functions.invoke('seed-demo-classroom', {
  body: { reset: false }
})

if (error) {
  console.error('Seed failed:', error)
} else {
  console.log('Demo environment created:', data)
}
```

## Resetting Demo Data

To clear and recreate demo data:

```typescript
const { data, error } = await supabase.functions.invoke('seed-demo-classroom', {
  body: { reset: true }
})
```

This will:
1. Delete all demo submissions and analyses
2. Delete all demo assignments
3. Unenroll all demo students
4. Delete demo students and teacher
5. Delete demo class
6. Recreate everything from scratch

## Features Demonstrated

### 1. Adaptive Assessment Dashboard
- Real-time mastery level visualization
- Color-coded student performance
- Assignment-level analytics
- Individual student drill-down

### 2. AI-Powered Feedback
- Automated submission analysis
- Mastery level classification
- Strengths identification
- Growth area recommendations
- Personalized next steps

### 3. Teacher Review Interface
- Side-by-side submission/analysis view
- Manual override capability
- Feedback editing
- Bulk actions

### 4. Performance Insights
- Class-wide mastery distribution
- Assignment completion rates
- Progress tracking over time
- Intervention recommendations

## Data Schema Reference

### Classes Table
```typescript
{
  id: 'demo_class_001',
  teacher_id: 'demo_teacher_001',
  name: '5th Grade Science - Room 204',
  subject: 'Science',
  grade_level: '5',
  published: true,
  status: 'active'
}
```

### Students Table
```typescript
{
  id: 'demo_student_001',
  user_id: 'demo_student_001',
  first_name: 'Emma',
  last_name: 'Rodriguez',
  grade_level: '5',
  class_id: null // Enrollment via class_students
}
```

### Assignments Table
```typescript
{
  id: 'demo_assignment_001',
  class_id: 'demo_class_001',
  title: 'Photosynthesis Explanation',
  description: 'Explain how plants make food from sunlight',
  instructions: '...',
  max_points: 100,
  rubric: 'Scientific Explanation Rubric...',
  due_date: '2024-01-20'
}
```

### Submissions Table
```typescript
{
  id: 'demo_submission_001',
  assignment_id: 'demo_assignment_001',
  user_id: 'demo_student_001',
  text_response: 'Photosynthesis is the process...',
  status: 'submitted',
  submitted_at: '2024-01-18T10:30:00Z'
}
```

### Analysis Table (Auto-generated)
```typescript
{
  id: uuid(),
  submission_id: 'demo_submission_001',
  mastery_level: 'advanced',
  overall_score: 92,
  feedback_summary: 'Excellent explanation...',
  analysis_details: {
    strengths: [...],
    areas_for_growth: [...],
    next_steps: [...]
  }
}
```

## Troubleshooting

### Error: "Schema cache not found"

**Solution**: The edge function includes a schema cache reload. If this persists:
1. Check that all tables exist in your database
2. Verify RLS policies allow service role access
3. Review edge function logs in Supabase Dashboard

### Error: "Demo data already exists"

**Solution**: Use reset mode:
```typescript
await supabase.functions.invoke('seed-demo-classroom', {
  body: { reset: true }
})
```

### Students not showing in class roster

**Verify**:
1. `class_students` table has enrollment records
2. Student `user_id` matches `students.id`
3. RLS policies allow teacher to view class students

### Analyses not generated

**Check**:
1. Edge function logs for analysis errors
2. OpenAI API key is configured
3. `analyze-submission` function is deployed
4. Submission `text_response` is not empty

## Best Practices

### Demo Environment Isolation

- Always use `demo_*` prefixed IDs
- Never mix demo data with real user data
- Clear demo data before production deployment

### Testing

```typescript
// Check if demo data exists
const { data: demoClass } = await supabase
  .from('classes')
  .select('id')
  .eq('id', 'demo_class_001')
  .single()

if (demoClass) {
  console.log('Demo environment is active')
}
```

### Performance

- Demo seeding takes ~20-30 seconds
- Includes 15 AI analysis calls (OpenAI API)
- Consider rate limiting in production

## Security Notes

⚠️ **Important**: Demo accounts should be:
- Clearly marked as demo/test accounts
- Disabled or removed in production
- Never used with real student data
- Regularly rotated if exposed

## Further Reading

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [RLS Policy Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [OpenAI API Integration](../supabase/functions/analyze-submission/README.md)

## Support

For issues with demo environment:
1. Check edge function logs: Supabase Dashboard → Functions → seed-demo-classroom → Logs
2. Review RLS policies for demo tables
3. Verify service role key is configured
4. Check OpenAI API quota/limits
