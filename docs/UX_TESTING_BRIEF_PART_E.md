# UX Testing Brief – Part E: Adaptive Engine Experience

---

## ⚙️ Trigger Test Student Creation

To prepare your testing environment instantly, use the built-in **Create Test Students** button.

### **Option 1 – From Admin or Teacher Dashboard**
1. Log in as an **Admin** or **Teacher**.
2. Navigate to the **Developer Dashboard** and click on the **Sandbox** tab.
3. Locate the **Create Test Students** button in the "Test Student Accounts" section.
4. Click once — wait for the success toast message:
   > ✅ Test Students Created Successfully
5. Copy the credentials displayed in the modal (or check console logs).

### **Option 2 – If the button is missing**
Open the browser console and run:
```javascript
const response = await fetch('https://irxzpsvzlihqitlicoql.supabase.co/functions/v1/create-test-students', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <your anon key>'
  }
});
const data = await response.json();
console.table(data.credentials);
```

### **Result**
- Creates class **"Adaptive Engine Test – Fall 2025"**
- Generates and enrolls three mock students:
  - Ava Green (Grade 3, English)
  - Mateo Rivera (Grade 5, Spanish)
  - Jordan Lee (On-grade, English)
- Password for all: `Test@123`
- Displays credentials and enrollment confirmation

---

## 🔐 Test Logins

After creating the test accounts, use these credentials:

| Student | Email | Password | Reading Level | Language |
|----------|--------|-----------|---------------|-----------|
| Ava Green | ava.green@test.tailoredu.org | Test@123 | Grade 3 | English |
| Mateo Rivera | mateo.rivera@test.tailoredu.org | Test@123 | Grade 5 | Spanish |
| Jordan Lee | jordan.lee@test.tailoredu.org | Test@123 | On-grade | English |

*If these do not exist, use the Create Test Students button before testing.*

---

## 🧭 1. Test Environment

- **Platform**: TailorEDU (staging build on Lovable)  
- **URL**: [https://lovable.dev/projects/6ba0ffd1-9a8e-49f9-9f63-94f86000b68b](https://lovable.dev/projects/6ba0ffd1-9a8e-49f9-9f63-94f86000b68b)  
- **Database**: Supabase (connected via TailorEDU instance)  
- **Testing Focus**: Adaptive learning experience, translation flow, accessibility, and clarity

---

## 🧩 2. Core UX Testing Tasks  

### **A. Lesson Delivery**
- Verify lessons load clearly and identify goals up front.  
- Check font, color contrast, and readability (especially for dyslexia-friendly design).  
- Confirm lessons scale correctly on tablet and desktop.

### **B. Adaptive Flow**
- Complete one lesson per student profile.  
- Observe whether the next lesson's **difficulty, length, and vocabulary** change appropriately.  
- Confirm the change feels smooth (no abrupt reloads or content jumps).

### **C. Accessibility & Inclusivity**
- Activate text-to-speech; confirm word-by-word highlighting is synchronized.  
- Switch to Spanish profile (Mateo Rivera): confirm full translation, not partial.  
- Manually adjust reading level; ensure the interface reflows without errors.

### **D. Emotional/User Feedback**
- Note if students understand why lessons shift in difficulty.  
- Capture any moments of confusion, delay, or encouragement.  
- Evaluate tone and clarity of system messages ("Great job!", "Let's try again").

---

## 🧾 3. UX Tester Deliverables  

Each UX tester should submit:
1. **Screenshots or short screen recordings** (especially when lesson adapts).  
2. **One-paragraph reflection** per student (describe experience in their role).  
3. **Top 3–5 UX improvement ideas** — focus on accessibility, flow, or clarity.  
4. (Optional) A Loom or short video walkthrough narrating findings.  

Attach deliverables directly in the Lovable document under:
- *Tester Notes*  
- *Error Log*  

---

## ✅ 4. UX Focus Reminders  

- UX testing is about *experience quality*, not code debugging.  
- Focus on clarity, inclusivity, and response timing.  
- Don't skip accessibility: TTS, translation, and reading-level shift are central to TailorEDU's mission.  

---

## 🔄 5. After Testing  

- Upload findings in the same Lovable doc: `QA Test Plan – Part E`  
- Tag @DevLead and @Shannon for review.  
- Mark UX status: ✅ "Pass", ⚠️ "Needs Refinement", or ❌ "Fail – Major Flow Issue"

---

## 📋 Testing Checklist

Use this checklist to track your progress:

### Student A – Ava Green (Grade 3, English)
- [ ] Successfully logged in
- [ ] Lesson loaded with appropriate difficulty
- [ ] Text-to-speech works correctly
- [ ] Vocabulary matches reading level
- [ ] Adaptive changes feel smooth
- [ ] No confusion or errors encountered

### Student B – Mateo Rivera (Grade 5, Spanish)
- [ ] Successfully logged in
- [ ] Content fully translated to Spanish
- [ ] Text-to-speech in Spanish works
- [ ] Reading level appropriate
- [ ] Cultural relevance maintained
- [ ] No translation gaps or errors

### Student C – Jordan Lee (On-grade, English)
- [ ] Successfully logged in
- [ ] Advanced content displayed
- [ ] Challenge level appropriate
- [ ] Text-to-speech synchronized
- [ ] Progress tracking visible
- [ ] Engagement maintained

---

**Last Updated:** 2025-10-19  
**Version:** 1.0  
**Status:** Ready for Testing
