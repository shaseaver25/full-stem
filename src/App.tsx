
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ImpersonationProvider } from "@/contexts/ImpersonationContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import TrialPage from "./components/TrialPage";
import ExcelCourse from "./pages/ExcelCourse";
import WordCourse from "./pages/WordCourse";
import PowerPointCourse from "./pages/PowerPointCourse";
import OutlookCourse from "./pages/OutlookCourse";
import LessonPage from "./pages/LessonPage";
import UserPreferences from "./pages/UserPreferences";
import NotFound from "./pages/NotFound";
import TeacherAuth from "./pages/TeacherAuth";
import TeacherOnboarding from "./pages/TeacherOnboarding";
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import ProtectedTeacherRoute from "./components/teacher/ProtectedTeacherRoute";
import GradebookPage from "./pages/GradebookPage";
import AssignmentSubmissionsPage from "./pages/AssignmentSubmissionsPage";
import AssignmentGradebookPage from "./pages/AssignmentGradebookPage";
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
import ClassManagementPage from "./pages/ClassManagementPage";
import GlobalReadAloud from "./components/GlobalReadAloud";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ImpersonationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <GlobalReadAloud />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/trial" element={<TrialPage />} />
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
            
            {/* Parent Portal */}
            <Route path="/parent" element={<ParentPortalPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/build-class" element={<BuildClassPage />} />
            <Route path="/admin/course-editor" element={<CourseEditorPage />} />
            <Route path="/admin/advanced" element={<AdvancedAdminPage />} />
            
            {/* Developer Routes */}
            <Route 
              path="/dev" 
              element={
                <DeveloperRoute>
                  <DeveloperDashboard />
                </DeveloperRoute>
              } 
            />
            
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
                  <GradebookPage />
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
              path="/teacher/assignment-gradebook" 
              element={
                <ProtectedTeacherRoute requireOnboarding={true}>
                  <AssignmentGradebookPage />
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
              path="/teacher/class/:classId" 
              element={
                <ProtectedTeacherRoute requireOnboarding={true}>
                  <ClassManagementPage />
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
        </BrowserRouter>
        </TooltipProvider>
      </ImpersonationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
