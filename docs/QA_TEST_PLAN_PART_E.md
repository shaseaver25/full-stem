# QA Test Plan – Part E: Adaptive Engine Validation

**Project:** TailorEDU AI Architecture  
**Feature:** Adaptive Lesson Refinement System  
**Version:** 1.0  
**Date Created:** 2025-10-19  
**Status:** 🔄 In Progress

---

## 1. Overview

### Purpose
Validate the Adaptive Lesson Refinement system that personalizes AI-generated lessons based on student data (reading levels, IEP accommodations, language preferences, and learning styles).

### Scope
- Student data aggregation and analysis
- AI-powered lesson adaptation via OpenAI
- Original vs. Adapted lesson comparison UI
- Cost tracking and logging
- Database integrity for refinements

### Success Criteria
- ✅ System successfully aggregates student data from a class
- ✅ AI adapts lessons with measurable improvements for differentiation
- ✅ Teachers can toggle between original and adapted versions
- ✅ All refinements are saved to `lesson_refinements` table
- ✅ AI usage is logged to `ai_lesson_history` table
- ✅ No errors in Edge Function logs

---

## 2. Prerequisites

### Test Environment
- **URL:** https://6ba0ffd1-9a8e-49f9-9f63-94f86000b68b.lovableproject.com
- **Test Account:** Teacher role with active classes
- **Required Data:**
  - At least 1 class with 5+ students
  - Students should have varied:
    - Reading levels (emerging, on-grade, advanced)
    - Language preferences (en, es, etc.)
    - IEP accommodations
    - Learning styles (visual, auditory, kinesthetic)

### API Keys
- ✅ `OPENAI_API_KEY` configured in Supabase Secrets
- ✅ Edge Function `adaptive-content` deployed

### Database Setup
- ✅ Table `lesson_refinements` exists
- ✅ Table `ai_lesson_history` exists
- ✅ RLS policies are active

---

## 3. Test Steps

### Test Case 1: Student Data Aggregation

**Objective:** Verify that the system correctly summarizes class student data.

**Steps:**
1. Navigate to AI Lesson Generator
2. Generate a lesson (e.g., "Photosynthesis" for Grade 8)
3. Save the lesson to get a `lesson_id`
4. Select a class with diverse student profiles
5. Click **"Refine for My Students"**

**Expected Results:**

| Check | Status | Notes |
|-------|--------|-------|
| System fetches all active students from the class | ⬜ | |
| Student summary includes reading level counts | ⬜ | |
| Student summary includes language preferences | ⬜ | |
| Student summary includes IEP count | ⬜ | |
| Student summary includes learning styles | ⬜ | |
| Student summary includes common interests | ⬜ | |
| No errors in console logs | ⬜ | |

---

### Test Case 2: AI Adaptation Quality

**Objective:** Validate that OpenAI meaningfully adapts the lesson.

**Steps:**
1. Complete Test Case 1 above
2. Wait for the adaptation to complete
3. Switch to **"Adapted for Students"** view
4. Compare adapted content to original

**Expected Results:**

| Section | Adaptation Check | Status | Notes |
|---------|------------------|--------|-------|
| **Objectives** | Simplified or enhanced based on reading level | ⬜ | |
| **Vocabulary** | Adjusted complexity or translations added | ⬜ | |
| **Materials** | Alternative resources for different learners | ⬜ | |
| **Warm-Up** | Activities match learning styles | ⬜ | |
| **Direct Instruction** | Scaffolded steps for struggling learners | ⬜ | |
| **Guided Practice** | Multiple entry points for different levels | ⬜ | |
| **Independent Practice** | Choice boards or leveled options | ⬜ | |
| **Differentiation** | Concrete IEP accommodations mentioned | ⬜ | |
| **Assessment** | Alternative assessment methods included | ⬜ | |

**Quality Checks:**
- [ ] Adaptations are specific and actionable (not generic)
- [ ] Language complexity matches reported reading levels
- [ ] IEP accommodations are concrete (e.g., "extended time," "visual aids")
- [ ] Multilingual supports are included if needed
- [ ] Student interests are incorporated into examples

---

### Test Case 3: Original vs. Adapted Toggle

**Objective:** Ensure teachers can easily compare versions.

**Steps:**
1. With an adapted lesson loaded
2. Use the dropdown to toggle between "Original Version" and "Adapted for Students"
3. Switch back and forth multiple times

**Expected Results:**

| Check | Status | Notes |
|-------|--------|-------|
| Dropdown appears in header after refinement | ⬜ | |
| "Original Version" shows unmodified lesson | ⬜ | |
| "Adapted for Students" shows refined lesson | ⬜ | |
| Toggle is instant (no loading delay) | ⬜ | |
| All sections update correctly on toggle | ⬜ | |
| "Powered by TailorEDU AI" appears in adapted view | ⬜ | |
| Edit buttons are disabled in adapted view | ⬜ | |

---

### Test Case 4: Database Persistence

**Objective:** Verify refinements are saved correctly.

**Steps:**
1. Complete a lesson refinement
2. Check Supabase database directly

**Expected Results:**

| Check | Status | Notes |
|-------|--------|-------|
| New row in `lesson_refinements` table | ⬜ | |
| `lesson_id` matches original lesson | ⬜ | |
| `class_id` matches selected class | ⬜ | |
| `refined_json` contains full adapted lesson | ⬜ | |
| `student_summary` contains aggregated data | ⬜ | |
| `created_at` timestamp is accurate | ⬜ | |
| RLS policy allows teacher to view their refinement | ⬜ | |

**Query to Check:**
```sql
SELECT * FROM lesson_refinements
ORDER BY created_at DESC
LIMIT 5;
```

---

### Test Case 5: AI Usage Logging

**Objective:** Ensure costs and tokens are tracked.

**Steps:**
1. Complete a lesson refinement
2. Check `ai_lesson_history` table

**Expected Results:**

| Check | Status | Notes |
|-------|--------|-------|
| New row in `ai_lesson_history` | ⬜ | |
| `operation_type` = "adaptive_refinement" | ⬜ | |
| `input_tokens` > 0 | ⬜ | |
| `output_tokens` > 0 | ⬜ | |
| `estimated_cost` calculated correctly | ⬜ | |
| `provider` = "openai" | ⬜ | |
| `model` = "gpt-4o" | ⬜ | |
| `metadata` includes lesson_id and class_id | ⬜ | |
| `metadata` includes student_count | ⬜ | |
| `metadata` includes processing_time_ms | ⬜ | |

**Query to Check:**
```sql
SELECT * FROM ai_lesson_history
WHERE operation_type = 'adaptive_refinement'
ORDER BY created_at DESC
LIMIT 5;
```

---

### Test Case 6: Edge Function Logs

**Objective:** Verify no errors in the Edge Function execution.

**Steps:**
1. Trigger a refinement
2. Check Supabase Edge Function logs for `adaptive-content`
3. Review for errors or warnings

**Expected Results:**

| Check | Status | Notes |
|-------|--------|-------|
| Function invoked successfully | ⬜ | |
| No authentication errors | ⬜ | |
| Student data fetched without errors | ⬜ | |
| OpenAI API call succeeded | ⬜ | |
| JSON parsing successful | ⬜ | |
| Database insert completed | ⬜ | |
| Logs show "Refinement completed in X ms" | ⬜ | |
| Logs show token counts | ⬜ | |

**Log Review Link:**  
[Adaptive Content Edge Function Logs](https://supabase.com/dashboard/project/irxzpsvzlihqitlicoql/functions/adaptive-content/logs)

---

### Test Case 7: Error Handling

**Objective:** Test system resilience under failure conditions.

**Steps & Expected Behavior:**

| Scenario | Expected Behavior | Status | Notes |
|----------|-------------------|--------|-------|
| Click "Refine" without saving lesson first | Error toast: "Lesson must be saved first" | ⬜ | |
| Click "Refine" without selecting class | Error toast: "Class must be selected" | ⬜ | |
| Class has no students | Error or graceful message | ⬜ | |
| OpenAI API rate limit hit (429) | Error toast with retry message | ⬜ | |
| OpenAI returns invalid JSON | Function logs error, fallback response | ⬜ | |
| User navigates away mid-refinement | Loading state clears, no data corruption | ⬜ | |

---

### Test Case 8: Performance

**Objective:** Validate refinement speed and efficiency.

**Steps:**
1. Refine a lesson with 5 students
2. Refine a lesson with 20 students
3. Compare processing times

**Expected Results:**

| Metric | Target | Actual | Status | Notes |
|--------|--------|--------|--------|-------|
| Refinement time (5 students) | < 15 seconds | | ⬜ | |
| Refinement time (20 students) | < 20 seconds | | ⬜ | |
| Button disabled during refinement | Yes | | ⬜ | |
| Loading indicator visible | Yes | | ⬜ | |
| UI remains responsive | Yes | | ⬜ | |

---

### Test Case 9: Multiple Refinements

**Objective:** Test creating multiple refinements for the same lesson.

**Steps:**
1. Generate and save a lesson
2. Refine for Class A
3. Refine the same lesson for Class B
4. Check database

**Expected Results:**

| Check | Status | Notes |
|-------|--------|-------|
| Two separate refinement records created | ⬜ | |
| Each refinement has different `class_id` | ⬜ | |
| Each refinement has unique adaptations | ⬜ | |
| Both visible in database | ⬜ | |
| No data collision or overwrite | ⬜ | |

---

### Test Case 10: Accessibility

**Objective:** Ensure adaptive UI is accessible.

**Steps:**
1. Test keyboard navigation
2. Use screen reader (NVDA/JAWS)
3. Check ARIA labels

**Expected Results:**

| Check | Status | Notes |
|-------|--------|-------|
| "Refine for My Students" button has aria-label | ⬜ | |
| Dropdown toggle is keyboard accessible | ⬜ | |
| Screen reader announces view mode changes | ⬜ | |
| All edit buttons have descriptive labels | ⬜ | |
| Focus order is logical | ⬜ | |
| Color contrast meets WCAG 2.1 AA | ⬜ | |

---

## 4. Error Log

Use this table to track any bugs discovered during testing.

| ID | Test Case | Severity | Description | Steps to Reproduce | Status | Assigned To | Notes |
|----|-----------|----------|-------------|-------------------|--------|-------------|-------|
| E-001 | | | | | | | |
| E-002 | | | | | | | |
| E-003 | | | | | | | |

**Severity Levels:**
- 🔴 **Critical:** Blocks core functionality
- 🟠 **High:** Major issue, workaround exists
- 🟡 **Medium:** Moderate impact
- 🟢 **Low:** Minor cosmetic issue

---

## 5. Tester Notes

Use this section for observations, edge cases, or suggestions.

| Date | Tester | Note |
|------|--------|------|
| 2025-10-19 | | Initial test plan created |
| | | |
| | | |

---

## 6. Sign-Off

### Test Completion

| Role | Name | Date | Signature/Status |
|------|------|------|------------------|
| **QA Lead** | | | ⬜ Approved / 🔧 Needs Fixes |
| **Developer** | | | ⬜ Approved / 🔧 Needs Fixes |
| **Product Owner** | | | ⬜ Approved / 🔧 Needs Fixes |

### Final Decision
- [ ] ✅ **Part E: Adaptive Engine APPROVED** – Ready for production
- [ ] 🔧 **Part E: Adaptive Engine NEEDS FIXES** – Blocking issues must be resolved
- [ ] ⏸️ **Part E: Adaptive Engine ON HOLD** – Pending further review

---

## 7. Appendix

### A. Test Data Setup

**Sample Class Configuration:**
- Class Name: "8th Grade Biology - Period 3"
- Student Count: 12
- Reading Level Distribution:
  - Emerging: 3 students
  - On-Grade: 7 students
  - Advanced: 2 students
- Language Preferences:
  - English: 9 students
  - Spanish: 2 students
  - French: 1 student
- IEP Students: 4
- Learning Styles:
  - Visual: 5 students
  - Auditory: 4 students
  - Kinesthetic: 3 students

### B. Sample Test Queries

**Check Refinement Quality:**
```sql
SELECT 
  lr.id,
  lr.lesson_id,
  lr.class_id,
  lr.student_summary,
  lr.created_at,
  LENGTH(lr.refined_json::text) as json_size
FROM lesson_refinements lr
ORDER BY lr.created_at DESC
LIMIT 1;
```

**Check AI Cost:**
```sql
SELECT 
  operation_type,
  SUM(input_tokens) as total_input,
  SUM(output_tokens) as total_output,
  SUM(estimated_cost) as total_cost,
  COUNT(*) as refinements
FROM ai_lesson_history
WHERE operation_type = 'adaptive_refinement'
GROUP BY operation_type;
```

### C. Related Documentation
- [AI_LESSON_GENERATOR_SETUP.md](./AI_LESSON_GENERATOR_SETUP.md)
- [Adaptive Content Edge Function](../supabase/functions/adaptive-content/index.ts)
- [useAdaptiveLessonRefinement Hook](../src/hooks/useAdaptiveLessonRefinement.ts)
- [TeacherLessonView Component](../src/components/lesson/TeacherLessonView.tsx)

---

**End of QA Test Plan – Part E**
