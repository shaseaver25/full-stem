# RLS Access Control Matrix

Complete access control matrix for all roles and tables in TailorEdu.

---

## Legend

- ✅ **Full Access** - Can SELECT, INSERT, UPDATE, DELETE
- 🔍 **Read Only** - Can SELECT only
- 📝 **Read/Write** - Can SELECT, INSERT, UPDATE (no DELETE)
- 🔒 **Own Only** - Can only access own records
- ⚠️ **Conditional** - Access depends on relationships
- ❌ **No Access** - Completely restricted

---

## Student Role

### Core Tables
| Table | Access | Scope | Secure? |
|-------|--------|-------|---------|
| profiles | 📝 🔒 | Own profile | ✅ |
| students | 📝 🔒 | Own record | ✅ |
| user_roles | ❌ | None | ✅ |
| teacher_profiles | 🔍 ⚠️ | Their teachers only | ✅ |
| parent_profiles | ❌ | None | ✅ |

### Class & Enrollment
| Table | Access | Scope | Secure? |
|-------|--------|-------|---------|
| classes | 🔍 ⚠️ | Enrolled + Published | ✅ |
| class_students | ✅ 🔒 | Own enrollments | ✅ |
| class_messages | 🔍 ⚠️ | Their classes | ✅ |
| class_courses | ❌ | None | ✅ |

### Learning Content
| Table | Access | Scope | Secure? |
|-------|--------|-------|---------|
| lessons | 🔍 | All authenticated | 🔴 TOO BROAD |
| lesson_components | 🔍 | All authenticated | 🔴 TOO BROAD |
| activities | 🔍 ⚠️ | Enrolled + Published | ✅ |

### Assignments
| Table | Access | Scope | Secure? |
|-------|--------|-------|---------|
| assignments | 🔍 ⚠️ | Assigned to them | ✅ |
| class_assignments_new | 🔍 ⚠️ | Their classes | ✅ |
| assignment_submissions | ✅ 🔒 | Own submissions | ✅ |
| assignment_grades | ❌ | None | ✅ |

### Communication
| Table | Access | Scope | Secure? |
|-------|--------|-------|---------|
| direct_messages | 📝 🔒 | Sender or recipient | ✅ |
| discussion_threads | 📝 ⚠️ | Their class threads | ✅ |
| discussion_replies | 📝 🔒 | Own replies | ✅ |
| notifications | 📝 🔒 | Own notifications | ✅ |

### Progress & Analytics
| Table | Access | Scope | Secure? |
|-------|--------|-------|---------|
| student_progress | 🔍 🔒 | Own progress | ✅ |
| activity_log | 📝 🔒 | Own activity | ✅ |
| survey_responses | ✅ 🔒 | Own responses | ✅ |

---

## Teacher Role

### Core Tables
| Table | Access | Scope | Secure? |
|-------|--------|-------|---------|
| profiles | 🔍 ⚠️ | Students + Own | ✅ |
| teacher_profiles | 📝 🔒 | Own profile | ⚠️ INSERT needs role check |
| students | 📝 ⚠️ | Their students | ✅ |
| parent_profiles | 🔍 ⚠️ | Parents of their students | ✅ |

### Class Management
| Table | Access | Scope | Secure? |
|-------|--------|-------|---------|
| classes | ✅ 🔒 | Own classes | ✅ |
| class_students | ✅ ⚠️ | Their class rosters | ✅ |
| class_courses | ✅ ⚠️ | Their classes | ✅ |
| class_messages | ✅ 🔒 | Own class messages | ✅ |
| class_resources | ✅ ⚠️ | Their classes | ⚠️ Check teacher_id |
| classroom_activities | ✅ ⚠️ | Their classes | 🔴 BROKEN teacher_id |

### Learning Content
| Table | Access | Scope | Secure? |
|-------|--------|-------|---------|
| lessons | ✅ ⚠️ | Own + Published | ⚠️ Check teacher_id |
| lesson_components | ✅ ⚠️ | Own classes | ✅ |
| activities | ✅ ⚠️ | Own classes | ✅ |
| lesson_videos | ✅ ⚠️ | Own classes | ✅ |

### Assignments & Grading
| Table | Access | Scope | Secure? |
|-------|--------|-------|---------|
| assignments | ✅ ⚠️ | Via class assignments | ✅ |
| class_assignments_new | ✅ ⚠️ | Own classes | ⚠️ Check teacher_id |
| assignment_submissions | 🔍 ⚠️ | Their class submissions | ✅ |
| assignment_grades | 📝 🔒 | Own grades | 🔴 No assignment ownership check |

### Communication
| Table | Access | Scope | Secure? |
|-------|--------|-------|---------|
| direct_messages | 📝 | Sender/recipient | ✅ |
| parent_teacher_messages | 📝 ⚠️ | Their students' parents | ✅ |
| discussion_threads | ✅ ⚠️ | Their class discussions | ✅ |

### Content Management
| Table | Access | Scope | Secure? |
|-------|--------|-------|---------|
| content_library | ✅ 🔒 | Own + Published | ✅ |
| content_versions | 🔍 🔒 | Own content history | ✅ |

---

## Admin Role

### Access Summary
| Category | Access | Scope | Secure? |
|----------|--------|-------|---------|
| User Management | ✅ | Organization | ✅ |
| Class Management | ✅ | All classes | ⚠️ Very broad |
| Content Management | ✅ | Organization | ✅ |
| System Metrics | ✅ | All | ✅ |
| Role Assignment | ✅ | All roles | ⚠️ Can escalate privileges |

**Note:** Admin role is powerful and should be tightly controlled.

**Recommendation:** 
- Document all admin accounts
- Require MFA for admin access
- Audit admin actions regularly
- Consider splitting into more granular admin roles

---

## Super Admin Role

### Access Summary
| Category | Access | Notes |
|----------|--------|-------|
| Everything | ✅ Full | Expected god mode |

**Security Measures:**
- ✅ Session tracking in `super_admin_sessions`
- ✅ Timestamp-based access control
- ✅ Audit logging of all actions
- ✅ Limited number of super admin accounts

---

## Developer Role

### Access Summary
| Table | Access | Scope | Secure? |
|-------|--------|-------|---------|
| Most production tables | 🔍 | Read-only | ✅ |
| dev_sandbox_* tables | ✅ | Full | ✅ |
| dev_activity_log | ✅ | Full | ✅ |
| impersonation_logs | 📝 | Own logs | ✅ |
| assignment_submissions | ❌ | Blocked | ✅ |
| teacher_profiles | ❌ | Blocked | ✅ |

**Security Level:** EXCELLENT  
**Note:** Proper sandbox isolation prevents accidental production changes

---

## Parent Role

### Access Summary
| Table | Access | Scope | Secure? |
|-------|--------|-------|---------|
| parent_profiles | 📝 🔒 | Own profile | ✅ |
| students | 🔍 ⚠️ | Their children | ✅ |
| student_progress | 🔍 ⚠️ | Their children | ✅ |
| classes | 🔍 ⚠️ | Children's classes | ✅ |
| parent_teacher_messages | 📝 ⚠️ | Own messages | ✅ |
| assignment_submissions | 🔍 ⚠️ | Children's submissions | ✅ |

**Security Level:** GOOD  
**Note:** Proper parent-student relationship verification via `student_parent_relationships`

---

## Public (Unauthenticated) Access

### Tables with Public Read Access
| Table | Access | Condition | Intentional? |
|-------|--------|-----------|--------------|
| classes | 🔍 | published = true | ⚠️ Verify intent |
| demo_tenants | 🔍 | All | ⚠️ Review necessity |
| demo_users | 🔍 | All | ⚠️ Review necessity |

**Recommendation:**
- Document why these tables are public
- Consider using views to limit exposed columns
- Add rate limiting for public endpoints

---

## Tables Without Proper Isolation 🔴

### Critical: Overly Broad Access

1. **lessons** - Any authenticated user can view ALL lessons
2. **lesson_components** - Any authenticated user can view ALL components
3. **demo_users** - Any authenticated user can view ALL demo users
4. **demo_tenants** - Publicly readable (no auth required)

### Moderate: True Conditions

5. **discussion_attachments** - USING (true)
6. **discussion_reactions** - USING (true)
7. **discussion_typing** - USING (true)
8. **mfa_rate_limits** - System managed (true)
9. **system_metrics** - System managed (true)

**Note:** System-managed tables may be intentionally permissive for internal functions.

---

## Security Definer Functions

### ✅ Properly Implemented

```sql
-- Good example with search_path
CREATE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public  -- ✅ Prevents injection
AS $$
  SELECT exists (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### ⚠️ Missing search_path (7 functions)

These functions need `SET search_path = public` added:
1. `update_updated_at_column()`
2. `update_super_admin_session_timestamp()`
3. `update_thread_activity()`
4. `send_grade_notification()`
5. `update_class_publication()`
6. `update_rubric_total_points()`
7. `create_content_version()`

---

## Testing Checklist

### Per-Role Testing

**Student:**
- [ ] Can only view own profile
- [ ] Can only view enrolled classes
- [ ] Cannot view other students' submissions
- [ ] Cannot access teacher-only features
- [ ] Cannot create classes or assignments

**Teacher:**
- [ ] Can only view/edit own classes
- [ ] Can only view students in own classes
- [ ] Cannot access other teachers' classes
- [ ] Cannot assign admin role
- [ ] Can grade only own class assignments

**Admin:**
- [ ] Can view organization data
- [ ] Cannot access other organizations
- [ ] Cannot escalate to super_admin without proper authorization
- [ ] Actions are audit logged

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/security-check.yml
name: Database Security Check
on: [pull_request, push]
jobs:
  rls-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase db lint
```

**Status:** ✅ Workflow created

---

## Quick Fixes

### Apply These Migrations

See [SECURITY_POLICIES.md](SECURITY_POLICIES.md#migration-scripts) for complete SQL scripts to fix:
1. audit_logs INSERT policy
2. teacher_id consistency
3. lessons visibility
4. assignment_grades validation
5. function search_path

**Estimated Time:** 30 minutes  
**Risk Level:** Low (improving security)  
**Testing Required:** Per-role verification

---

## Resources

- [Full Security Audit](SECURITY_POLICIES.md)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [RLS Policy Examples](SECURITY_POLICIES.md#access-control-patterns)

---

**Status:** ⚠️ Action Required  
**Priority:** HIGH  
**Next Review:** After critical fixes applied
