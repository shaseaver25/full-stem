
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import TrialPage from "./components/TrialPage";
import ExcelCourse from "./pages/ExcelCourse";
import WordCourse from "./pages/WordCourse";
import PowerPointCourse from "./pages/PowerPointCourse";
import OutlookCourse from "./pages/OutlookCourse";
import LessonPage from "./pages/LessonPage";
import UserPreferences from "./pages/UserPreferences";
import StudentDashboard from "./pages/student/index";
import StudentAssignmentDetail from "./pages/student/assignments/[id]/index";
import StudentAssignmentSubmit from "./pages/student/assignments/[id]/submit";
import TeacherAssignmentDetail from "./pages/teacher/assignments/[assignmentId]/index";
import NotFound from "./pages/NotFound";
import TeacherAuth from "./pages/TeacherAuth";
import TeacherOnboarding from "./pages/TeacherOnboarding";
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import ClassDetailPage from "./pages/ClassDetailPage";
import ProtectedTeacherRoute from "./components/teacher/ProtectedTeacherRoute";
import { default as UnifiedGradebookPage } from "./pages/UnifiedGradebookPage";
import AssignmentSubmissionsPage from "./pages/AssignmentSubmissionsPage";
import AdminDashboard from "./pages/AdminDashboard";
import BuildClassPage from "./pages/BuildClassPage";
import LessonBuilderPage from "./pages/teacher/LessonBuilderPage";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import ContentManagementPage from "./pages/ContentManagementPage";
import ParentPortalPage from "./pages/ParentPortalPage";
import AdvancedAdminPage from "./pages/AdvancedAdminPage";
import CourseEditorPage from "./pages/CourseEditorPage";
import ComponentsPage from "./pages/ComponentsPage";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import DeveloperRoute from "./components/developer/DeveloperRoute";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import ClassManagementPage from "./pages/ClassManagementPage";
import ClassLessonPage from "./pages/ClassLessonPage";
import AICourseBuilderPage from "./pages/AICourseBuilderPage";
import DemoGate from "./pages/DemoGate";
import DemoStart from "./pages/DemoStart";
import DemoShowcase from "./pages/DemoShowcase";
import { StudentSignupForm } from "@/components/auth/student/StudentSignupForm";
import NewStudentDashboard from "@/pages/dashboard/StudentDashboard";
import TeacherFeedbackDashboard from "@/pages/dashboard/teacher/TeacherFeedbackDashboard";
import LearningGeniusSurveyPage from "./pages/LearningGeniusSurveyPage";
import JoinClassPage from "./pages/JoinClassPage";
import MyClassesPage from "./pages/classes/MyClassesPage";
import RoleAwareClassDetailPage from "./pages/classes/RoleAwareClassDetailPage";
import AssignmentsListPage from "./pages/assignments/AssignmentsListPage";
import AssignmentDetailPage from "./pages/assignments/AssignmentDetailPage";
import MyGradesPage from "./pages/grades/MyGradesPage";
import TeacherAnalyticsDashboard from "./pages/dashboard/teacher/TeacherAnalyticsDashboard";
import AdminAnalyticsDashboard from "./pages/dashboard/admin/AdminAnalyticsDashboard";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import ParentDashboard from "./pages/dashboard/parent/ParentDashboard";
import ProtectedParentRoute from "./components/parent/ProtectedParentRoute";
import BootstrapDemo from "./pages/BootstrapDemo";
import RequireRole from "./components/auth/RequireRole";
import AccessDenied from "./pages/AccessDenied";
import { AdminOnboarding } from "@/components/admin/AdminOnboarding";
import SystemDashboard from "./pages/SystemDashboard";
import MFASetup from "./pages/MFASetup";
import MFAVerify from "./pages/MFAVerify";
import AuthCallback from "./pages/AuthCallback";

const queryClient = new QueryClient();

// Component that enables keyboard shortcut
function AppContent() {
  // Enable keyboard shortcut for Focus Mode (Ctrl + Alt + F)
  useFocusModeShortcut();

  return (
    <>
      <SuperAdminBanner />
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
