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
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
