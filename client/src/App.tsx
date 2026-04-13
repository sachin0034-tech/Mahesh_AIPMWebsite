import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import { AiCommunity } from "@/pages/AiCommunity";
import { Bootcamp } from "@/pages/Bootcamp";
import { Agents } from "@/pages/Agents";
import { AdminLoginPage } from "@/pages/AdminLoginPage";
import { AdminDashboard } from "@/pages/AdminDashboard";
import EditAgent from "@/pages/EditAgent";
import { CohortProjects } from "@/pages/CohortProjects";
import { CohortAdminLogin } from "@/pages/CohortAdminLogin";
import { CohortAdminDashboard } from "@/pages/CohortAdminDashboard";
import { CohortAdminProvider } from "@/contexts/CohortAdminContext";
import { ProjectUserProvider } from "@/contexts/ProjectUserContext";
import { ProjectUserLogin } from "@/pages/ProjectUserLogin";
import { ProjectUserDashboard } from "@/pages/ProjectUserDashboard";
import { ProjectEditor } from "@/pages/ProjectEditor";
import { AllProjectsPage } from "@/pages/AllProjectsPage";
import { ProjectDetailPage } from "@/pages/ProjectDetailPage";
import Testimonials from "@/pages/Testimonials";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<CohortProjects />} />
        <Route path="/bootcamp" element={<Bootcamp />} />
        <Route path="/cohort-projects" element={<CohortProjects />} />
        <Route path="/all-projects/:section" element={<AllProjectsPage />} />
        <Route path="/project/:projectId" element={<ProjectDetailPage />} />
        {/* Cohort admin */}
        <Route path="/cohort-admin" element={<CohortAdminLogin />} />
        <Route path="/cohort-admin/dashboard" element={<CohortAdminDashboard />} />
        {/* Project user editing */}
        <Route path="/project-login" element={<ProjectUserLogin />} />
        <Route path="/my-projects" element={<ProjectUserDashboard />} />
        <Route path="/project-editor/:projectId" element={<ProjectEditor />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/edit-agent/:projectId" element={<EditAgent />} />
        {/* Fallback to 404 */}
        <Route element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CohortAdminProvider>
          <ProjectUserProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </ProjectUserProvider>
        </CohortAdminProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
