# TailorEDU Authentication & Role Testing Guide

## 🎯 Testing Overview

This guide provides step-by-step instructions for manually testing TailorEDU's authentication and role-based access control system.

## 📋 Prerequisites

### Method 1: Use Standardized Demo Accounts (Recommended)

Navigate to `/advanced-admin` → **Demo Accounts** tab and click "Create Demo Accounts" button.

**All demo accounts use password:** `Test1234!`

| Role | Email | Password | Dashboard Route |
|------|-------|----------|-----------------|
| Student | student@test.com | Test1234! | /dashboard/student |
| Teacher | teacher@test.com | Test1234! | /teacher/dashboard |
| Parent | parent@test.com | Test1234! | /dashboard/parent |
| Admin | admin@test.com | Test1234! | /admin/dashboard |
| Super Admin | superadmin@test.com | Test1234! | /super-admin |
| Developer | developer@test.com | Test1234! | /dev |

### Method 2: Seed Legacy Demo Data (Alternative)

1. **Seed Demo Data:**
   ```javascript
   // Call the seed-demo-data edge function from admin dashboard or console:
   await supabase.functions.invoke("seed-demo-data", {
     body: { demo_tenant: "tailoredu-demo" }
   });
   ```

2. **Legacy Demo User Credentials:**
   All legacy demo users use password: `Demo123!@#`

---

## 🧪 Test Cases

### ✅ Test 1: Teacher Authentication & Dashboard

**Objective:** Verify teacher can log in and access teacher dashboard

**Steps:**
1. Navigate to `/auth` or `/teacher/auth`
2. Log in with:
   - Email: `teacher@test.com`
   - Password: `Test1234!`
3. Should redirect to `/teacher/dashboard`
4. Navigate to `/dashboard/teacher/analytics`

**Expected Results:**
- ✅ Login successful
- ✅ Teacher dashboard loads
- ✅ Analytics page displays with teacher data
- ✅ No RLS errors in console
- ✅ Can see classes and student data

**Alternative Teacher Accounts (Legacy):**
- `johnson@demo.tailoredu.com` (Password: `Demo123!@#`)
- `nguyen@demo.tailoredu.com` (Password: `Demo123!@#`)
- `abdi@demo.tailoredu.com` (Password: `Demo123!@#`)

---

### ✅ Test 2: Student Authentication & Access Control

**Objective:** Verify student can log in and cannot access admin/teacher routes

**Steps:**
1. Log out from teacher account
2. Navigate to `/auth`
3. Log in with:
   - Email: `student@test.com`
   - Password: `Test1234!`
4. Should redirect to `/dashboard/student`
5. **Attempt unauthorized access:** Navigate to `/dashboard/admin/analytics`
6. **Attempt unauthorized access:** Navigate to `/dashboard/teacher/analytics`

**Expected Results:**
- ✅ Login successful
- ✅ Student dashboard loads with assigned classes
- ✅ Can view assignments and grades
- ❌ **Cannot access** `/dashboard/admin/analytics` (redirected or blocked)
- ❌ **Cannot access** `/dashboard/teacher/analytics` (redirected or blocked)
- ✅ Shows "Access Denied" or redirects to student dashboard
- ✅ No unauthorized data visible in network tab

**Alternative Student Accounts (Legacy):**
- `mai.lor@demo.student.com` (Password: `Demo123!@#`)
- `hodan.ali@demo.student.com` (Password: `Demo123!@#`)
- `luis.rivera@demo.student.com` (Password: `Demo123!@#`)
- `eli.tran@demo.student.com` (Password: `Demo123!@#`)
- `daniel.carter@demo.student.com` (Password: `Demo123!@#`)

---

### ✅ Test 3: Parent Authentication & Portal

**Objective:** Verify parent can log in and access parent portal

**Steps:**
1. Log out from student account
2. Navigate to `/auth`
3. Log in with:
   - Email: `parent@test.com`
   - Password: `Test1234!`
4. Navigate to `/dashboard/parent`

**Expected Results:**
- ✅ Login successful
- ✅ Parent portal loads
- ✅ Can view linked student(s) progress
- ✅ Can view grades and assignments for their students
- ❌ Cannot view other students' data
- ✅ Can send messages to teachers

**Note:** Parent accounts need to be linked to students via `student_parent_relationships` table

---

### ✅ Test 4: Admin Authentication & Full Access

**Objective:** Verify admin has access to all admin routes

**Steps:**
1. Log out from parent account
2. Navigate to `/auth`
3. Log in with:
   - Email: `admin@test.com`
   - Password: `Test1234!`
4. Navigate to `/dashboard/admin/analytics`
5. Test access to:
   - `/admin/dashboard`
   - `/advanced-admin`
   - `/content-management`
   - `/analytics`

**Expected Results:**
- ✅ Login successful
- ✅ All admin routes accessible
- ✅ Can view all classes, teachers, and students
- ✅ Analytics dashboard displays site-wide metrics
- ✅ Can manage users and content
- ✅ No permission errors

---

## 🔐 RLS (Row Level Security) Verification

### How to Check RLS Policies:

1. **Open Browser DevTools** → Network Tab
2. **Filter by:** `rest` or `supabase`
3. **Look for:**
   - Successful queries (200 status)
   - Unauthorized errors (401/403 status)
   - Data returned only for authorized users

### Common RLS Scenarios to Test:

#### For Students:
- ✅ Can only see their own submissions
- ✅ Can only see classes they're enrolled in
- ❌ Cannot see other students' grades
- ❌ Cannot see teacher-only assignment data

#### For Teachers:
- ✅ Can see all students in their classes
- ✅ Can see all submissions for their assignments
- ❌ Cannot see other teachers' class data (unless shared)
- ✅ Can create/edit assignments for their classes

#### For Parents:
- ✅ Can only see their linked students' data
- ❌ Cannot see unrelated students
- ✅ Can view grades and progress for linked students

#### For Admins:
- ✅ Can access all tables (via admin policies)
- ✅ Can manage users, classes, and content

---

## 🐛 Common Issues & Solutions

### Issue: "No authorization header" error
**Solution:** Make sure you're logged in and the JWT token is being sent with requests

### Issue: "Infinite recursion detected in policy"
**Solution:** Check RLS policies don't reference the same table they're protecting. Use security definer functions instead.

### Issue: User can't see any data after login
**Solution:** 
- Check RLS policies are properly set up
- Verify user has the correct role in `user_roles` table
- Check profile/student/teacher_profile record exists

### Issue: Redirect loop on login
**Solution:**
- Check protected route logic
- Verify onboarding completion status for teachers
- Ensure session is properly stored

---

## 📊 Testing Checklist

Copy this checklist and mark each item as you test:

```
Authentication Tests:
[ ] Teacher login works
[ ] Student login works  
[ ] Parent login works
[ ] Admin login works
[ ] Logout works for all roles

Access Control Tests:
[ ] Teacher can access teacher dashboard
[ ] Student can access student dashboard
[ ] Parent can access parent portal
[ ] Admin can access admin dashboard
[ ] Student CANNOT access teacher routes
[ ] Student CANNOT access admin routes
[ ] Teacher CANNOT access admin routes (unless also admin)
[ ] Proper "Access Denied" messages shown

RLS Tests:
[ ] Students see only their own data
[ ] Teachers see only their class data
[ ] Parents see only linked student data
[ ] Admins see all data
[ ] No data leaks in Network tab

Redirect Tests:
[ ] Unauthenticated users redirect to /auth
[ ] Users redirect to correct dashboard after login
[ ] Unauthorized access attempts redirect properly
```

---

## 🎬 Video Walkthrough Script

If recording a test video, follow this sequence:

1. **Start at homepage** → Show "Not Logged In" state
2. **Login as Teacher** → Show teacher dashboard and analytics
3. **Logout** → Show logout successful
4. **Login as Student** → Show student dashboard
5. **Attempt unauthorized access** → Try to visit `/dashboard/admin/analytics`
6. **Show "Access Denied"** → Confirm blocked
7. **Check Network Tab** → Show no unauthorized data
8. **Logout** → Clean session
9. **Login as Admin** → Show full admin access
10. **Show RLS working** → Query data in different contexts

---

## 🔗 Related Documentation

- [Authentication Setup Guide](./DEVELOPER_DOCUMENTATION.md#authentication)
- [Role-Based Access Control](./DEVELOPER_DOCUMENTATION.md#rbac)
- [Database RLS Policies](./DEVELOPER_DOCUMENTATION.md#rls)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

---

## 💡 Next Steps After Testing

1. **Document Results:** Note any failures or unexpected behavior
2. **Fix Issues:** Address any RLS policy gaps or redirect problems
3. **Add More Tests:** Consider edge cases and additional scenarios
4. **Automate:** Consider adding Playwright/Cypress tests for CI/CD

