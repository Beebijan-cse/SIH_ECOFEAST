import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RoleProtectedRoute } from './components/common/RoleProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { ImpactPage } from './pages/public/ImpactPage';
import { AboutPage } from './pages/public/AboutPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Kitchen Pages
import { KitchenDashboard } from './pages/kitchen/KitchenDashboard';
import { KitchenSurplusPage } from './pages/kitchen/KitchenSurplusPage';
import { CreateSurplusPage } from './pages/kitchen/CreateSurplusPage';
import { SafetyCheckPage } from './pages/kitchen/SafetyCheckPage';
import { SmartMatchingPage } from './pages/kitchen/SmartMatchingPage';
import { TraceabilityPage } from './pages/kitchen/TraceabilityPage';
import { DigitalTwinPage } from './pages/kitchen/DigitalTwinPage';

// FPU Pages
import { FPUDashboard } from './pages/fpu/FPUDashboard';
import { FPUSurplusPage } from './pages/fpu/FPUSurplusPage';
import { FPUProcessingPage } from './pages/fpu/FPUProcessingPage';

// NGO Pages
import { NGODashboard } from './pages/ngo/NGODashboard';
import { AvailableFoodPage } from './pages/ngo/AvailableFoodPage';
import { NGOPickupsPage } from './pages/ngo/NGOPickupsPage';
import { NGOHistoryPage } from './pages/ngo/NGOHistoryPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminListingsPage } from './pages/admin/AdminListingsPage';
import { AdminMatchesPage } from './pages/admin/AdminMatchesPage';
import { AdminPickupsPage } from './pages/admin/AdminPickupsPage';
import { AdminLeaderboardPage } from './pages/admin/AdminLeaderboardPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Kitchen Role Routes */}
          <Route
            path="/kitchen"
            element={
              <RoleProtectedRoute allowedRoles={['kitchen', 'admin']}>
                <DashboardLayout />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/kitchen/dashboard" replace />} />
            <Route path="dashboard" element={<KitchenDashboard />} />
            <Route path="surplus" element={<KitchenSurplusPage />} />
            <Route path="surplus/create" element={<CreateSurplusPage />} />
            <Route path="safety" element={<SafetyCheckPage />} />
            <Route path="matching" element={<SmartMatchingPage />} />
            <Route path="traceability" element={<TraceabilityPage />} />
            <Route path="digital-twin" element={<DigitalTwinPage />} />
          </Route>

          {/* FPU Role Routes */}
          <Route
            path="/fpu"
            element={
              <RoleProtectedRoute allowedRoles={['fpu', 'admin']}>
                <DashboardLayout />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/fpu/dashboard" replace />} />
            <Route path="dashboard" element={<FPUDashboard />} />
            <Route path="surplus" element={<FPUSurplusPage />} />
            <Route path="processing" element={<FPUProcessingPage />} />
          </Route>

          {/* NGO Role Routes */}
          <Route
            path="/ngo"
            element={
              <RoleProtectedRoute allowedRoles={['ngo', 'admin']}>
                <DashboardLayout />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/ngo/dashboard" replace />} />
            <Route path="dashboard" element={<NGODashboard />} />
            <Route path="available" element={<AvailableFoodPage />} />
            <Route path="pickups" element={<NGOPickupsPage />} />
            <Route path="history" element={<NGOHistoryPage />} />
          </Route>

          {/* Admin Role Routes */}
          <Route
            path="/admin"
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="listings" element={<AdminListingsPage />} />
            <Route path="matches" element={<AdminMatchesPage />} />
            <Route path="pickups" element={<AdminPickupsPage />} />
            <Route path="leaderboard" element={<AdminLeaderboardPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
