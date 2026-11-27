import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import DonationsCatalogPage from './pages/DonationsCatalogPage';
import FoodDetailsPage from './pages/FoodDetailsPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DonorDashboard from './pages/donor/DonorDashboard';
import ReceiverDashboard from './pages/receiver/ReceiverDashboard';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const location = useLocation();

  // Hide global Navbar & Footer inside dashboard routes because dashboard has its own dedicated sidebar layout
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {!isDashboardRoute && <Navbar />}
      
      <main className="flex-1">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/donations" element={<DonationsCatalogPage />} />
          <Route path="/donations/:id" element={<FoodDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Role-Based Dashboards */}
          <Route
            path="/dashboard/donor"
            element={
              <ProtectedRoute allowedRoles={['donor', 'admin']}>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/receiver"
            element={
              <ProtectedRoute allowedRoles={['receiver', 'admin']}>
                <ReceiverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/volunteer"
            element={
              <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {!isDashboardRoute && <Footer />}
    </div>
  );
}

export default App;
