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

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Add pages below */}
        <Route path="/" element={<Bootcamp />} />
        {/* <Route path="/bootcamp" element={<Bootcamp />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/edit-agent/:projectId" element={<EditAgent />} /> */}
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
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
