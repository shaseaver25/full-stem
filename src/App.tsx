import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/config/queryClient";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SuperAdminProvider } from "@/contexts/SuperAdminContext";
import { ImpersonationProvider } from "@/contexts/ImpersonationContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { FocusModeProvider } from "@/contexts/FocusModeContext";
import { AccessibilityToolbar } from "@/components/ui/AccessibilityToolbar";
import { useFocusModeShortcut } from "@/hooks/useFocusModeShortcut";
import { SuperAdminBanner, SuperAdminWatermark } from "@/components/admin/SuperAdminBanner";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Lazy load all page components for code splitting
const Index = React.lazy(() => import("./pages/Index"));
const Auth = React.lazy(() => import("./pages/Auth"));
const TrialPage = React.lazy(() => import("./components/TrialPage"));
const ExcelCourse = React.lazy(() => import("./pages/ExcelCourse"));
const WordCourse = React.lazy(() => import("./pages/WordCourse"));
const PowerPointCourse = React.lazy(() => import("./pages/PowerPointCourse"));
const OutlookCourse = React.lazy(() => import("./pages/OutlookCourse"));
const LessonPage = React.lazy(() => import("./pages/LessonPage"));
const UserPreferences = React.lazy(() => import("./pages/UserPreferences"));
const StudentDashboard = React.lazy(() => import("./pages/student/index"));
const StudentAssignmentDetail = React.lazy(() => import("./pages/student/assignments/[id]/index"));
const StudentAssignmentSubmit = React.lazy(() => import("./pages/student/assignments/[id]/submit"));
const TeacherAssignmentDetail = React.lazy(() => import("./pages/teacher/assignments/[assignmentId]/index"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const TeacherAuth = React.lazy(() => import("./pages/TeacherAuth"));
const TeacherOnboarding = React.lazy(() => import("./pages/TeacherOnboarding"));
const TeacherDashboard = React.lazy(() => import("./components/teacher/TeacherDashboard"));
const ClassDetailPage = React.lazy(() => import("./pages/ClassDetailPage"));
const UnifiedGradebookPage = React.lazy(() => import("./pages/UnifiedGradebookPage"));
const AssignmentSubmissionsPage = React.lazy(() => import("./pages/AssignmentSubmissionsPage"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const BuildClassPage = React.lazy(() => import("./pages/BuildClassPage"));
const LessonBuilderPage = React.lazy(() => import("./pages/teacher/LessonBuilderPage"));
const AnalyticsDashboard = React.lazy(() => import("./pages/AnalyticsDashboard"));
const ContentManagementPage = React.lazy(() => import("./pages/ContentManagementPage"));
const ParentPortalPage = React.lazy(() => import("./pages/ParentPortalPage"));
const AdvancedAdminPage = React.lazy(() => import("./pages/AdvancedAdminPage"));
const CourseEditorPage = React.lazy(() => import("./pages/CourseEditorPage"));
const ComponentsPage = React.lazy(() => import("./pages/ComponentsPage"));
const DeveloperDashboard = React.lazy(() => import("./pages/DeveloperDashboard"));
const SuperAdminDashboard = React.lazy(() => import("./pages/SuperAdminDashboard"));
const ClassManagementPage = React.lazy(() => import("./pages/ClassManagementPage"));
const ClassLessonPage = React.lazy(() => import("./pages/ClassLessonPage"));
const AICourseBuilderPage = React.lazy(() => import("./pages/AICourseBuilderPage"));
const DemoGate = React.lazy(() => import("./pages/DemoGate"));
const DemoStart = React.lazy(() => import("./pages/DemoStart"));
const DemoShowcase = React.lazy(() => import("./pages/DemoShowcase"));
const NewStudentDashboard = React.lazy(() => import("./pages/student/StudentDashboard"));
const TeacherFeedbackDashboard = React.lazy(() => import("./pages/teacher/TeacherFeedbackDashboard"));
const LearningGeniusSurveyPage = React.lazy(() => import("./pages/LearningGeniusSurveyPage"));
const JoinClassPage = React.lazy(() => import("./pages/JoinClassPage"));
const MyClassesPage = React.lazy(() => import("./pages/classes/MyClassesPage"));
const RoleAwareClassDetailPage = React.lazy(() => import("./pages/classes/RoleAwareClassDetailPage"));
const AssignmentsListPage = React.lazy(() => import("./pages/assignments/AssignmentsListPage"));
const AssignmentDetailPage = React.lazy(() => import("./pages/assignments/AssignmentDetailPage"));
const MyGradesPage = React.lazy(() => import("./pages/grades/MyGradesPage"));
const TeacherAnalyticsDashboard = React.lazy(() => import("./pages/teacher/TeacherAnalyticsDashboard"));
const AdminAnalyticsDashboard = React.lazy(() => import("./pages/admin/AdminAnalyticsDashboard"));
const ParentDashboard = React.lazy(() => import("./pages/parent/ParentDashboard"));
const BootstrapDemo = React.lazy(() => import("./pages/BootstrapDemo"));
const AccessDenied = React.lazy(() => import("./pages/AccessDenied"));
const SystemDashboard = React.lazy(() => import("./pages/SystemDashboard"));
const MFASetup = React.lazy(() => import("./pages/MFASetup"));
const MFAVerify = React.lazy(() => import("./pages/MFAVerify"));
const AuthCallback = React.lazy(() => import("./pages/AuthCallback"));

// Eagerly load these smaller components that are used for route protection
import ProtectedTeacherRoute from "./components/teacher/ProtectedTeacherRoute";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import ProtectedParentRoute from "./components/parent/ProtectedParentRoute";
import DeveloperRoute from "./components/developer/DeveloperRoute";
import RequireRole from "./components/auth/RequireRole";
import { StudentSignupForm } from "@/components/auth/student/StudentSignupForm";
import { AdminOnboarding } from "@/components/admin/AdminOnboarding";

// Component that enables keyboard shortcut
function AppContent() {
  // Enable keyboard shortcut for Focus Mode (Ctrl + Alt + F)
  useFocusModeShortcut();

  return (
    <>
      <SuperAdminBanner />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
        <Route path="/" element={<ErrorBoundary><Index /></ErrorBoundary>} />
        <Route path="/bootstrap" element={<ErrorBoundary><BootstrapDemo /></ErrorBoundary>} />
        <Route path="/auth" element={<ErrorBoundary><Auth /></ErrorBoundary>} />
        <Route path="/auth/callback" element={<ErrorBoundary><AuthCallback /></ErrorBoundary>} />
        <Route path="/auth/setup-mfa" element={<ErrorBoundary><MFASetup /></ErrorBoundary>} />
        <Route path="/auth/verify-mfa" element={<ErrorBoundary><MFAVerify /></ErrorBoundary>} />
        <Route path="/signup/student" element={<ErrorBoundary><StudentSignupForm /></ErrorBoundary>} />
        <Route path="/access-denied" element={<ErrorBoundary><AccessDenied /></ErrorBoundary>} />
        <Route 
          path="/dashboard/student" 
          element={
            <ErrorBoundary>
              <RequireRole allowedRoles={['student']}>
                <NewStudentDashboard />
              </RequireRole>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/quiz/learning-genius" 
          element={
            <ErrorBoundary>
              <RequireRole allowedRoles={['student']}>
                <LearningGeniusSurveyPage />
              </RequireRole>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/classes/join" 
          element={
            <ErrorBoundary>
              <RequireRole allowedRoles={['student']}>
                <JoinClassPage />
              </RequireRole>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/classes/my-classes" 
          element={
            <ErrorBoundary>
              <RequireRole allowedRoles={['student']}>
                <MyClassesPage />
              </RequireRole>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/classes/:id" 
          element={
            <ErrorBoundary>
              <RequireRole allowedRoles={['student', 'teacher']}>
                <RoleAwareClassDetailPage />
              </RequireRole>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/assignments" 
          element={
            <ErrorBoundary>
              <RequireRole allowedRoles={['student']}>
                <AssignmentsListPage />
              </RequireRole>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/assignments/:id" 
          element={
            <ErrorBoundary>
              <RequireRole allowedRoles={['student']}>
                <AssignmentDetailPage />
              </RequireRole>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/grades" 
          element={
            <ErrorBoundary>
              <RequireRole allowedRoles={['student']}>
                <MyGradesPage />
              </RequireRole>
            </ErrorBoundary>
          } 
        />
        <Route path="/trial" element={<ErrorBoundary><TrialPage /></ErrorBoundary>} />
        
        {/* Demo Routes */}
        <Route path="/demo" element={<ErrorBoundary><DemoGate /></ErrorBoundary>} />
        <Route path="/demo/start" element={<ErrorBoundary><DemoStart /></ErrorBoundary>} />
        <Route path="/demo/home" element={<ErrorBoundary><Index /></ErrorBoundary>} />
        <Route path="/course/excel" element={<ErrorBoundary><ExcelCourse /></ErrorBoundary>} />
        <Route path="/course/word" element={<ErrorBoundary><WordCourse /></ErrorBoundary>} />
        <Route path="/course/powerpoint" element={<ErrorBoundary><PowerPointCourse /></ErrorBoundary>} />
        <Route path="/course/outlook" element={<ErrorBoundary><OutlookCourse /></ErrorBoundary>} />
        <Route path="/lesson/:lessonId" element={<ErrorBoundary><LessonPage /></ErrorBoundary>} />
        <Route path="/preferences" element={<ErrorBoundary><UserPreferences /></ErrorBoundary>} />
        
        {/* Content Management */}
        <Route 
          path="/content" 
          element={
            <ErrorBoundary>
              <RequireRole allowedRoles={['teacher', 'admin', 'super_admin', 'developer']}>
                <ContentManagementPage />
              </RequireRole>
            </ErrorBoundary>
          } 
        />
        
        {/* Components Showcase */}
        <Route path="/components" element={<ErrorBoundary><ComponentsPage /></ErrorBoundary>} />
        
        {/* Demo Showcase */}
        <Route path="/demo-showcase" element={<ErrorBoundary><DemoShowcase /></ErrorBoundary>} />
        
        {/* Parent Portal */}
        <Route 
          path="/parent" 
          element={
            <ErrorBoundary>
              <RequireRole allowedRoles={['parent']}>
                <ParentPortalPage />
              </RequireRole>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/dashboard/parent" 
          element={
            <ErrorBoundary>
              <ProtectedParentRoute>
                <ParentDashboard />
              </ProtectedParentRoute>
            </ErrorBoundary>
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/onboarding" 
          element={
            <ErrorBoundary>
              <RequireRole allowedRoles={['admin', 'super_admin', 'developer']}>
                <AdminOnboarding />
              </RequireRole>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <ErrorBoundary>
              <RequireRole allowedRoles={['admin', 'super_admin', 'developer']}>
                <AdminDashboard />
              </RequireRole>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/admin/build-class" 
          element={
            <ErrorBoundary>
              <RequireRole allowedRoles={['admin', 'super_admin', 'developer']}>
                <BuildClassPage />
              </RequireRole>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/admin/ai-course-builder" 
          element={
            <ErrorBoundary>
              <RequireRole allowedRoles={['admin', 'super_admin', 'developer']}>
                <AICourseBuilderPage />
              </RequireRole>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/admin/course-editor" 
          element={
            <ErrorBoundary>
              <RequireRole allowedRoles={['admin', 'super_admin', 'developer']}>
                <CourseEditorPage />
              </RequireRole>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/admin/advanced" 
          element={
            <ErrorBoundary>
              <RequireRole allowedRoles={['admin', 'super_admin', 'developer']}>
                <AdvancedAdminPage />
              </RequireRole>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/dashboard/admin/analytics" 
          element={
            <ErrorBoundary>
              <ProtectedAdminRoute>
                <AdminAnalyticsDashboard />
              </ProtectedAdminRoute>
            </ErrorBoundary>
          } 
        />
        
        {/* Super Admin Route */}
        <Route 
          path="/super-admin" 
          element={
            <ErrorBoundary>
              <RequireRole allowedRoles={['super_admin', 'developer']}>
                <SuperAdminDashboard />
              </RequireRole>
            </ErrorBoundary>
          } 
        />
        
        {/* System Administrator Route */}
        <Route 
          path="/system-dashboard" 
          element={
            <ErrorBoundary>
              <RequireRole allowedRoles={['system_admin', 'developer']}>
                <SystemDashboard />
              </RequireRole>
            </ErrorBoundary>
          } 
        />
        
        {/* Developer Routes */}
        <Route 
          path="/dev" 
          element={
            <ErrorBoundary>
              <DeveloperRoute>
                <DeveloperDashboard />
              </DeveloperRoute>
            </ErrorBoundary>
          } 
        />

        {/* Student Routes */}
        <Route 
          path="/student" 
          element={
            <ErrorBoundary>
              <RequireRole allowedRoles={['student']}>
                <StudentDashboard />
              </RequireRole>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/student/assignments/:id" 
          element={
            <ErrorBoundary>
              <RequireRole allowedRoles={['student']}>
                <StudentAssignmentDetail />
              </RequireRole>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/student/assignments/:id/submit" 
          element={
            <ErrorBoundary>
              <RequireRole allowedRoles={['student']}>
                <StudentAssignmentSubmit />
              </RequireRole>
            </ErrorBoundary>
          } 
        />
        
        {/* Teacher Routes */}
        <Route path="/teacher/auth" element={<ErrorBoundary><TeacherAuth /></ErrorBoundary>} />
        <Route 
          path="/teacher/onboarding" 
          element={
            <ErrorBoundary>
              <ProtectedTeacherRoute requireOnboarding={false}>
                <TeacherOnboarding />
              </ProtectedTeacherRoute>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/teacher/dashboard" 
          element={
            <ErrorBoundary>
              <ProtectedTeacherRoute requireOnboarding={true}>
                <TeacherDashboard />
              </ProtectedTeacherRoute>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/teacher/gradebook" 
          element={
            <ErrorBoundary>
              <ProtectedTeacherRoute requireOnboarding={true}>
                <UnifiedGradebookPage />
              </ProtectedTeacherRoute>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/teacher/submissions" 
          element={
            <ErrorBoundary>
              <ProtectedTeacherRoute requireOnboarding={true}>
                <AssignmentSubmissionsPage />
              </ProtectedTeacherRoute>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/teacher/analytics" 
          element={
            <ErrorBoundary>
              <ProtectedTeacherRoute requireOnboarding={true}>
                <AnalyticsDashboard />
              </ProtectedTeacherRoute>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/teacher/classes" 
          element={
            <ErrorBoundary>
              <ProtectedTeacherRoute requireOnboarding={true}>
                <TeacherDashboard />
              </ProtectedTeacherRoute>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/teacher/classes/:classId" 
          element={
            <ErrorBoundary>
              <ProtectedTeacherRoute requireOnboarding={true}>
                <ClassDetailPage />
              </ProtectedTeacherRoute>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/teacher/classes/:classId/edit" 
          element={
            <ErrorBoundary>
              <ProtectedTeacherRoute requireOnboarding={true}>
                <BuildClassPage />
              </ProtectedTeacherRoute>
            </ErrorBoundary>
          } 
        />
        <Route
          path="/class-lesson/:lessonId" 
          element={
            <ErrorBoundary>
              <ProtectedTeacherRoute requireOnboarding={true}>
                <ClassLessonPage />
              </ProtectedTeacherRoute>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/teacher/assignments/:assignmentId" 
          element={
            <ErrorBoundary>
              <ProtectedTeacherRoute>
                <TeacherAssignmentDetail />
              </ProtectedTeacherRoute>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/teacher/feedback" 
          element={
            <ErrorBoundary>
              <ProtectedTeacherRoute requireOnboarding={true}>
                <TeacherFeedbackDashboard />
              </ProtectedTeacherRoute>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/dashboard/teacher/analytics" 
          element={
            <ErrorBoundary>
              <ProtectedTeacherRoute requireOnboarding={true}>
                <TeacherAnalyticsDashboard />
              </ProtectedTeacherRoute>
            </ErrorBoundary>
          } 
        />
        
        <Route
          path="/teacher/build-class/:classId?"
          element={
            <ErrorBoundary>
              <ProtectedTeacherRoute requireOnboarding={true}>
                <BuildClassPage />
              </ProtectedTeacherRoute>
            </ErrorBoundary>
          } 
        />
        
        <Route
          path="/teacher/lesson-builder/:lessonId?" 
          element={
            <ErrorBoundary>
              <ProtectedTeacherRoute requireOnboarding={true}>
                <LessonBuilderPage />
              </ProtectedTeacherRoute>
            </ErrorBoundary>
          } 
        />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<ErrorBoundary><NotFound /></ErrorBoundary>} />
        </Routes>
      </Suspense>
      <SuperAdminWatermark />
    </>
  );
}

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AccessibilityProvider>
          <FocusModeProvider>
            <SuperAdminProvider>
              <ImpersonationProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <div className="min-h-screen bg-background">
                      <AppContent />
                      <AccessibilityToolbar />
                    </div>
                  </BrowserRouter>
                </TooltipProvider>
              </ImpersonationProvider>
            </SuperAdminProvider>
          </FocusModeProvider>
        </AccessibilityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
