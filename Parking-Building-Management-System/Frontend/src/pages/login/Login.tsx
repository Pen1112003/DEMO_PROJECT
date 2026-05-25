import React, { useState } from 'react';

// Define the role types matching App.tsx
type Role = 'ADMIN' | 'MANAGER' | 'STAFF' | 'DRIVER';

interface LoginProps {
  onLoginSuccess: (role: Role, email: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all credential fields.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Map email pattern to role or default to DRIVER
      const lowerEmail = email.toLowerCase();
      if (lowerEmail.includes('admin')) {
        onLoginSuccess('ADMIN', email);
      } else if (lowerEmail.includes('manager')) {
        onLoginSuccess('MANAGER', email);
      } else if (lowerEmail.includes('staff')) {
        onLoginSuccess('STAFF', email);
      } else {
        onLoginSuccess('DRIVER', email);
      }
    }, 800);
  };

  const handleQuickLogin = (role: Role, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('••••••••');
    setLoading(true);
    setError('');

    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(role, demoEmail);
    }, 500);
  };

  const demoAccounts = [
    { role: 'MANAGER' as Role, email: 'manager@pbms.com', label: 'Parking Manager', color: 'border-blue-200 hover:border-blue-500 bg-blue-50/40 text-blue-800' },
    { role: 'STAFF' as Role, email: 'staff@pbms.com', label: 'Parking Staff', color: 'border-emerald-200 hover:border-emerald-500 bg-emerald-50/40 text-emerald-800' },
    { role: 'DRIVER' as Role, email: 'driver@pbms.com', label: 'Driver / User', color: 'border-purple-200 hover:border-purple-500 bg-purple-50/40 text-purple-800' },
    { role: 'ADMIN' as Role, email: 'admin@pbms.com', label: 'System Admin', color: 'border-rose-200 hover:border-rose-500 bg-rose-50/40 text-rose-800' },
  ];

  return (
    <div className="min-h-screen bg-[#f9f9ff] flex flex-col justify-center items-center px-4 py-12">
      {/* Login Card */}
      <div className="w-full max-w-[480px] bg-white rounded-2xl ambient-shadow border border-[#e7eeff] p-8 md:p-10 flex flex-col transition-all duration-300">
        
        {/* Shield Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-3 shadow-md shadow-primary/20 hover:scale-105 transition-transform duration-300">
            <span className="material-symbols-outlined text-white text-3xl select-none">shield</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">Secure Portal</h1>
          <p className="text-sm text-secondary mt-1.5 text-center font-medium">
            Enter your credentials to access PBMS Portal
          </p>
        </div>

        {/* Social Logins */}
        <div className="flex flex-col gap-3 mb-6">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 border border-outline-variant rounded-xl hover:bg-background-soft transition-all duration-200 cursor-pointer active:scale-[0.99]"
          >
            {/* Embedded Inline SVG for Google G Logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            <span className="font-semibold text-sm text-on-surface">Continue with Google</span>
          </button>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 border border-outline-variant rounded-xl hover:bg-background-soft transition-all duration-200 cursor-pointer active:scale-[0.99]"
          >
            {/* Embedded Inline SVG for Facebook Logo */}
            <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="font-semibold text-sm text-on-surface">Continue with Facebook</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-[#e7eeff]"></div>
          <span className="px-3 text-xs font-bold text-secondary tracking-widest uppercase">OR</span>
          <div className="flex-grow border-t border-[#e7eeff]"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleManualLogin} className="flex flex-col gap-4">
          {error && (
            <div className="bg-rose-50 text-rose-700 text-xs font-semibold p-3.5 rounded-xl border border-rose-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white text-sm font-medium focus:border-primary-container focus:ring-4 focus:ring-primary-container/15 transition-all duration-200 placeholder:text-on-surface-variant/50"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Password
              </label>
              <a href="#forgot" className="text-xs font-bold text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white text-sm font-medium focus:border-primary-container focus:ring-4 focus:ring-primary-container/15 transition-all duration-200 placeholder:text-on-surface-variant/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 mt-2 bg-primary hover:bg-[#0036ad] text-white font-bold text-sm rounded-xl transition-all duration-200 cursor-pointer shadow-md shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2 ${
              loading ? 'opacity-80 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Accounts Quick-Select Section */}
        <div className="mt-8 border-t border-[#e7eeff] pt-6">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="material-symbols-outlined text-primary text-lg">supervised_user_circle</span>
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Demo Accounts Quick-Login
            </h3>
          </div>
          <p className="text-xs text-secondary mb-4 leading-normal">
            Click one of the roles below to automatically log in and verify that dashboard layout:
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                type="button"
                onClick={() => handleQuickLogin(account.role, account.email)}
                className={`px-3 py-2.5 border rounded-xl text-[11px] font-extrabold text-left transition-all duration-200 cursor-pointer active:scale-[0.97] flex flex-col justify-between ${account.color}`}
              >
                <span>{account.label}</span>
                <span className="opacity-60 text-[9px] font-medium mt-0.5">{account.email}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
