import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Bookings', href: '/admin/bookings', icon: '📅' },
    { name: 'Services', href: '/admin/services', icon: '🛠️' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
    { name: 'Contacts', href: '/admin/contacts', icon: '📧' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/admin" className="text-xl font-bold text-primary-600">
                ServicePro Admin
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-secondary-700">Welcome, {user?.email}</span>
              <button
                onClick={logout}
                className="text-secondary-500 hover:text-secondary-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;