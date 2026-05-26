import React, { useState } from 'react';

export const DriverDashboard: React.FC = () => {
  // Active session states to make the dashboard fully interactive and alive
  const [parkingFee, setParkingFee] = useState(25000);
  const [duration, setDuration] = useState('2h 15m');
  const [endTime, setEndTime] = useState('13:23');
  const [isExtended, setIsExtended] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'info' | ''>('');

  // Reservation states
  const [selectedClass, setSelectedClass] = useState('Standard Car (4-7 seats)');
  const [isReserved, setIsReserved] = useState(false);

  // Vacancy stats
  const [vacancies, setVacancies] = useState([
    { type: 'Standard Car', total: 120, occupied: 94 },
    { type: 'Motorbike', total: 400, occupied: 150 },
    { type: 'SUV / Trucks', total: 50, occupied: 45 },
    { type: 'Electric Vehicle (EV)', total: 30, occupied: 12 }
  ]);

  const handleExtendSession = () => {
    if (isExtended) {
      triggerFeedback('Your session has already been extended for today.', 'info');
      return;
    }
    setParkingFee(prev => prev + 15000);
    setDuration('2h 45m');
    setEndTime('13:53');
    setIsExtended(true);
    triggerFeedback('Session successfully extended by 30 minutes! (+15,000đ)', 'success');
  };

  const handleReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsReserved(true);
    triggerFeedback(`Active reservation placed for ${selectedClass}! Spot blocked for 30 minutes.`, 'success');
    
    // Dynamically deduct 1 spot from the vacancies list for visual feedback
    setVacancies(prev => prev.map(v => {
      if (selectedClass.includes(v.type)) {
        return { ...v, occupied: Math.min(v.total, v.occupied + 1) };
      }
      return v;
    }));
  };

  const triggerFeedback = (msg: string, type: 'success' | 'info') => {
    setFeedbackMessage(msg);
    setFeedbackType(type);
    setTimeout(() => {
      setFeedbackMessage('');
      setFeedbackType('');
    }, 4500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header Panel */}
      <header className="flex flex-col space-y-3 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Driver Session Hub</h1>
          <p className="text-sm text-secondary mt-1">
            Book reservations, monitor your real-time parking status, and view historical sessions.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
            Parking Driver
          </span>
        </div>
      </header>

      {/* Floating feedback alert */}
      {feedbackMessage && (
        <div className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2.5 transition-all duration-300 animate-slide-in ${
          feedbackType === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          <span className="material-symbols-outlined text-lg">
            {feedbackType === 'success' ? 'check_circle' : 'info'}
          </span>
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Hero Card, Quick Actions, History) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Session Hero Card */}
          <section className="bg-white rounded-2xl p-6 md:p-8 border border-primary/10 relative overflow-hidden active-glow-pulse">
            
            {/* Header row */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-primary-container rounded-xl text-white shadow-md shadow-primary/20">
                  <span className="material-symbols-outlined text-2xl select-none" style={{ fontVariationSettings: '"FILL" 1' }}>
                    directions_car
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-on-surface">Active Session</h2>
                  <p className="text-xs font-bold text-primary tracking-wide uppercase mt-0.5">
                    SWP Premium Coverage
                  </p>
                </div>
              </div>
              
              {/* Location pill */}
              <div className="flex items-center bg-background-soft px-4 py-2 rounded-full border border-outline-variant">
                <span className="material-symbols-outlined text-primary mr-2 text-[18px]">location_on</span>
                <span className="text-xs font-bold text-on-surface">Bãi đỗ Lê Lai - Floor 2 - Zone B</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-background-soft border border-[#e7eeff]">
                <span className="material-symbols-outlined text-secondary text-2xl">schedule</span>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Estimated End Time</p>
                  <p className="text-xl font-extrabold text-on-surface mt-0.5">
                    {endTime} <span className="text-xs font-medium text-secondary ml-1">on 25/05/2026</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-background-soft border border-[#e7eeff]">
                <span className="material-symbols-outlined text-secondary text-2xl">payments</span>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Current Parking Fee</p>
                  <p className="text-xl font-extrabold text-on-surface mt-0.5">
                    {parkingFee.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            </div>

            {/* Session Info Details */}
            <div className="mt-6 pt-5 border-t border-[#e7eeff] flex flex-wrap gap-x-12 gap-y-4">
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">License Plate</p>
                <p className="text-sm font-extrabold text-on-surface mt-0.5">29A-99999</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Session Duration</p>
                <p className="text-sm font-extrabold text-on-surface mt-0.5">{duration}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Full Address</p>
                <p className="text-sm font-extrabold text-on-surface mt-0.5">Bãi đỗ Lê Lai - Quận 1, TP. Hồ Chí Minh</p>
              </div>
            </div>

            {/* Session Action buttons */}
            <div className="mt-6 flex flex-col md:flex-row gap-3">
              <button
                type="button"
                onClick={() => triggerFeedback('Report submitted! A parking assistant has been dispatched to Floor 2.', 'success')}
                className="flex-1 py-3 px-4 border border-rose-200 hover:border-rose-400 bg-rose-50/50 hover:bg-rose-50 text-rose-700 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer active:scale-95 text-center flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">report_problem</span>
                <span>Submit Issue Report (FR-037)</span>
              </button>
            </div>

            {/* Decorative background shape */}
            <div className="absolute -right-20 -bottom-20 size-60 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          </section>

          {/* Quick Actions Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={handleExtendSession}
              className="p-5 bg-white border border-outline-variant hover:border-primary/40 rounded-2xl flex flex-col items-center text-center gap-2.5 hover:shadow-md transition-all group cursor-pointer active:scale-95 duration-200"
            >
              <div className="size-11 rounded-full bg-background-soft group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-lg">add_circle</span>
              </div>
              <span className="text-xs font-bold text-on-surface">Extend Session</span>
            </button>
            <button
              type="button"
              onClick={() => triggerFeedback('Car locator active! Your vehicle is located in Floor 2, Row B, Slot 42.', 'success')}
              className="p-5 bg-white border border-outline-variant hover:border-primary/40 rounded-2xl flex flex-col items-center text-center gap-2.5 hover:shadow-md transition-all group cursor-pointer active:scale-95 duration-200"
            >
              <div className="size-11 rounded-full bg-background-soft group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-lg">explore</span>
              </div>
              <span className="text-xs font-bold text-on-surface">Find My Car</span>
            </button>
            <button
              type="button"
              onClick={() => triggerFeedback('Receipt downloaded! E-invoice has been dispatched to driver@pbms.com.', 'success')}
              className="p-5 bg-white border border-outline-variant hover:border-primary/40 rounded-2xl flex flex-col items-center text-center gap-2.5 hover:shadow-md transition-all group cursor-pointer active:scale-95 duration-200"
            >
              <div className="size-11 rounded-full bg-background-soft group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-lg">receipt_long</span>
              </div>
              <span className="text-xs font-bold text-on-surface">View Receipt</span>
            </button>
          </section>

          {/* Recent Activity Table */}
          <section className="bg-white rounded-2xl border border-outline-variant overflow-hidden ambient-shadow">
            <div className="px-6 py-5 border-b border-[#e7eeff] flex justify-between items-center">
              <h2 className="text-lg font-bold text-on-surface">Recent Activity</h2>
              <button
                type="button"
                onClick={() => triggerFeedback('Activity filter active! All 24 historical sessions retrieved.', 'info')}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-background-soft">
                    <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Date & Duration</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Fee Paid</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7eeff] text-sm">
                  {[
                    { location: 'Bãi đỗ Hàm Nghi - Quận 1', date: 'May 22, 2026', time: '2h 15m', fee: '45,000đ' },
                    { location: 'Vincom Center Đồng Khởi', date: 'May 18, 2026', time: '4h 30m', fee: '80,000đ' }
                  ].map((act) => (
                    <tr key={act.location} className="hover:bg-background-soft/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary text-[18px]">history_edu</span>
                          <span className="font-bold text-on-surface">{act.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-secondary">
                        <div className="flex flex-col">
                          <span className="font-semibold text-on-surface">{act.date}</span>
                          <span className="text-[11px] mt-0.5">{act.time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-on-surface">{act.fee}</td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-200">
                          COMPLETED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {/* Right Column (Vacancy Status, Booking Form, Banner) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Slot Vacancy Status */}
          <div className="bg-white rounded-2xl border border-outline-variant p-6 ambient-shadow space-y-4">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-xl">grid_view</span>
              <h2 className="text-base font-bold text-on-surface">Slot Vacancy Status</h2>
            </div>
            <div className="space-y-4">
              {vacancies.map((v) => {
                const vacant = v.total - v.occupied;
                const percent = Math.round((v.occupied / v.total) * 100);
                return (
                  <div key={v.type} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-on-surface">{v.type}</span>
                      <span className="font-medium text-secondary">{vacant} spots left / {v.total}</span>
                    </div>
                    <div className="w-full bg-[#e7eeff] rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pre-book a Slot */}
          <div className="bg-white rounded-2xl border border-outline-variant p-6 ambient-shadow space-y-4">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-xl">event_available</span>
              <h2 className="text-base font-bold text-on-surface">Pre-Book a Slot</h2>
            </div>
            <p className="text-xs text-secondary leading-normal">
              Secure a spot before you arrive. Active reservation blocks the slot for 30 minutes.
            </p>
            
            {isReserved ? (
              <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-4 rounded-xl border border-emerald-100 flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  <span>Spot Successfully Reserved!</span>
                </div>
                <p className="text-[11px] text-emerald-700/80 leading-normal font-normal">
                  Your reservation for <strong className="font-bold">{selectedClass}</strong> is active. You have 30 minutes to enter Zone B.
                </p>
                <button
                  type="button"
                  onClick={() => setIsReserved(false)}
                  className="mt-1 text-center py-2 px-3 border border-emerald-200 hover:border-emerald-300 bg-white text-emerald-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel Reservation
                </button>
              </div>
            ) : (
              <form onSubmit={handleReservation} className="space-y-4">
                <div>
                  <label htmlFor="vehicle-class-select" className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-0.5">
                    Target Vehicle Class
                  </label>
                  <select 
                    id="vehicle-class-select"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full rounded-xl border border-outline-variant px-3 py-2.5 text-xs font-semibold bg-white text-on-surface focus:border-primary-container focus:ring-4 focus:ring-primary-container/15 transition-all"
                  >
                    <option>Standard Car (4-7 seats)</option>
                    <option>Motorbike</option>
                    <option>Large Truck / SUV</option>
                    <option>Electric Vehicle (EV)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 text-center py-3 bg-primary hover:bg-[#0036ad] text-white font-bold text-xs rounded-xl transition-all duration-200 cursor-pointer shadow-md shadow-primary/10 active:scale-[0.98]"
                >
                  Request Reservation (FR-034)
                </button>
              </form>
            )}
          </div>

          {/* Promotion Banner */}
          <div className="bg-inverse-surface rounded-2xl overflow-hidden flex flex-col relative group ambient-shadow border border-outline-variant/10">
            <div className="relative h-44 overflow-hidden">
              <img 
                alt="Parking Garage" 
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 pointer-events-none" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlolgUutKZk-Xh6h9NmqkoE_MjiNu30SXVnB6uzpm1jXBqSt7Gz93VKJmbLxKO3tRePYrNMeoFu2GTvOlFiwT7isX1kETDrN4fg8xtpGDZgdpxQ7KcCcxbcwHW2CppOtAjgVwmZ30S9CvSiNEwi-4GAizlAABaVV1ffiKz1efpRkTBQOfFDT0QicSnSgj5epkfDKPhIAAU3V7kMRmZ5zC4HYlgGUfaEwNWNqmpwLLaEoaz63tXDN0V0CPI2fX4AKGf4jpw6jvUnus"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/40 to-transparent"></div>
            </div>
            <div className="p-5 flex flex-col bg-inverse-surface relative z-10">
              <span className="bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded w-fit mb-2">
                LIMITED OFFER
              </span>
              <h3 className="text-base font-extrabold text-inverse-on-surface mb-1">SWP Gold</h3>
              <p className="text-xs text-inverse-on-surface/70 mb-4 leading-normal font-medium">
                Upgrade to Gold and enjoy 20% off monthly parking sessions across all premium locations.
              </p>
              <button 
                type="button"
                onClick={() => triggerFeedback('Thank you for your interest! Membership application dispatched.', 'success')}
                className="w-full bg-primary hover:bg-[#0036ad] text-white py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-md shadow-primary/20"
              >
                Claim Membership
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DriverDashboard;
