import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Public Pages
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminServices from './pages/admin/AdminServices';
import AdminBookings from './pages/admin/AdminBookings';
import AdminSettings from './pages/admin/AdminSettings';
import AdminContacts from './pages/admin/AdminContacts';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/book/:serviceId" element={<BookingPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmation/:bookingId" element={<ConfirmationPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/services" element={
              <ProtectedRoute>
                <AdminServices />
              </ProtectedRoute>
            } />
            <Route path="/admin/bookings" element={
              <ProtectedRoute>
                <AdminBookings />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <AdminSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/contacts" element={
              <ProtectedRoute>
                <AdminContacts />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;