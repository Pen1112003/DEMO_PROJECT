import React, { useState } from 'react';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';
import DriverDashboard from './pages/driver/DriverDashboard';

type Role = 'ADMIN' | 'MANAGER' | 'STAFF' | 'DRIVER';

const App: React.FC = () => {
  const [activeRole, setActiveRole] = useState<Role>('MANAGER');

  const renderDashboard = () => {
    switch (activeRole) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'MANAGER':
        return <ManagerDashboard />;
      case 'STAFF':
        return <StaffDashboard />;
      case 'DRIVER':
        return <DriverDashboard />;
      default:
        return <ManagerDashboard />;
    }
  };

  const roles: { value: Role; label: string; color: string }[] = [
    { value: 'MANAGER', label: 'Parking Manager', color: 'bg-blue-600' },
    { value: 'STAFF', label: 'Parking Staff', color: 'bg-green-600' },
    { value: 'DRIVER', label: 'Driver / User', color: 'bg-purple-600' },
    { value: 'ADMIN', label: 'System Admin', color: 'bg-red-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                PBMS Portal
              </span>
              <span className="ml-2 text-xs font-bold text-gray-400 border border-gray-200 rounded px-1.5 dark:border-gray-800">
                SU26SWP08
              </span>
            </div>

            {/* Quick switcher */}
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:inline">
                Active View Role:
              </span>
              <div className="flex bg-gray-100 p-1 rounded-xl dark:bg-gray-800">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setActiveRole(r.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-200 ${
                      activeRole === r.value
                        ? 'bg-white shadow text-gray-900 dark:bg-gray-700 dark:text-white'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="flex-1 py-6">
        {renderDashboard()}
      </main>

      {/* Modern footer */}
      <footer className="bg-white border-t border-gray-200 py-6 dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500 dark:text-gray-400">
          Parking Building Management System © 2026. Designed with React, TypeScript, Java, and Hibernate.
        </div>
      </footer>
    </div>
  );
};

export default App;
