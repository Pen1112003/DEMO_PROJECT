import React from 'react';

export const ManagerDashboard: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Facility Management Hub</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Establish facilities, pricing strategies, zone assignments, and inspect business reports.</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Parking Manager
          </span>
        </div>
      </header>

      {/* Overview stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        {[
          { name: 'Active Facilities', value: '1' },
          { name: 'Occupancy Rate', value: '78.5%' },
          { name: 'Today\'s Transactions', value: '$1,245.50' },
          { name: 'System Errors / Exceptions', value: '3' }
        ].map((stat) => (
          <div key={stat.name} className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">{stat.name}</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{stat.value}</dd>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core settings */}
        <div className="rounded-2xl border border-gray-200 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Operational Foundation</h2>
          <div className="space-y-2">
            {[
              { id: 'FR-001', name: 'Parking Facility Details' },
              { id: 'FR-002', name: 'Supported Vehicle Types' },
              { id: 'FR-003', name: 'Floor & Zone Allocations' },
              { id: 'FR-004', name: 'Slot Status Monitors' },
              { id: 'FR-005', name: 'Pricing & Dynamic Fees' }
            ].map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                <span className="text-xs text-blue-600 font-semibold">{item.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics reports */}
        <div className="rounded-2xl border border-gray-200 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Analytical Reporting</h2>
          <div className="space-y-2">
            {[
              { id: 'FR-006', name: 'Traffic Volume Logs' },
              { id: 'FR-007', name: 'Revenue Reports' },
              { id: 'FR-008', name: 'Occupancy Rate Metrics' },
              { id: 'FR-009', name: 'Peak-Hour Heatmaps' }
            ].map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                <span className="text-xs text-indigo-600 font-semibold">{item.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exception trackers */}
        <div className="rounded-2xl border border-gray-200 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Exception Auditing</h2>
          <div className="space-y-2">
            {[
              { id: 'FR-010', name: 'Lost Parking Tickets' },
              { id: 'FR-011', name: 'License Plate Mismatches' },
              { id: 'FR-012', name: 'Overtime Parking Audits' },
              { id: 'FR-013', name: 'Wrong-Zone Detections' },
              { id: 'FR-014', name: 'Unpaid Vehicle Roll' }
            ].map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                <span className="text-xs text-orange-600 font-semibold">{item.id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
