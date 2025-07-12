# TailorEDU Platform - Developer Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Development History](#development-history)
4. [Database Schema](#database-schema)
5. [Working Features](#working-features)
6. [Authentication & Authorization](#authentication--authorization)
7. [API Reference](#api-reference)
8. [Development Setup](#development-setup)
9. [Deployment](#deployment)

## Project Overview

**TailorEDU** is a comprehensive educational platform designed to provide personalized learning experiences for students while offering powerful management tools for teachers, parents, and administrators.

### Core Mission
- Deliver adaptive, multi-level content (Grade 3, 5, 8 reading levels)
- Support multiple learning modalities (text, audio, visual)
- Enable real-time translation and accessibility features
- Provide comprehensive classroom management tools

### Target Users
- **Students**: Access personalized learning content with adaptive features
- **Teachers**: Manage classes, assignments, grades, and student progress
- **Parents**: Monitor student progress and communicate with teachers
- **Administrators**: Oversee platform operations and user management
- **Developers**: System maintenance and feature development

## Architecture & Technology Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: Shadcn/ui component library
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: React Router DOM 6.26.2
- **Forms**: React Hook Form with Zod validation

### Backend & Services
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **File Storage**: Supabase Storage
- **Edge Functions**: Supabase Functions
- **Translation**: OpenAI API integration

### Development Tools
- **Testing**: Vitest with Testing Library
- **Storybook**: Component documentation and testing
- **Linting**: ESLint
- **Package Manager**: npm
- **Version Control**: Git with GitHub integration

## Development History

### Phase 1: Foundation (Initial Release)
- Basic course delivery system with Excel, Word, PowerPoint, and Outlook tracks
- Static lesson content with basic navigation
- User preference system for reading levels and languages
- Text-to-speech functionality
- Real-time translation capabilities

### Phase 2: Multi-User System
- Authentication system implementation
- User roles and permissions (students, teachers, parents, admins)
- Teacher profile management and onboarding
- Class creation and management system
- Student enrollment and class association

### Phase 3: Assignment & Grading System
- Assignment creation and submission system
- File upload capabilities with multiple format support
- Rubric-based grading system
- Grade categories and weighted calculations
- Progress tracking and analytics

### Phase 4: Communication & Collaboration
- Direct messaging between users
- Class announcements and notifications
- Parent-teacher communication portal
- Student progress reporting for parents

### Phase 5: Advanced Features
- Content library for teachers
- Version control for educational content
- Advanced admin panel with user management
- Performance monitoring and backup systems
- Developer tools and impersonation capabilities

### Phase 6: Current State
- Comprehensive role-based access control
- Full CRUD operations for all major entities
- Real-time notifications and messaging
- Advanced grading and analytics
- Mobile-responsive design

## Database Schema

### Core Tables (42 total)

#### User Management
- `profiles` - Extended user information
- `user_roles` - Role assignments (admin, moderator, user, developer)
- `user_role_permissions` - Permission matrix
- `teacher_profiles` - Teacher-specific data
- `parent_profiles` - Parent information
- `students` - Student records

#### Educational Content
- `Lessons` - Core lesson content with multi-level text
- `lessons` - Class-specific lesson instances
- `class_lessons` - Lesson planning for classes
- `activities` - Learning activities within lessons
- `lesson_videos` - Video content for lessons
- `content_library` - Reusable educational resources
- `content_versions` - Version control for content

#### Class Management
- `classes` - Class definitions and metadata
- `class_courses` - Course track assignments
- `class_assignments` - Legacy assignment system
- `class_assignments_new` - Enhanced assignment system
- `published_assignments` - Active assignments for students

#### Assessment & Grading
- `assignments` - Assignment definitions
- `assignment_submissions` - Student submissions
- `assignment_grades` - Grading records
- `grades` - Comprehensive grade tracking
- `grade_categories` - Grade organization
- `rubrics` - Assessment rubrics
- `rubric_criteria` - Rubric breakdown
- `rubric_grades` - Rubric-based assessments
- `gradebook_summary` - Calculated grade summaries

#### Progress & Analytics
- `user_progress` - Individual lesson progress
- `student_progress` - Class-based progress tracking
- `performance_metrics` - System performance data

#### Communication
- `direct_messages` - User-to-user messaging
- `class_messages` - Class announcements
- `message_recipients` - Message delivery tracking
- `parent_teacher_messages` - Specialized parent communication
- `notifications` - System notifications

#### Relationships
- `student_parent_relationships` - Family connections with permissions

#### System Administration
- `backup_logs` - System backup tracking
- `support_sessions` - Teacher support management
- `lesson_feedback` - Quality improvement data
- `developer_settings` - Developer tool configurations
- `impersonation_logs` - Developer action tracking

#### Configuration
- `User Preferences` - User customization settings
- `classroom_activities` - Class activity planning
- `individual_activities` - Personal learning activities
- `class_resources` - Educational materials

## Working Features

### Student Features
- ✅ Multi-track course access (Excel, Word, PowerPoint, Outlook)
- ✅ Adaptive content delivery (Grade 3, 5, 8 reading levels)
- ✅ Text-to-speech functionality
- ✅ Real-time translation (40+ languages)
- ✅ Progress tracking and lesson completion
- ✅ Assignment submission with file uploads
- ✅ Personal preferences management

### Teacher Features
- ✅ Class creation and management
- ✅ Student enrollment and roster management
- ✅ Lesson planning and content creation
- ✅ Assignment creation with rubrics
- ✅ Grading and feedback system
- ✅ Progress monitoring and analytics
- ✅ Direct messaging with students/parents
- ✅ Class announcements
- ✅ Content library access
- ✅ Gradebook management

### Parent Features
- ✅ Student progress monitoring
- ✅ Teacher communication portal
- ✅ Grade and assignment viewing
- ✅ Progress reports and analytics

### Administrator Features
- ✅ User management and role assignment
- ✅ System performance monitoring
- ✅ Backup management
- ✅ Content oversight
- ✅ Teacher support coordination
- ✅ Platform analytics

### Developer Features
- ✅ User impersonation for debugging
- ✅ System logs and monitoring
- ✅ Database query tools
- ✅ Performance metrics
- ✅ Action logging and audit trails

## Authentication & Authorization

### Authentication System
- **Provider**: Supabase Auth
- **Methods**: Email/Password (primary)
- **Session Management**: JWT tokens with automatic refresh
- **Security**: Row Level Security (RLS) policies on all tables

### Role-Based Access Control
```typescript
enum AppRole {
  'admin' = 'admin',
  'moderator' = 'moderator', 
  'user' = 'user',
  'developer' = 'developer'
}
```

### Permission System
- Fine-grained permissions for each role
- Database-enforced security policies
- Context-aware access control (e.g., teachers can only access their classes)

## API Reference

### Supabase Client
```typescript
import { supabase } from "@/integrations/supabase/client";
```

### Key API Patterns

#### Authentication
```typescript
// Sign up
await supabase.auth.signUp({
  email,
  password,
  options: { emailRedirectTo: `${window.location.origin}/` }
});

// Sign in
await supabase.auth.signInWithPassword({ email, password });

// Sign out
await supabase.auth.signOut();
```

#### Data Operations
```typescript
// Select with RLS
const { data, error } = await supabase
  .from('classes')
  .select('*')
  .eq('teacher_id', teacherId);

// Insert with RLS
const { error } = await supabase
  .from('assignments')
  .insert({ title, instructions, lesson_id });
```

#### Real-time Subscriptions
```typescript
const subscription = supabase
  .channel('notifications')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'notifications' },
    payload => handleNewNotification(payload.new)
  )
  .subscribe();
```

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase CLI (optional)
- Git

### Environment Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure Supabase connection in `src/integrations/supabase/client.ts`
4. Start development server: `npm run dev`

### Key Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run test suite
- `npm run storybook` - Start Storybook
- `npm run lint` - Run ESLint

### Database Migrations
Migrations are located in `supabase/migrations/` and are automatically applied.

## Deployment

### Production Deployment
- **Platform**: Lovable.dev hosting
- **Database**: Supabase cloud instance
- **Domain**: Custom domain support available
- **SSL**: Automatic HTTPS

### Environment Variables
- Supabase project configuration is embedded
- No additional environment variables required for basic deployment

## Development Guidelines

### Code Organization
- Components organized by feature/domain
- Hooks in dedicated `hooks/` directory
- Services layer for business logic
- Type definitions in `types/` directory

### Styling Guidelines
- Use design tokens from `index.css`
- Semantic color naming (primary, secondary, accent)
- Mobile-first responsive design
- Consistent spacing and typography

### Testing Strategy
- Unit tests for utility functions
- Component testing with Testing Library
- Integration tests for complex workflows
- Storybook for component documentation

### Security Best Practices
- All database access through RLS policies
- Input validation with Zod schemas
- Secure file upload handling
- Regular security audits

---

## Support & Maintenance

### Monitoring
- Database performance tracking
- Error logging and alerting
- User activity analytics
- System health metrics

### Backup Strategy
- Automated database backups
- File storage redundancy
- Configuration versioning
- Disaster recovery procedures

### Version Control
- Semantic versioning
- Feature branch workflow
- Code review requirements
- Automated testing on PRs

---

*Last updated: July 12, 2025*
*Platform Version: 1.0.0*
*Documentation maintained by: Development Team*