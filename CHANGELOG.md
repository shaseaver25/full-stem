# TailoredU Platform Changelog

All notable changes to the TailoredU platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to semantic versioning principles.

---

## [Unreleased]

### November 10, 2025 - Morning Session

#### Added
- Dashboard navigation button in Header for authenticated users (#UX-001)
  - Button appears in both desktop and mobile views
  - Redirects users to their role-specific dashboard
  - Improves navigation from landing page

- AI Cost Tracking micro-precision display (#DEV-003)
  - Costs under $0.01 now display with 4 decimal places
  - Shows costs as low as $0.0001 accurately
  - Better visibility for translation and small AI operations

- Pagination controls for AI usage logs (#DEV-004)
  - "Load 25 More" button for incremental loading
  - "Show All" toggle to view complete log history
  - Dynamic counter showing X of Y calls

#### Fixed
- Page refresh redirect bug on `/dev` route (#AUTH-002)
  - Fixed race condition in `useUserRole` hook
  - Now waits for authentication context to fully load before checking roles
  - Prevents premature redirects to landing page
  - **Files Changed:** `src/hooks/useUserRole.ts`

- AI usage logs visibility issue (#DEV-001)
  - Updated RLS policy to use `user_roles` table instead of `profiles`
  - Developers now see all AI logs including those with null `user_id`
  - Visibility increased from 1 to 6 logs (500% improvement)
  - **Database Changes:** Updated RLS policy on `ai_usage_logs` table

#### Changed
- RLS policy architecture for `ai_usage_logs` (#SEC-001)
  - Now uses `user_roles` table for consistent RBAC implementation
  - Grants access to developers, admins, system_admins, and super_admins
  - Aligns with security best practices
  - **Security Impact:** Improved RBAC consistency

#### Documentation
- Created comprehensive development session report: `DEVELOPMENT_SESSION_2025-11-10.md`
- Updated `AUDIT_REPORT_1_AUTHENTICATION.md` with RBAC improvements
- Updated `AUDIT_REPORT_5_ADMIN_TOOLS.md` with AI cost tracking section
- Created `CHANGELOG.md` for ongoing change tracking

#### Impact Summary
- **Security:** Enhanced RLS policies with proper RBAC
- **UX:** Fixed 2 critical navigation issues
- **Visibility:** Complete AI usage data now accessible to developers
- **Accuracy:** Micro-cost tracking for financial precision

---

## Version History

### Pre-November 2025
- Initial platform development
- Multi-role authentication system
- Interactive lesson components
- Quiz and poll systems
- Conference features
- Admin tools foundation
- Accessibility infrastructure
- Payment integration preparation

For detailed historical information, see:
- `AUDIT_REPORT_1_AUTHENTICATION.md`
- `AUDIT_REPORT_2_INTERACTIVE_COMPONENTS.md`
- `AUDIT_REPORT_3_CONFERENCE_FEATURES.md`
- `AUDIT_REPORT_4_QUIZ_POLL_SYSTEMS.md`
- `AUDIT_REPORT_5_ADMIN_TOOLS.md`
- `AUDIT_REPORT_6_PAYMENT_INTEGRATION.md`
- `AUDIT_REPORT_7_ACCESSIBILITY.md`

---

## Issue Tracking

### Critical Issues Resolved
- ✅ AUTH-002: Page refresh redirect bug
- ✅ DEV-001: AI usage logs not showing all calls
- ✅ UX-001: No navigation back to dashboard from landing page
- ✅ DEV-003: Micro-cost display precision
- ✅ SEC-001: Inconsistent RLS policy implementation

### Outstanding Issues
- See individual audit reports for prioritized issues

---

## Contributing

For information on contributing to this project, please contact the development team.

## Support

For technical support or questions about changes, refer to:
- Development session reports in project root
- Audit reports for feature documentation
- This changelog for recent changes
