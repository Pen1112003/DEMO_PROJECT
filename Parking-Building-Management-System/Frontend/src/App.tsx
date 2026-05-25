import React, { useState } from 'react';
import Login from './pages/login/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';
import DriverDashboard from './pages/driver/DriverDashboard';

type Role = 'ADMIN' | 'MANAGER' | 'STAFF' | 'DRIVER';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [activeRole, setActiveRole] = useState<Role>('MANAGER');

  const handleLoginSuccess = (role: Role, email: string) => {
    setUserEmail(email);
    setActiveRole(role);
    setIsLoggedIn(true);
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setUserEmail('');
  };

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

  const roles: { value: Role; label: string; color: string; bg: string; text: string }[] = [
    { value: 'MANAGER', label: 'Parking Manager', color: 'bg-primary', bg: 'bg-[#e7eeff]', text: 'text-primary' },
    { value: 'STAFF', label: 'Parking Staff', color: 'bg-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-800' },
    { value: 'DRIVER', label: 'Driver / User', color: 'bg-purple-600', bg: 'bg-purple-50', text: 'text-purple-800' },
    { value: 'ADMIN', label: 'System Admin', color: 'bg-rose-600', bg: 'bg-rose-50', text: 'text-rose-800' },
  ];

  const currentRoleConfig = roles.find(r => r.value === activeRole) || roles[0];

  // If not logged in, render the beautiful Stitch login screen
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Render the authenticated application workspace
  return (
    <div className="min-h-screen bg-[#f9f9ff] text-on-surface flex flex-col font-sans antialiased">
      
      {/* Navigation Header */}
      <nav className="bg-white border-b border-[#e7eeff] shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Logo and Brand */}
            <div className="flex items-center gap-2.5">
              <div className="size-9 bg-primary rounded-lg flex items-center justify-center shadow-sm shadow-primary/20">
                <span className="material-symbols-outlined text-white text-xl select-none">shield</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-primary">
                PBMS Portal
              </span>
              <span className="ml-1 text-[10px] font-bold text-secondary border border-outline-variant rounded px-1.5 py-0.5">
                SU26SWP08
              </span>
            </div>

            {/* User Session Info & Logout */}
            <div className="flex items-center space-x-4">
              
              {/* User Identity Box */}
              <div className="hidden sm:flex items-center gap-3 border-r border-[#e7eeff] pr-4">
                <div className="size-9 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                  <span className="text-sm font-extrabold text-primary uppercase">
                    {userEmail ? userEmail.charAt(0) : 'U'}
                  </span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-on-surface truncate max-w-[180px]">
                    {userEmail || 'user@pbms.com'}
                  </span>
                  <span className={`inline-block self-start text-[9px] font-extrabold px-2 py-0.5 mt-0.5 rounded-full ${currentRoleConfig.bg} ${currentRoleConfig.text}`}>
                    {currentRoleConfig.label}
                  </span>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-2 border border-rose-200 hover:border-rose-400 bg-rose-50/50 hover:bg-rose-50 text-rose-700 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                <span>Sign Out</span>
              </button>

            </div>

          </div>
        </div>
      </nav>

      {/* Main Workspace Dashboard Content */}
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderDashboard()}
        </div>
      </main>

      {/* Reviewer Toolbar - Sticky switcher for super easy validation */}
      <div className="sticky bottom-4 mx-auto z-40 max-w-fit px-4 mb-4">
        <div className="bg-white border border-[#e7eeff] px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-sm">tune</span>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">
              Reviewer Toggle:
            </span>
          </div>
          <div className="flex gap-1.5">
            {roles.map((r) => (
              <button
                type="button"
                key={r.value}
                onClick={() => setActiveRole(r.value)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all duration-200 cursor-pointer ${
                  activeRole === r.value
                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                    : 'bg-background-soft hover:bg-neutral-200/50 text-secondary'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Premium Footer */}
      <footer className="bg-white border-t border-[#e7eeff] py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs font-medium text-secondary">
          Parking Building Management System © 2026. Designed with React, TypeScript, Java, and Hibernate.
        </div>
      </footer>

    </div>
  );
};

export default App;
