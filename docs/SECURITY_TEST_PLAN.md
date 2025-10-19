# 🔒 TailorEDU Security Test Plan  
**Phase F: Authentication, Compliance, and Data Protection**

## **Purpose**
This test plan verifies that all new security and compliance measures described in `SECURITY_OVERVIEW.md` function as intended.  
The goal is to ensure every TailorEDU environment meets modern data protection standards before the rollout of predictive intelligence features.

---

## **1. Test Environment**
| Component | Requirement |
|------------|-------------|
| Platform | TailorEDU (staging or pre-production build) |
| Database | Supabase with RLS active |
| Roles | Admin, Teacher, Developer, Student |
| Backup System | Enabled with automatic daily scheduling |
| Logging | `security_audit_log` and `impersonation_logs` tables |
| Edge Functions | Logging, Backup Validation, Data Export/Delete |

---

## **2. Authentication & Access Control Tests**

| Test ID | Description | Expected Result | Pass/Fail | Notes |
|----------|--------------|-----------------|------------|-------|
| A1 | Attempt login without 2FA | Blocked, alert shown |  |  |
| A2 | Enable 2FA, login with valid code | Successful authentication |  |  |
| A3 | Attempt login from unauthorized IP | Blocked, log entry created |  |  |
| A4 | Session expires after 30 min inactivity | Forced re-authentication |  |  |
| A5 | Verify RLS policies across tables (`students`, `classes`, `grades`) | Student access isolated |  |  |

---

## **3. Logging & Audit Validation**

| Test ID | Description | Expected Result | Pass/Fail | Notes |
|----------|--------------|-----------------|------------|-------|
| L1 | Successful login event logged in `security_audit_log` | Accurate entry created |  |  |
| L2 | Failed login attempt logged | Includes IP, timestamp |  |  |
| L3 | Role change logged | Admin → Teacher switch recorded |  |  |
| L4 | File upload event logged | Filename + user ID recorded |  |  |
| L5 | Impersonation events logged with source and target roles | Full trace visible |  |  |

---

## **4. Compliance Layer Tests**

| Test ID | Description | Expected Result | Pass/Fail | Notes |
|----------|--------------|-----------------|------------|-------|
| C1 | Parent consent required for new student | Consent flag validated |  |  |
| C2 | Export student data (FERPA request) | Full record returned as JSON |  |  |
| C3 | Delete student record (COPPA request) | Record removed from all tables |  |  |
| C4 | Consent timestamp auto-updates on review | Correct date stored |  |  |

---

## **5. Backup & Monitoring Tests**

| Test ID | Description | Expected Result | Pass/Fail | Notes |
|----------|--------------|-----------------|------------|-------|
| B1 | Scheduled backup completes | Confirmation log created |  |  |
| B2 | Simulate backup failure | Alert notification triggered |  |  |
| B3 | Performance metrics visible in admin dashboard | Chart loads with no error |  |  |
| B4 | Login attempts threshold alert (≥ 5 failures) | Email/SMS alert generated |  |  |

---

## **6. Data Retention & Cleanup**

| Test ID | Description | Expected Result | Pass/Fail | Notes |
|----------|--------------|-----------------|------------|-------|
| D1 | Records older than retention window are flagged | Marked for review or deletion |  |  |
| D2 | Admin runs cleanup script | Log entries archived or deleted |  |  |
| D3 | Backup verifies deleted data no longer present | Confirmed clean state |  |  |

---

## **7. Tester Sign-Off**

| Tester | Role | Date | Status |
|---------|------|------|--------|
|  |  |  | ✅ Pass / ❌ Fail |

---

**References:**  
- `SECURITY_OVERVIEW.md` – Implementation Roadmap  
- Supabase RLS & Auth Documentation  
- U.S. FERPA & COPPA Data Protection Standards  

---
