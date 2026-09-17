import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ScrollToTop from './components/ScrollToTop';
import useImagePreloader from './hooks/useImagePreloader';
// We will create these pages next
import Landing from './pages/Landing';
import Gallery from './pages/Gallery';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentLayout from './layouts/StudentLayout';
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentTickets from './pages/student/Tickets';
import TicketCreate from './pages/student/TicketCreate';
import TicketDetail from './pages/student/TicketDetail';
import Appointments from './pages/student/Appointments';
import QuickCall from './pages/student/QuickCall';
import StudentUpdates from './pages/student/StudentUpdates';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminStudentDetail from './pages/admin/StudentDetail';
import AdminTickets from './pages/admin/Tickets';
import AdminTicketDetail from './pages/admin/TicketDetail';
import AdminQuickCalls from './pages/admin/QuickCalls';
import AdminNotices from './pages/admin/Notices';

import AdminDocuments from './pages/admin/Documents';
import AdminSettings from './pages/admin/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'STUDENT' | 'ADMIN' }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    // Redirect to their respective dashboard if wrong role
    return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/student/dashboard'} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  useImagePreloader();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Student Routes */}
            <Route path="/student/*" element={
              <ProtectedRoute role="STUDENT">
                <StudentLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="tickets" element={<StudentTickets />} />
              <Route path="tickets/new" element={<TicketCreate />} />
              <Route path="tickets/:id" element={<TicketDetail />} />
              <Route path="closed-requests" element={<StudentTickets closed={true} />} />
              <Route path="quick-call" element={<QuickCall />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="updates" element={<StudentUpdates />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute role="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="students/:id" element={<AdminStudentDetail />} />
              <Route path="tickets" element={<AdminTickets />} />
              <Route path="tickets/:id" element={<AdminTicketDetail />} />
              <Route path="closed-requests" element={<AdminTickets />} />
              <Route path="quick-calls" element={<AdminQuickCalls />} />
              <Route path="notices" element={<AdminNotices />} />

              <Route path="documents" element={<AdminDocuments />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
            
            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
