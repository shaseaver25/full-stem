
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
import { SuperAdminBanner, SuperAdminWatermark } from "@/components/admin/SuperAdminBanner";
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
import TeacherClasses from "./pages/TeacherClasses";
import ClassDetailPage from "./pages/ClassDetailPage";
import ProtectedTeacherRoute from "./components/teacher/ProtectedTeacherRoute";
import { default as UnifiedGradebookPage } from "./pages/UnifiedGradebookPage";
import GradebookPage from "./pages/GradebookPage";
import AssignmentSubmissionsPage from "./pages/AssignmentSubmissionsPage";
import AdminDashboard from "./pages/AdminDashboard";
import BuildClassPage from "./pages/BuildClassPage";
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
import StudentClassDetailPage from "./pages/classes/ClassDetailPage";
import AssignmentsListPage from "./pages/assignments/AssignmentsListPage";
import AssignmentDetailPage from "./pages/assignments/AssignmentDetailPage";
import MyGradesPage from "./pages/grades/MyGradesPage";
import TeacherAnalyticsDashboard from "./pages/dashboard/teacher/TeacherAnalyticsDashboard";
import AdminAnalyticsDashboard from "./pages/dashboard/admin/AdminAnalyticsDashboard";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import ParentDashboard from "./pages/dashboard/parent/ParentDashboard";
import ProtectedParentRoute from "./components/parent/ProtectedParentRoute";

const queryClient = new QueryClient();

console.log('App.tsx loading, React available:', typeof React);

const App: React.FC = () => {
  console.log('App rendering, React available:', typeof React);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AccessibilityProvider>
          <SuperAdminProvider>
            <ImpersonationProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <div className="min-h-screen bg-background">
                    <SuperAdminBanner />
                  <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
          <Route path="/signup/student" element={<StudentSignupForm />} />
          <Route path="/dashboard/student" element={<NewStudentDashboard />} />
          <Route path="/quiz/learning-genius" element={<LearningGeniusSurveyPage />} />
          <Route path="/classes/join" element={<JoinClassPage />} />
          <Route path="/classes/my-classes" element={<MyClassesPage />} />
          <Route path="/classes/:id" element={<StudentClassDetailPage />} />
          <Route path="/assignments" element={<AssignmentsListPage />} />
          <Route path="/assignments/:id" element={<AssignmentDetailPage />} />
          <Route path="/grades" element={<MyGradesPage />} />
          <Route path="/trial" element={<TrialPage />} />
            
            {/* Demo Routes */}
            <Route path="/demo" element={<DemoGate />} />
            <Route path="/demo/start" element={<DemoStart />} />
            <Route path="/demo/home" element={<Index />} />
            <Route path="/course/excel" element={<ExcelCourse />} />
            <Route path="/course/word" element={<WordCourse />} />
            <Route path="/course/powerpoint" element={<PowerPointCourse />} />
            <Route path="/course/outlook" element={<OutlookCourse />} />
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
            <Route path="/preferences" element={<UserPreferences />} />
            
            {/* Content Management */}
            <Route path="/content" element={<ContentManagementPage />} />
            
            {/* Components Showcase */}
            <Route path="/components" element={<ComponentsPage />} />
            
            {/* Demo Showcase */}
            <Route path="/demo-showcase" element={<DemoShowcase />} />
            
            {/* Parent Portal */}
            <Route path="/parent" element={<ParentPortalPage />} />
            <Route 
              path="/dashboard/parent" 
              element={
                <ProtectedParentRoute>
                  <ParentDashboard />
                </ProtectedParentRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/build-class" element={<BuildClassPage />} />
            <Route path="/admin/ai-course-builder" element={<AICourseBuilderPage />} />
            <Route path="/admin/course-editor" element={<CourseEditorPage />} />
            <Route path="/admin/advanced" element={<AdvancedAdminPage />} />
            <Route 
              path="/dashboard/admin/analytics" 
              element={
                <ProtectedAdminRoute>
                  <AdminAnalyticsDashboard />
                </ProtectedAdminRoute>
              } 
            />
            
            {/* Super Admin Route */}
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
            
            {/* Developer Routes */}
            <Route 
              path="/dev" 
              element={
                <DeveloperRoute>
                  <DeveloperDashboard />
                </DeveloperRoute>
              } 
            />
            
            {/* Student Routes */}
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/assignments/:id" element={<StudentAssignmentDetail />} />
            <Route path="/student/assignments/:id/submit" element={<StudentAssignmentSubmit />} />
            
            {/* Teacher Routes */}
            <Route path="/teacher/auth" element={<TeacherAuth />} />
            <Route 
              path="/teacher/onboarding" 
              element={
                <ProtectedTeacherRoute requireOnboarding={false}>
                  <TeacherOnboarding />
                </ProtectedTeacherRoute>
              } 
            />
            <Route 
              path="/teacher/dashboard" 
              element={
                <ProtectedTeacherRoute requireOnboarding={true}>
                  <TeacherDashboard />
                </ProtectedTeacherRoute>
              } 
            />
            <Route 
              path="/teacher/gradebook" 
              element={
                <ProtectedTeacherRoute requireOnboarding={true}>
                  <UnifiedGradebookPage />
                </ProtectedTeacherRoute>
              } 
            />
            <Route 
              path="/teacher/assignment-gradebook" 
              element={
                <ProtectedTeacherRoute requireOnboarding={true}>
                  <UnifiedGradebookPage />
                </ProtectedTeacherRoute>
              } 
            />
            <Route 
              path="/teacher/submissions" 
              element={
                <ProtectedTeacherRoute requireOnboarding={true}>
                  <AssignmentSubmissionsPage />
                </ProtectedTeacherRoute>
              } 
            />
            <Route 
              path="/teacher/analytics" 
              element={
                <ProtectedTeacherRoute requireOnboarding={true}>
                  <AnalyticsDashboard />
                </ProtectedTeacherRoute>
              } 
            />
            <Route 
              path="/teacher/classes" 
              element={
                <ProtectedTeacherRoute requireOnboarding={true}>
                  <TeacherClasses />
                </ProtectedTeacherRoute>
              } 
            />
            <Route 
              path="/teacher/classes/:classId" 
              element={
                <ProtectedTeacherRoute requireOnboarding={true}>
                  <ClassDetailPage />
                </ProtectedTeacherRoute>
              } 
            />
            <Route 
              path="/teacher/class/:classId" 
              element={
                <ProtectedTeacherRoute requireOnboarding={true}>
                  <ClassDetailPage />
                </ProtectedTeacherRoute>
              } 
            />
            <Route 
              path="/class-lesson/:lessonId" 
              element={
                <ProtectedTeacherRoute requireOnboarding={true}>
                  <ClassLessonPage />
                </ProtectedTeacherRoute>
              } 
            />
            <Route 
              path="/teacher/assignments/:assignmentId" 
              element={
                <ProtectedTeacherRoute>
                  <TeacherAssignmentDetail />
                </ProtectedTeacherRoute>
              } 
            />
            <Route 
              path="/teacher/feedback" 
              element={
                <ProtectedTeacherRoute requireOnboarding={true}>
                  <TeacherFeedbackDashboard />
                </ProtectedTeacherRoute>
              } 
            />
            <Route 
              path="/dashboard/teacher/analytics" 
              element={
                <ProtectedTeacherRoute requireOnboarding={true}>
                  <TeacherAnalyticsDashboard />
                </ProtectedTeacherRoute>
              } 
            />
            
            <Route
              path="/build-class/:classId?" 
              element={
                <ProtectedTeacherRoute requireOnboarding={true}>
                  <BuildClassPage />
                </ProtectedTeacherRoute>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
                  </Routes>
                  <SuperAdminWatermark />
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </ImpersonationProvider>
        </SuperAdminProvider>
      </AccessibilityProvider>
    </AuthProvider>
  </QueryClientProvider>
);
};

export default App;
