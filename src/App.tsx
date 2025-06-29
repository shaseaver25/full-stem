
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import TrialPage from "./components/TrialPage";
import ExcelCourse from "./pages/ExcelCourse";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/trial" element={<TrialPage />} />
            <Route path="/course/excel" element={<ExcelCourse />} />
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
            <Route path="/preferences" element={<UserPreferences />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/build-class" element={<BuildClassPage />} />
            
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
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
