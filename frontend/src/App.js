import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import CompanyRegister from './pages/CompanyRegister';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminApplicationsPage from './pages/AdminApplicationsPage';
import AdminProjectsPage from './pages/AdminProjectsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ProjectsPage from './pages/ProjectsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ResumePage from './pages/ResumePage';
import TestPage from './pages/TestPage';
import CertificatesPage from './pages/CertificatesPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App min-h-screen">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  color: '#333',
                  padding: '16px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />

            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/company/register" element={<CompanyRegister />} />

              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute role="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/projects"
                element={
                  <ProtectedRoute role="student">
                    <ProjectsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/applications"
                element={
                  <ProtectedRoute role="student">
                    <ApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/resume"
                element={
                  <ProtectedRoute role="student">
                    <ResumePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/tests"
                element={
                  <ProtectedRoute role="student">
                    <TestPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/certificates"
                element={
                  <ProtectedRoute role="student">
                    <CertificatesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <ProtectedRoute role="student">
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/notifications"
                element={
                  <ProtectedRoute role="student">
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/settings"
                element={
                  <ProtectedRoute role="student">
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/applications"
                element={
                  <ProtectedRoute role="admin">
                    <AdminApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/projects"
                element={
                  <ProtectedRoute role="admin">
                    <AdminProjectsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute role="admin">
                    <AdminSettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* SuperAdmin Routes */}
              <Route
                path="/superadmin/dashboard"
                element={
                  <ProtectedRoute role="superadmin">
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
