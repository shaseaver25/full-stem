# TailorEDU Edge Functions Testing Guide

## 🎯 Overview

This guide provides step-by-step instructions for testing all AI edge functions with visual confirmation. You must perform these tests manually in your browser.

---

## 📋 Prerequisites

1. **Ensure you have seeded demo data:**
   ```javascript
   await supabase.functions.invoke("seed-demo-data", {
     body: { demo_tenant: "tailoredu-demo" }
   });
   ```

2. **Verify OPENAI_API_KEY is set** in Supabase Edge Functions secrets

3. **Open Browser DevTools:**
   - Press `F12` or `Cmd+Option+I` (Mac)
   - Go to Console tab for logs
   - Go to Network tab to monitor requests

---

## 🧪 Test 1: AI Performance Summary (`generate-performance-summary`)

### Where: Teacher Analytics Dashboard

**Objective:** Verify AI can generate insights from class performance data

### Steps:

1. **Login as Teacher:**
   - Email: `johnson@demo.tailoredu.com`
   - Password: `Demo123!@#`

2. **Navigate to Analytics:**
   - Click "Dashboard" → "Analytics" in navigation
   - Or directly visit: `/dashboard/teacher/analytics`

3. **Open AI Insights Tab:**
   - Click on the "AI Insights" tab
   - Should see a "Generate AI Insights" button

4. **Trigger AI Generation:**
   - Click "Generate AI Insights" button
   - **WATCH FOR:**
     - ✅ Loading spinner appears
     - ✅ Button text changes to "Generating..."
     - ✅ Request appears in Network tab: `POST /functions/v1/generate-performance-summary`
     - ✅ Status: 200 OK

5. **Verify Results:**
   - ✅ Insights text appears in card (3-5 sentences)
   - ✅ Content mentions class strengths/areas for improvement
   - ✅ No error messages or empty responses
   - ✅ Console shows: "Performance summary generated successfully"

### Check Network Request:

**Request URL:** `https://irxzpsvzlihqitlicoql.supabase.co/functions/v1/generate-performance-summary`

**Request Headers:**
- Authorization: Bearer [JWT token]
- Content-Type: application/json

**Request Body:**
```json
{
  "submissions": [...],
  "preferredLanguage": "en"
}
```

**Expected Response (200):**
```json
{
  "feedback": "Your students are showing strong progress..."
}
```

### Error Scenarios to Test:

❌ **429 Rate Limit:**
- Try clicking "Generate" multiple times quickly
- Should show: "Rate limit exceeded. Please try again in a moment."

❌ **402 Payment Required:**
- If OpenAI credits exhausted
- Should show: "AI service unavailable. Please contact support."

---

## 🧪 Test 2: Translation (`translate-text`)

### Where: Parent Dashboard

**Objective:** Verify real-time translation of feedback and grades

### Steps:

1. **First, create a Parent account or use existing parent with linked student**
   - You may need to manually create this via SQL:
   ```sql
   -- Create parent profile
   INSERT INTO parent_profiles (user_id, first_name, last_name)
   VALUES ('<parent-user-id>', 'Demo', 'Parent');
   
   -- Link to student
   INSERT INTO student_parent_relationships (parent_id, student_id, relationship_type)
   VALUES ('<parent-profile-id>', '<student-id>', 'parent');
   ```

2. **Login as Parent:**
   - Navigate to `/dashboard/parent`

3. **Enable Translation:**
   - Click Accessibility Toolbar (bottom-right floating button)
   - Toggle "Translation" ON
   - Select a language (e.g., Spanish, French, Somali)

4. **Navigate to Feedback Tab:**
   - Click "Feedback" tab on parent dashboard
   - Should see list of assignments with teacher feedback

5. **Trigger Translation:**
   - Click "Translate" button on any feedback item
   - **WATCH FOR:**
     - ✅ Loading spinner appears
     - ✅ Button shows "Translating..."
     - ✅ Network request: `POST /functions/v1/translate-text`
     - ✅ Status: 200 OK

6. **Verify Results:**
   - ✅ Feedback text changes to selected language
   - ✅ Translation is natural and readable (not literal word-for-word)
   - ✅ Original formatting preserved
   - ✅ Console log shows: "Translation completed successfully"

7. **Check Database Logging:**
   - Open Supabase Dashboard → Table Editor
   - Navigate to `translation_logs` table
   - ✅ New row with `user_id`, `target_language`, `text_length`
   - ✅ Timestamp shows current time

### Check Network Request:

**Request URL:** `https://irxzpsvzlihqitlicoql.supabase.co/functions/v1/translate-text`

**Request Headers:**
- Authorization: Bearer [JWT token]
- Content-Type: application/json

**Request Body:**
```json
{
  "text": "Great work on your assignment!",
  "targetLanguage": "Spanish",
  "sourceLanguage": "auto"
}
```

**Expected Response (200):**
```json
{
  "translatedText": "¡Excelente trabajo en tu tarea!",
  "sourceLanguage": "auto",
  "targetLanguage": "Spanish"
}
```

---

## 🧪 Test 3: Text-to-Speech (`text-to-speech`)

### Where: Parent Dashboard (same session)

**Objective:** Verify TTS generation, caching, and audio playback

### Steps:

1. **Stay on Parent Dashboard** (from Test 2)

2. **Enable Text-to-Speech:**
   - Open Accessibility Toolbar
   - Toggle "Text-to-Speech" ON
   - Select voice style: "Neutral", "Male", or "Female"

3. **Navigate to Overview or Feedback Tab:**
   - Find any text content (grades, feedback, etc.)
   - Look for 🔊 "Listen" button or speaker icon

4. **Trigger TTS (First Time - Cache Miss):**
   - Click 🔊 "Listen" button
   - **WATCH FOR:**
     - ✅ Loading spinner appears
     - ✅ Button disabled during generation
     - ✅ Network request: `POST /functions/v1/text-to-speech`
     - ✅ Status: 200 OK
     - ✅ Console: "Cache miss, generating TTS..."
     - ✅ Console: "TTS generation completed successfully"
     - ✅ Console: "TTS cached successfully"

5. **Verify Audio Playback:**
   - ✅ Audio player appears (or audio plays automatically)
   - ✅ Voice speaks the text clearly
   - ✅ Playback can be paused/stopped
   - ✅ Volume control works (if available)

6. **Test Caching (Second Request):**
   - Click the SAME 🔊 button again
   - **WATCH FOR:**
     - ✅ Much faster response (no API call to OpenAI)
     - ✅ Console: "TTS cache hit"
     - ✅ Audio plays immediately
     - ✅ Network request is shorter (retrieves from Supabase cache)

7. **Check Database Caching:**
   - Open Supabase Dashboard → Table Editor
   - Navigate to `tts_cache` table
   - ✅ New row with `user_id`, `text`, `language_code`, `voice_style`
   - ✅ `audio_base64` column contains base64-encoded MP3 data
   - ✅ `last_accessed` updates on second request
   - ✅ `created_at` shows when first generated

### Check Network Request:

**Request URL:** `https://irxzpsvzlihqitlicoql.supabase.co/functions/v1/text-to-speech`

**Request Headers:**
- Authorization: Bearer [JWT token]
- Content-Type: application/json

**Request Body:**
```json
{
  "text": "Your grade for the assignment is 95%",
  "language_code": "en",
  "voice_style": "neutral"
}
```

**Expected Response (200 - First Request):**
```json
{
  "audio_base64": "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2Z...",
  "audio_mime": "audio/mp3",
  "cached": false
}
```

**Expected Response (200 - Cached Request):**
```json
{
  "audio_base64": "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2Z...",
  "audio_mime": "audio/mp3",
  "cached": true
}
```

---

## 🔐 Authentication Testing

### Test JWT Enforcement

All three edge functions require authentication. Test this by:

1. **Open Incognito/Private Browser Window**
2. **Open DevTools Console**
3. **Try calling function without auth:**
   ```javascript
   await fetch('https://irxzpsvzlihqitlicoql.supabase.co/functions/v1/text-to-speech', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ text: 'Hello' })
   })
   ```

4. **Expected Result:**
   - ✅ Status: 401 Unauthorized
   - ✅ Response: `{"error": "Authentication required"}`

---

## 📊 Testing Checklist

Copy this checklist and mark each item as you test:

```markdown
### AI Performance Summary ✅/❌
[ ] Login as teacher successful
[ ] Analytics page loads
[ ] AI Insights tab accessible
[ ] "Generate AI Insights" button works
[ ] Loading spinner appears
[ ] Network request shows 200 OK
[ ] Insights text displays (not empty)
[ ] Insights are relevant to class data
[ ] No console errors
[ ] Can regenerate insights

### Translation ✅/❌
[ ] Login as parent successful
[ ] Parent dashboard loads
[ ] Translation toggle enables
[ ] Language selection works
[ ] "Translate" button appears on feedback
[ ] Translation request succeeds (200 OK)
[ ] Translated text displays correctly
[ ] Translation is natural (not literal)
[ ] translation_logs table updated
[ ] Original formatting preserved

### Text-to-Speech ✅/❌
[ ] TTS toggle enables
[ ] Voice style selection works
[ ] 🔊 "Listen" button appears
[ ] First request generates audio (cache miss)
[ ] Audio plays successfully
[ ] Voice is clear and natural
[ ] Second request uses cache (cache hit)
[ ] tts_cache table updated
[ ] last_accessed timestamp updates
[ ] Audio controls work (pause/stop)

### Authentication ✅/❌
[ ] Authenticated requests succeed
[ ] Unauthenticated requests blocked (401)
[ ] JWT token sent in Authorization header
[ ] Functions verify user identity
```

---

## 🐛 Common Issues & Solutions

### Issue: "OPENAI_API_KEY is not configured"
**Solution:** 
- Go to Supabase Dashboard → Edge Functions → Settings
- Add secret: `OPENAI_API_KEY` with your OpenAI API key

### Issue: "Failed to generate speech" or 500 error
**Solution:**
- Check OpenAI API key is valid
- Verify OpenAI account has credits
- Check edge function logs in Supabase

### Issue: Translation returns original text
**Solution:**
- Check target language is supported
- Verify text is not already in target language
- Check OpenAI API response in console

### Issue: Audio doesn't play
**Solution:**
- Check browser audio permissions
- Verify base64 audio data is not corrupted
- Try different voice style
- Check console for playback errors

### Issue: Cache not working
**Solution:**
- Verify `tts_cache` table exists
- Check RLS policies allow user to read/write cache
- Ensure `user_id`, `text`, `language_code`, and `voice_style` match exactly

---

## 🔗 Related Files

- **Edge Functions:**
  - `supabase/functions/generate-performance-summary/index.ts`
  - `supabase/functions/translate-text/index.ts`
  - `supabase/functions/text-to-speech/index.ts`

- **Client Hooks:**
  - `src/hooks/useAiFeedback.ts` (generates AI feedback & summaries)
  - `src/hooks/useTranslation.ts` (translates text)
  - `src/hooks/useTextToSpeech.ts` (speaks text)

- **Components:**
  - `src/components/analytics/AiInsightsSection.tsx`
  - `src/components/parent/ParentFeedbackSection.tsx`
  - `src/components/ui/AccessibilityToolbar.tsx`

---

## 📝 Logging & Monitoring

### Where to find logs:

1. **Browser Console:**
   - Open DevTools → Console
   - Look for: "Translation completed", "TTS cache hit", etc.

2. **Network Tab:**
   - Open DevTools → Network
   - Filter by: `functions/v1`
   - Check request/response payloads

3. **Supabase Edge Function Logs:**
   - Supabase Dashboard → Edge Functions
   - Select function → Logs tab
   - Shows server-side console.log outputs

4. **Database Tables:**
   - `translation_logs` - Track translation usage
   - `tts_cache` - TTS audio cache and access times

---

## 💡 Next Steps After Testing

Once you've verified all functions work:

1. **Monitor Performance:**
   - Check API usage in OpenAI dashboard
   - Monitor Supabase function invocation counts
   - Track cache hit rates for TTS

2. **Optimize Costs:**
   - Increase cache duration for TTS
   - Batch translation requests if possible
   - Consider using GPT-5-nano for simpler summaries

3. **Enhance Features:**
   - Add more voice styles
   - Support more languages
   - Implement batch translation for entire pages
   - Add download option for TTS audio

