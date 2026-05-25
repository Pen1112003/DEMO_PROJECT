import React from 'react';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Admin Control Center</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage user accounts, security roles, system permissions, and configs.</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            System Administrator
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Module Cards */}
        {[
          { id: 'FR-038', title: 'User Accounts', desc: 'Create, modify, and disable system user accounts.', stats: '12 Active Users' },
          { id: 'FR-039', title: 'Roles Management', desc: 'Configure roles such as Admin, Manager, and Staff.', stats: '4 Default Roles' },
          { id: 'FR-040', title: 'Permissions Governance', desc: 'Enforce security boundaries and grant operational tokens.', stats: '24 Permissions' },
          { id: 'FR-041', title: 'System Configuration', desc: 'Fine-tune global properties, connection limits, and policies.', stats: 'Healthy' }
        ].map((mod) => (
          <div key={mod.id} className="relative rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow dark:border-gray-800 dark:bg-gray-900">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">{mod.id}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{mod.stats}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">{mod.title}</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{mod.desc}</p>
            </div>
            <div className="mt-6">
              <button className="w-full text-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                Configure Module
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
