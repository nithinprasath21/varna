import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import React, { Suspense, lazy } from 'react';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ArtisanDashboard = lazy(() => import('./pages/dashboard/ArtisanDashboard'));
const NGODashboard = lazy(() => import('./pages/dashboard/NGODashboard'));
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const Cart = lazy(() => import('./pages/Cart'));
const VerifyProduct = lazy(() => import('./pages/VerifyProduct'));
const Profile = lazy(() => import('./pages/Profile'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Orders = lazy(() => import('./pages/Orders'));

import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';

// Root Redirect Component
const RootRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'ARTISAN') return <Navigate to="/dashboard" replace />;
  if (user?.role === 'NGO') return <Navigate to="/dashboard" replace />; // Assuming NGO also strictly dashboard
  return <Home />;
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />; // Or unauthorized page
  }

  return children;
};

// Dashboard Placeholder
const Dashboard = () => {
  const { user, logout } = useAuth();

  if (user?.role === 'ARTISAN') {
    return <ArtisanDashboard />;
  }

  if (user?.role === 'NGO') {
    return <NGODashboard />;
  }

  // Customers shouldn't be here, redirect to shop
  return <Navigate to="/shop" replace />;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <AuthProvider>
        <CartProvider>
          <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading VARNA...</div>}>
            <Routes>
              {/* Public Routes with Layout */}
              <Route element={<Layout />}>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/verify/:hash" element={<VerifyProduct />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Auth Routes */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/register" element={<Navigate to="/auth/register" replace />} />

              {/* Protected Dashboard (No Layout, or Different Layout) */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
