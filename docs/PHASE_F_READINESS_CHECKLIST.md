# Phase F Readiness Checklist

**Project:** TailorEDU AI Architecture  
**Current Phase:** Part E - Adaptive Engine Validation  
**Next Phase:** Phase F - Full Lesson Intelligence + Predictive Insights  
**Date Created:** 2025-10-19  
**Status:** 🔄 In Progress

---

## Overview

This checklist ensures that all adaptive-engine and personalized-learning features from **Part E** are functioning correctly before advancing to **Phase F: Full Lesson Intelligence + Predictive Insights**.

### Completion Criteria
**All checkboxes must be ✅ before proceeding to Phase F.**

---

## 1. Functional Validation

### 1.1 Adaptive Logic

| Requirement | Verification Method | Verified By | Date | Status | Notes |
|-------------|---------------------|-------------|------|--------|-------|
| Lessons adjust to reading level | Generate lesson → Refine for class with mixed reading levels → Compare adaptations | | | ⬜ | Check for vocabulary simplification, sentence structure changes |
| Lessons adapt to language preference | Test with class having non-English speakers → Verify multilingual supports added | | | ⬜ | Should see translations, scaffolds, or bilingual examples |
| IEP accommodations reflected | Refine for class with IEP students → Check differentiation section | | | ⬜ | Must include specific accommodations (extended time, visual aids, etc.) |
| Learning styles incorporated | Compare original vs adapted lesson → Verify activity variety | | | ⬜ | Should see visual, auditory, kinesthetic options |

**Validation Steps:**
1. Create a test class with diverse student profiles:
   - 3 emerging readers
   - 5 on-grade readers
   - 2 advanced readers
   - 2 Spanish speakers
   - 3 students with IEPs
2. Generate a baseline lesson (e.g., "Photosynthesis" for Grade 8)
3. Click "Refine for My Students"
4. Compare sections side-by-side using Original/Adapted toggle
5. Document specific adaptations in each section

**Success Metrics:**
- [ ] Reading level adjustments visible in vocabulary and instructions
- [ ] Multilingual supports present for non-English speakers
- [ ] IEP accommodations explicitly listed in differentiation
- [ ] Activities match stated learning styles

---

### 1.2 Feedback Loop

| Requirement | Verification Method | Verified By | Date | Status | Notes |
|-------------|---------------------|-------------|------|--------|-------|
| Refinement triggers on button click | Click "Refine for My Students" → Verify function invocation | | | ⬜ | Check network tab for edge function call |
| Student data aggregated correctly | Inspect console logs → Verify student summary object | | | ⬜ | Should show counts for reading levels, languages, IEPs |
| AI response parsed successfully | Check Edge Function logs → Verify no JSON parsing errors | | | ⬜ | Look for "Refinement completed in X ms" |
| Adapted lesson saved to database | Query `lesson_refinements` table → Confirm new record | | | ⬜ | Row should have lesson_id, class_id, refined_json |

**Validation Steps:**
1. Open browser DevTools (Network tab)
2. Generate and save a lesson
3. Select a class with students
4. Click "Refine for My Students"
5. Monitor network request to `adaptive-content` function
6. Check response for `refinement` object
7. Query database: `SELECT * FROM lesson_refinements ORDER BY created_at DESC LIMIT 1;`

**Success Metrics:**
- [ ] Edge Function returns 200 status
- [ ] Response contains `refinement` and `usage` objects
- [ ] Database record created within 2 seconds
- [ ] No errors in browser console or Edge Function logs

---

### 1.3 Lesson Sequencing

| Requirement | Verification Method | Verified By | Date | Status | Notes |
|-------------|---------------------|-------------|------|--------|-------|
| Toggle between Original/Adapted works | Switch dropdown multiple times → Verify instant updates | | | ⬜ | No loading delay should occur |
| Edit buttons disabled in Adapted view | Switch to Adapted → Attempt to edit section | | | ⬜ | Edit buttons should be disabled/hidden |
| Multiple refinements supported | Refine same lesson for 2 different classes → Check database | | | ⬜ | Should create separate records |

**Validation Steps:**
1. Complete a lesson refinement
2. Use dropdown to toggle between "Original Version" and "Adapted for Students"
3. Try to click "Edit" button in adapted view
4. Refine the same lesson for a different class
5. Check database for multiple refinement records

**Success Metrics:**
- [ ] Toggle is instant (< 100ms)
- [ ] All sections update correctly on toggle
- [ ] Edit functionality properly disabled in adapted view
- [ ] Multiple refinements coexist without conflicts

---

### 1.4 UI Responsiveness

| Requirement | Verification Method | Verified By | Date | Status | Notes |
|-------------|---------------------|-------------|------|--------|-------|
| No lag during adaptation | Monitor performance during refinement → Check for frame drops | | | ⬜ | Should maintain 60fps |
| Loading state visible | Trigger refinement → Verify spinner/indicator appears | | | ⬜ | Button should show "Refining..." |
| Error handling graceful | Test without class selected → Verify error toast | | | ⬜ | Should show user-friendly message |
| Mobile responsive | Test on mobile viewport → Verify layout adapts | | | ⬜ | All controls accessible on small screens |

**Validation Steps:**
1. Open DevTools Performance tab
2. Start recording
3. Click "Refine for My Students"
4. Stop recording after completion
5. Analyze frame rate and blocking operations
6. Test error scenarios (no class, no lesson saved)
7. Test on mobile viewport (375px width)

**Success Metrics:**
- [ ] Frame rate > 30fps during operation
- [ ] Loading indicator visible within 100ms of click
- [ ] Error messages clear and actionable
- [ ] Mobile layout usable without horizontal scroll

---

## 2. Data Integrity

### 2.1 Student Progress Tracking

| Table | Requirement | Verification Query | Verified By | Date | Status | Notes |
|-------|-------------|-------------------|-------------|------|--------|-------|
| `students` | Student profiles complete | `SELECT * FROM students WHERE user_id IS NOT NULL LIMIT 10;` | | | ⬜ | Check for reading_level, language_preference, iep_accommodations |
| `class_students` | Active enrollments present | `SELECT * FROM class_students WHERE status = 'active' LIMIT 10;` | | | ⬜ | Verify student-class relationships |

**Validation Steps:**
1. Run provided SQL queries
2. Verify data completeness for test students
3. Check that all fields used by adaptive engine are populated
4. Validate data types match schema

**Success Metrics:**
- [ ] At least 10 students with complete profiles
- [ ] All active students have required fields populated
- [ ] No NULL values in critical fields (reading_level, grade_level)

---

### 2.2 Lesson Feedback

| Table | Requirement | Verification Query | Verified By | Date | Status | Notes |
|-------|-------------|-------------------|-------------|------|--------|-------|
| `lesson_refinements` | Refinements saved correctly | `SELECT id, lesson_id, class_id, student_summary FROM lesson_refinements ORDER BY created_at DESC LIMIT 5;` | | | ⬜ | Check for complete student_summary |
| `ai_lesson_history` | AI usage logged | `SELECT * FROM ai_lesson_history WHERE operation_type = 'adaptive_refinement' ORDER BY created_at DESC LIMIT 5;` | | | ⬜ | Verify token counts and costs tracked |

**Validation Steps:**
1. Complete 3-5 lesson refinements
2. Run verification queries after each
3. Check that `student_summary` contains aggregated data
4. Verify `ai_lesson_history` has corresponding entries
5. Validate cost calculations are reasonable

**Success Metrics:**
- [ ] 100% of refinements have database records
- [ ] Student summary includes all required fields (reading levels, languages, IEP count, interests)
- [ ] AI usage logged with accurate token counts
- [ ] Estimated costs match expected OpenAI pricing

---

### 2.3 Content Versions

| Table | Requirement | Verification Query | Verified By | Date | Status | Notes |
|-------|-------------|-------------------|-------------|------|--------|-------|
| `lessons_generated` | Original lessons stored | `SELECT id, topic, subject, grade_level FROM lessons_generated ORDER BY created_at DESC LIMIT 5;` | | | ⬜ | Verify lesson_json field populated |
| `lesson_refinements` | Adapted versions linked | `SELECT lr.id, lg.topic, lr.refined_json FROM lesson_refinements lr JOIN lessons_generated lg ON lg.id = lr.lesson_id ORDER BY lr.created_at DESC LIMIT 5;` | | | ⬜ | Check foreign key relationships intact |

**Validation Steps:**
1. Generate 3 different lessons
2. Refine each for at least one class
3. Run queries to verify linkage
4. Check that JSON structures are valid
5. Verify no orphaned records

**Success Metrics:**
- [ ] All generated lessons have valid JSON
- [ ] All refinements correctly reference parent lessons
- [ ] No foreign key constraint violations
- [ ] JSON content is parseable and complete

---

### 2.4 Grades & Rubrics

| Table | Requirement | Verification Query | Verified By | Date | Status | Notes |
|-------|-------------|-------------------|-------------|------|--------|-------|
| N/A (Future) | Grading system ready for adapted lessons | Manual testing of assignment grading workflow | | | ⬜ | Not implemented in Part E, note for Phase F |

**Note:** Grading for adapted lessons is a **Phase F** feature. This checklist item is a placeholder for future validation.

---

## 3. Accessibility & Localization

### 3.1 Text-to-Speech (TTS)

| Feature | Requirement | Verification Method | Verified By | Date | Status | Notes |
|---------|-------------|---------------------|-------------|------|--------|-------|
| TTS for adapted content | All adapted sections support TTS | Enable TTS → Navigate adapted lesson → Verify audio | | | ⬜ | Test each major section |
| Voice clarity | Audio is clear and properly paced | Listen to 5+ sections → Rate quality | | | ⬜ | Should be comprehensible |
| No TTS errors | No broken audio or failed requests | Check console for TTS errors | | | ⬜ | Monitor during full lesson playback |

**Validation Steps:**
1. Enable TTS in accessibility settings
2. Navigate to adapted lesson view
3. Click through each section (Objectives, Vocabulary, Materials, etc.)
4. Verify audio plays for each section
5. Check console for any TTS API errors

**Success Metrics:**
- [ ] TTS works for 100% of adapted sections
- [ ] Audio quality is clear and natural-sounding
- [ ] No 404 or 500 errors from TTS service
- [ ] Playback controls (play/pause) function correctly

---

### 3.2 Translation

| Feature | Requirement | Verification Method | Verified By | Date | Status | Notes |
|---------|-------------|---------------------|-------------|------|--------|-------|
| Multilingual support | Adapted lessons include translations | Refine for class with Spanish speakers → Check for Spanish content | | | ⬜ | Look for explicit bilingual examples |
| Translation quality | Translations are accurate and contextual | Have native speaker review adapted content | | | ⬜ | Check for grammatical correctness |
| No broken strings | All UI elements properly translated | Switch language preference → Verify no English fallbacks | | | ⬜ | Test in student view |

**Validation Steps:**
1. Create a class with students who have `language_preference = 'es'`
2. Generate and refine a lesson for this class
3. Review adapted content for Spanish supports
4. Test translation UI controls (if implemented)
5. Have a Spanish-speaking tester validate quality

**Success Metrics:**
- [ ] Lessons adapted for non-English speakers include multilingual supports
- [ ] Translations are contextually appropriate
- [ ] No untranslated strings or broken language switching
- [ ] Translation quality approved by native speaker

---

### 3.3 Reading Level Switch

| Feature | Requirement | Verification Method | Verified By | Date | Status | Notes |
|---------|-------------|---------------------|-------------|------|--------|-------|
| Seamless level switching | Toggle between Original/Adapted without reload | Switch view mode 10+ times → Monitor performance | | | ⬜ | Should be instant |
| Content accuracy | Reading level matches student data | Compare adapted vocabulary to original → Verify simplification | | | ⬜ | Check grade-appropriate complexity |
| No visual breaks | Layout remains stable during switch | Watch for flashing or re-rendering | | | ⬜ | Should be smooth transition |

**Validation Steps:**
1. Load an adapted lesson
2. Rapidly toggle between Original and Adapted views
3. Monitor browser DevTools for performance issues
4. Check for any layout shifts or flashing
5. Verify content updates correctly each time

**Success Metrics:**
- [ ] Toggle completes in < 100ms
- [ ] No page reload or network requests on toggle
- [ ] Layout stable with no cumulative layout shift (CLS)
- [ ] Content accuracy maintained across 20+ switches

---

## 4. Performance & Security

### 4.1 Supabase Realtime

| Feature | Requirement | Verification Method | Verified By | Date | Status | Notes |
|---------|-------------|---------------------|-------------|------|--------|-------|
| Realtime disabled for refinements | No realtime conflicts during adaptation | Check for realtime subscriptions in code | | | ⬜ | Refinements are async, not realtime |
| No sync errors | Database operations complete successfully | Monitor Postgres logs during refinement | | | ⬜ | Look for transaction errors |

**Validation Steps:**
1. Search codebase for `supabase.channel()` references related to lesson refinements
2. Trigger a refinement
3. Check Postgres logs for any errors
4. Verify no WebSocket connections opened unnecessarily

**Success Metrics:**
- [ ] No realtime subscriptions active during refinement
- [ ] All database operations complete successfully
- [ ] No transaction rollbacks or deadlocks
- [ ] Response times < 20 seconds for typical refinement

---

### 4.2 Row-Level Security (RLS)

| Table | Requirement | Verification Query | Verified By | Date | Status | Notes |
|-------|-------------|-------------------|-------------|------|--------|-------|
| `lesson_refinements` | RLS policy active | `SELECT * FROM pg_policies WHERE tablename = 'lesson_refinements';` | | | ⬜ | Should have teacher-only policy |
| `ai_lesson_history` | RLS policy active | `SELECT * FROM pg_policies WHERE tablename = 'ai_lesson_history';` | | | ⬜ | Should allow authenticated reads |
| `lessons_generated` | RLS policy active | `SELECT * FROM pg_policies WHERE tablename = 'lessons_generated';` | | | ⬜ | Should have teacher-only policy |

**Validation Steps:**
1. Run provided SQL queries in Supabase SQL Editor
2. Verify policies exist for each table
3. Test that teachers can only see their own refinements
4. Attempt to access another teacher's data (should fail)
5. Check Supabase linter for security warnings

**Success Metrics:**
- [ ] All adaptive-engine tables have RLS enabled
- [ ] Policies correctly restrict access by teacher
- [ ] No unauthorized data access possible
- [ ] Supabase linter shows no RLS warnings

---

### 4.3 Logging & Auditing

| Area | Requirement | Verification Method | Verified By | Date | Status | Notes |
|------|-------------|---------------------|-------------|------|--------|-------|
| Edge Function logs | All operations logged | Check Supabase Edge Function logs for `adaptive-content` | | | ⬜ | Should see request/response logs |
| Error tracking | Errors captured and reported | Trigger error scenario → Check logs | | | ⬜ | Test with invalid lesson_id |
| Cost tracking | AI usage costs recorded | Query `ai_lesson_history` → Sum estimated costs | | | ⬜ | Compare to expected spend |
| Audit trail | Refinement history preserved | Check that old refinements remain accessible | | | ⬜ | No data loss over time |

**Validation Steps:**
1. Navigate to [Adaptive Content Edge Function Logs](https://supabase.com/dashboard/project/irxzpsvzlihqitlicoql/functions/adaptive-content/logs)
2. Trigger a successful refinement
3. Trigger a failed refinement (wrong parameters)
4. Verify both success and failure are logged
5. Query AI usage history: `SELECT SUM(estimated_cost) FROM ai_lesson_history WHERE operation_type = 'adaptive_refinement';`
6. Verify cost matches expected value (based on token usage)

**Success Metrics:**
- [ ] 100% of operations logged to Edge Function logs
- [ ] Errors include stack traces and context
- [ ] AI costs tracked with 95%+ accuracy
- [ ] Historical data accessible for 30+ days

---

## 5. Completion Gate

**All boxes must be ✅ before proceeding to Phase F.**

### Pre-Flight Checks

- [ ] **Adaptive logic validated** in at least 3 diverse student profiles  
  - _Test Classes:_ 8th Grade Biology, 6th Grade English, 10th Grade Advanced Math
  - _Verified By:_ _________________ | _Date:_ _________

- [ ] **100% successful feedback loop** without manual intervention  
  - _Refinements Tested:_ _____ (minimum 10)
  - _Success Rate:_ _____% (must be 100%)
  - _Verified By:_ _________________ | _Date:_ _________

- [ ] **Accessibility (TTS + translation) confirmed stable**  
  - _TTS Success Rate:_ _____% (must be > 95%)
  - _Translation Quality Score:_ _____ / 10 (must be > 7)
  - _Verified By:_ _________________ | _Date:_ _________

- [ ] **No console or database errors in final run**  
  - _Console Errors:_ _____ (must be 0)
  - _Database Errors:_ _____ (must be 0)
  - _Verified By:_ _________________ | _Date:_ _________

- [ ] **QA document reviewed and signed off**  
  - _QA Test Plan:_ [QA_TEST_PLAN_PART_E.md](./QA_TEST_PLAN_PART_E.md)
  - _Dev Lead Sign-Off:_ _________________ | _Date:_ _________
  - _QA Lead Sign-Off:_ _________________ | _Date:_ _________

---

## 6. Known Issues & Blockers

Use this section to document any issues that must be resolved before Phase F.

| ID | Category | Severity | Description | Owner | Target Resolution | Status |
|----|----------|----------|-------------|-------|-------------------|--------|
| | | | | | | |
| | | | | | | |
| | | | | | | |

**Severity Levels:**
- 🔴 **Critical:** Blocks Phase F advancement
- 🟠 **High:** Should be fixed before Phase F
- 🟡 **Medium:** Can be addressed in Phase F
- 🟢 **Low:** Nice-to-have, not blocking

---

## 7. Sign-Off

### Development Team

| Role | Name | Date | Signature/Status |
|------|------|------|------------------|
| **Lead Developer** | | | ⬜ Approved / 🔧 Needs Work |
| **QA Lead** | | | ⬜ Approved / 🔧 Needs Work |
| **UX Designer** | | | ⬜ Approved / 🔧 Needs Work |
| **Product Owner** | | | ⬜ Approved / 🔧 Needs Work |

### Final Decision

- [ ] ✅ **APPROVED FOR PHASE F** – All criteria met, ready to advance
- [ ] 🔧 **NEEDS WORK** – Blocking issues identified (see Known Issues section)
- [ ] ⏸️ **ON HOLD** – External dependencies or strategic decision pending

**Decision Date:** __________________  
**Decision Made By:** __________________  
**Comments:**  
_______________________________________________________________________________________
_______________________________________________________________________________________

---

## 8. Next Steps - Phase F Preview

Once this checklist is complete, development advances to:

### Phase F: Full Lesson Intelligence + Predictive Insights

**New Features:**
1. **Predictive Analytics**
   - AI analyzes learning patterns across students
   - Identifies at-risk students before they fail
   - Suggests interventions based on historical data

2. **Auto-Generated Projects**
   - AI creates personalized final projects
   - Adapts challenge level to student progress
   - Generates rubrics aligned with learning objectives

3. **Teacher Dashboard Enhancements**
   - AI-suggested interventions for struggling students
   - Predicted student outcomes based on current trajectory
   - Automated progress reports for parent-teacher conferences

4. **Expanded Reporting**
   - Administrator analytics across classes and teachers
   - Parent portal with predictive insights
   - District-level trend analysis

**Phase F Kickoff Requirements:**
- [ ] Part E fully validated and approved
- [ ] Phase F technical design document reviewed
- [ ] Team trained on new AI capabilities
- [ ] Infrastructure scaled for predictive workloads

---

## Appendix A: Quick Reference Commands

### Database Validation Queries

```sql
-- Check lesson refinements
SELECT 
  COUNT(*) as total_refinements,
  COUNT(DISTINCT lesson_id) as unique_lessons,
  COUNT(DISTINCT class_id) as unique_classes
FROM lesson_refinements;

-- Check AI usage costs
SELECT 
  operation_type,
  COUNT(*) as operations,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  SUM(estimated_cost) as total_cost
FROM ai_lesson_history
WHERE operation_type = 'adaptive_refinement'
GROUP BY operation_type;

-- Check student profile completeness
SELECT 
  COUNT(*) as total_students,
  COUNT(CASE WHEN reading_level IS NOT NULL THEN 1 END) as with_reading_level,
  COUNT(CASE WHEN language_preference IS NOT NULL THEN 1 END) as with_language,
  COUNT(CASE WHEN iep_accommodations IS NOT NULL THEN 1 END) as with_iep
FROM students;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename IN ('lesson_refinements', 'ai_lesson_history', 'lessons_generated')
ORDER BY tablename, policyname;
```

### Performance Testing Commands

```bash
# Monitor Edge Function performance
curl -X POST https://irxzpsvzlihqitlicoql.supabase.co/functions/v1/adaptive-content \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"lessonId": "test-id", "classId": "test-class"}' \
  -w "\n\nTime: %{time_total}s\n"
```

---

## Appendix B: Related Documentation

- [QA Test Plan – Part E](./QA_TEST_PLAN_PART_E.md)
- [AI Lesson Generator Setup](./AI_LESSON_GENERATOR_SETUP.md)
- [Adaptive Content Edge Function](../supabase/functions/adaptive-content/index.ts)
- [useAdaptiveLessonRefinement Hook](../src/hooks/useAdaptiveLessonRefinement.ts)
- [TeacherLessonView Component](../src/components/lesson/TeacherLessonView.tsx)
- [Supabase Edge Function Logs](https://supabase.com/dashboard/project/irxzpsvzlihqitlicoql/functions/adaptive-content/logs)

---

**End of Phase F Readiness Checklist**

_Last Updated: 2025-10-19_  
_Document Version: 1.0_
