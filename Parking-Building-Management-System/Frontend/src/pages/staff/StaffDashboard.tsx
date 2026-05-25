import React from 'react';

export const StaffDashboard: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Gate Operations Console</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Validate vehicle eligibility, manage entries and exits, and handle driver exceptions.</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Parking Staff
          </span>
        </div>
      </header>

      {/* Main booth controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Entry Booth */}
        <div className="rounded-2xl border border-gray-200 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gate Check-In (Entry)</h2>
            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">FR-015..018</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">License Plate Input</label>
              <input type="text" placeholder="e.g. 29A-12345" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Vehicle Classification</label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                <option>Standard Car (4-7 seats)</option>
                <option>Motorbike</option>
                <option>Large Truck / SUV</option>
                <option>Electric Vehicle (EV)</option>
              </select>
            </div>
            <button className="w-full mt-4 text-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              Process & Issue Ticket (FR-032)
            </button>
          </div>
        </div>

        {/* Exit Booth */}
        <div className="rounded-2xl border border-gray-200 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gate Check-Out (Exit)</h2>
            <span className="text-xs font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">FR-019..022</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Search active ticket / scan code</label>
              <input type="text" placeholder="Enter ticket ID or license plate" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
            </div>
            <div className="rounded-lg border border-dashed border-gray-200 p-4 dark:border-gray-800 flex items-center justify-center text-sm text-gray-400">
              Awaiting scan or search parameters...
            </div>
            <button className="w-full mt-4 text-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
              Calculate & Pay (FR-033)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
