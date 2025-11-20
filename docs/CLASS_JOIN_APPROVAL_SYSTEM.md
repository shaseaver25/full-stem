# 📋 Class Join Approval System Implementation Guide

## Overview
The class join approval system has been implemented to prevent unauthorized access to classrooms. Students must now request permission from teachers before joining a class.

## 🔴 Critical Fix Implemented
**SECURITY BUG FIXED**: New accounts now default to "student" role instead of "teacher" role.

### Database Changes
1. `handle_new_user()` function updated to default new users to "student" role
2. New table `classroom_join_requests` created to track join requests
3. RLS policies implemented to secure the approval workflow
4. New RPC functions created:
   - `request_to_join_class()` - Students request to join
   - `approve_join_request()` - Teachers approve requests
   - `reject_join_request()` - Teachers reject requests

### Frontend Components Created
1. **JoinRequestModal** - Student UI to request class access
2. **JoinRequestCard** - Teacher UI to review individual requests
3. **PendingRequestsList** - Student UI to view pending requests
4. **TeacherJoinRequestsPanel** - Teacher dashboard panel for all requests

### Hooks Created
All in `src/hooks/useJoinRequests.ts`:
- `useRequestToJoinClass()` - Student requests access
- `useStudentJoinRequests()` - Student views their requests
- `useTeacherJoinRequests()` - Teacher views pending requests
- `useApproveJoinRequest()` - Teacher approves a request
- `useRejectJoinRequest()` - Teacher rejects a request
- `useCancelJoinRequest()` - Student cancels pending request

## 🎓 Student Workflow

### 1. Request to Join a Class
```typescript
import { JoinRequestModal } from '@/components/classroom/JoinRequestModal';

// In your component:
const [showJoinModal, setShowJoinModal] = useState(false);

<Button onClick={() => setShowJoinModal(true)}>
  Request to Join Class
</Button>

<JoinRequestModal 
  open={showJoinModal} 
  onOpenChange={setShowJoinModal} 
/>
```

### 2. View Pending Requests
```typescript
import { PendingRequestsList } from '@/components/classroom/PendingRequestsList';

// In student dashboard:
<PendingRequestsList />
```

### 3. Cancel a Request
```typescript
import { useCancelJoinRequest } from '@/hooks/useJoinRequests';

const { mutate: cancelRequest } = useCancelJoinRequest();

<Button onClick={() => cancelRequest(requestId)}>
  Cancel Request
</Button>
```

## 👨‍🏫 Teacher Workflow

### 1. View All Pending Requests
```typescript
import { TeacherJoinRequestsPanel } from '@/components/classroom/TeacherJoinRequestsPanel';

// In teacher dashboard:
<TeacherJoinRequestsPanel />

// Or for a specific class:
<TeacherJoinRequestsPanel classId={classId} />
```

### 2. Approve/Reject Requests
The `JoinRequestCard` component handles this automatically. Teachers can:
- Click "Approve" to add student to class
- Click "Reject" to decline (with optional reason)

### 3. View Request Count
```typescript
import { useTeacherJoinRequests } from '@/hooks/useJoinRequests';

const { data: requests } = useTeacherJoinRequests();
const pendingCount = requests?.length || 0;

<Badge>{pendingCount} pending requests</Badge>
```

## 🔒 Security Features

### Row Level Security (RLS)
All policies are implemented on `classroom_join_requests` table:
- Students can only view/create their own requests
- Students can only cancel pending requests (not approved/rejected)
- Teachers can only view/update requests for their own classes
- Admins/Developers can view all requests

### Data Validation
- Duplicate requests prevented (UNIQUE constraint on class_id + student_id)
- Request status validated (CHECK constraint: pending/approved/rejected)
- Classroom capacity checks happen at approval time

### Audit Trail
- `approved_by` and `approved_at` tracked in `class_students` table
- `reviewed_by` and `reviewed_at` tracked in `classroom_join_requests` table
- All actions are logged with timestamps

## 📊 Database Schema

### classroom_join_requests Table
```sql
CREATE TABLE classroom_join_requests (
  id UUID PRIMARY KEY,
  class_id UUID REFERENCES classes(id),
  student_id UUID REFERENCES students(id),
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')),
  message TEXT,
  rejection_reason TEXT,
  requested_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(class_id, student_id)
);
```

### class_students Updates
```sql
ALTER TABLE class_students 
ADD COLUMN approved_by UUID REFERENCES profiles(id),
ADD COLUMN approved_at TIMESTAMP;
```

## 🧪 Testing Checklist

### Student Tests
- [x] New student accounts default to "student" role
- [ ] Student can request to join a class with code
- [ ] Student can include optional message
- [ ] Student sees pending status after requesting
- [ ] Student receives notification when approved
- [ ] Student receives notification when rejected
- [ ] Student can cancel pending request
- [ ] Student cannot re-request immediately after rejection
- [ ] Student cannot request same class twice

### Teacher Tests
- [ ] Teacher sees pending requests in dashboard
- [ ] Teacher can view student info (name, email, message)
- [ ] Teacher can approve request → student gets access
- [ ] Teacher can reject request → student doesn't get access
- [ ] Teacher can provide rejection reason
- [ ] Teacher sees updated count after approval/rejection
- [ ] Approved student automatically gets assignment submissions created

### Security Tests
- [ ] Students cannot approve their own requests
- [ ] Students cannot access unapproved classes
- [ ] Teachers cannot approve requests for other teachers' classes
- [ ] RLS policies prevent unauthorized access
- [ ] Duplicate requests are blocked

## 🚀 Migration Steps

### For Existing Codebases

1. **Run the database migration** (already applied)
   - Creates `classroom_join_requests` table
   - Updates `handle_new_user()` function
   - Adds RLS policies
   - Creates RPC functions

2. **Update student enrollment UI**
   Replace direct enrollment with approval request:
   ```typescript
   // OLD (direct enrollment):
   import { useClassEnrollment } from '@/hooks/useClassEnrollment';
   const { mutate: enroll } = useClassEnrollment();
   
   // NEW (approval request):
   import { useRequestToJoinClass } from '@/hooks/useJoinRequests';
   const { mutate: requestJoin } = useRequestToJoinClass();
   ```

3. **Add teacher approval UI**
   Add to teacher dashboard:
   ```typescript
   import { TeacherJoinRequestsPanel } from '@/components/classroom/TeacherJoinRequestsPanel';
   
   <TeacherJoinRequestsPanel />
   ```

4. **Add student pending requests UI**
   Add to student dashboard:
   ```typescript
   import { PendingRequestsList } from '@/components/classroom/PendingRequestsList';
   
   <PendingRequestsList />
   ```

## 💡 Best Practices

1. **Show request count badges** to draw teacher attention
2. **Send email notifications** when requests are approved/rejected (future enhancement)
3. **Implement rate limiting** on join requests (max 5 per hour per student)
4. **Auto-reject requests** for archived or full classes
5. **Provide clear feedback** about why a request was rejected

## 🔄 Backward Compatibility

The old `useClassEnrollment` hook is marked as deprecated but still functional for:
- Developer/admin tools
- Testing purposes
- Gradual migration

However, the new approval system should be used for all student-facing features.

## 📝 Future Enhancements

- [ ] Email notifications for approval/rejection
- [ ] Bulk approve/reject functionality
- [ ] Auto-approve based on whitelist/criteria
- [ ] Request expiration (auto-reject after X days)
- [ ] Student request history view
- [ ] Teacher notification preferences
- [ ] Integration with school SIS systems

## 🐛 Troubleshooting

### Students Not Seeing Classes After Approval
- Check `class_students` table for `status = 'active'`
- Verify `approved_by` and `approved_at` are set
- Invalidate React Query cache: `queryClient.invalidateQueries({ queryKey: ['studentClasses'] })`

### Teachers Not Seeing Requests
- Verify teacher owns the class (check `classes.teacher_id`)
- Check RLS policies on `classroom_join_requests`
- Ensure request status is 'pending'

### Duplicate Request Errors
- This is expected behavior (UNIQUE constraint prevents duplicates)
- Show friendly message: "You already have a pending request for this class"

## 📚 Related Documentation

- [Security Test Plan](./SECURITY_TEST_PLAN.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [RLS Policies Guide](./RLS_POLICIES.md)
