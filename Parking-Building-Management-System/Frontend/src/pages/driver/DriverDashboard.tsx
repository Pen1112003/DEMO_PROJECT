import React from 'react';

export const DriverDashboard: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Driver Portal</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">View vacant spots, book reservations, track your active parking sessions, and submit reports.</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Parking Driver
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Availability (FR-031) */}
        <div className="rounded-2xl border border-gray-200 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Slot Vacancy Status</h2>
          <div className="space-y-3">
            {[
              { type: 'Standard Car', total: 120, occupied: 94 },
              { type: 'Motorbike', total: 400, occupied: 150 },
              { type: 'SUV / Trucks', total: 50, occupied: 45 },
              { type: 'Electric Vehicle (EV)', total: 30, occupied: 12 }
            ].map((v) => {
              const vacant = v.total - v.occupied;
              const percent = Math.round((v.occupied / v.total) * 100);
              return (
                <div key={v.type} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{v.type}</span>
                    <span className="text-xs text-gray-500">{vacant} spots left / {v.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pre-booking (FR-034) */}
        <div className="rounded-2xl border border-gray-200 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pre-Book a Slot</h2>
          <p className="text-sm text-gray-500">Secure a spot before you arrive. Active reservation blocks the slot for 30 minutes.</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Target Vehicle Class</label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                <option>Standard Car (4-7 seats)</option>
                <option>Motorbike</option>
                <option>Large Truck / SUV</option>
                <option>Electric Vehicle (EV)</option>
              </select>
            </div>
            <button className="w-full mt-4 text-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors">
              Request Reservation
            </button>
          </div>
        </div>

        {/* Active Session & Issues (FR-035/037) */}
        <div className="rounded-2xl border border-gray-200 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Active Session</h2>
          <div className="rounded-xl border border-gray-100 p-4 bg-gray-50 dark:border-gray-800 dark:bg-gray-800 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">License Plate</span>
              <span className="font-bold text-gray-900 dark:text-white">29A-99999</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Zone Allocated</span>
              <span className="font-bold text-gray-900 dark:text-white">Floor 2 - Zone B</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Duration</span>
              <span className="font-bold text-gray-900 dark:text-white">2h 15m</span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-2">
              <span className="text-gray-500">Estimated Fee</span>
              <span className="font-extrabold text-purple-600">$4.50</span>
            </div>
          </div>
          <button className="w-full border border-gray-300 dark:border-gray-700 text-center px-4 py-2 text-sm font-semibold rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Submit Issue Report (FR-037)
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
