import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      await new Promise(r => setTimeout(r, 600)); // Realistic network delay
      const res = await api.get('/provider/dashboard');
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const toggleAvailability = async () => {
    try {
      const res = await api.patch('/provider/availability', { available: !available });
      setAvailable(res.data.available);
    } catch (err) {
      alert('Failed to update availability');
    }
  };

  const updateStatus = async (bookingId, status) => {
    try {
      // Optimistic update for UX
      setJobs(jobs.map(j => j.booking_id === bookingId ? { ...j, status } : j));
      await api.patch(`/provider/job/${bookingId}/status`, { status });
      fetchJobs();
    } catch (err) {
      alert('Failed to update status');
      fetchJobs(); // revert on failure
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] py-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Header */}
        <div className="card mb-8 flex justify-between items-center transition-all duration-300">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Provider Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Welcome back, {user?.name} | {user?.role}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Status:</span>
            <button 
              onClick={toggleAvailability}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${available ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'}`}
            >
              {available ? '🟢 Available' : '🔴 Busy'}
            </button>
          </div>
        </div>

        {/* Jobs List */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Assigned Jobs</h2>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse card h-40">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="card text-center animate-fade-in py-10">
            <div className="text-5xl mb-4">😴</div>
            <h3 className="text-lg font-bold dark:text-white">No active jobs</h3>
            <p className="text-gray-500 dark:text-gray-400">Stay available to receive incoming requests.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map(job => (
              <div key={job.booking_id} className="card transition-all duration-300 hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                      job.status === 'ASSIGNED' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                      job.status === 'ACCEPTED' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' :
                      job.status === 'IN_PROGRESS' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                      job.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {job.status === 'IN_PROGRESS' ? 'CHECKED-IN / IN PROGRESS' : job.status}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {job.type} Request @ {job.station}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{job.price}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Earnings</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl mb-4">
                  <div><span className="text-gray-500 dark:text-gray-400 block">Train</span><span className="font-semibold dark:text-white">{job.train_number || 'N/A'}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400 block">Platform</span><span className="font-semibold dark:text-white">{job.platform || 'N/A'}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400 block">Time</span><span className="font-semibold dark:text-white">{job.scheduled_at ? new Date(job.scheduled_at).toLocaleString() : 'ASAP'}</span></div>
                  {job.type === 'PORTER' && <div><span className="text-gray-500 dark:text-gray-400 block">Bags</span><span className="font-semibold dark:text-white">{job.bags_count}</span></div>}
                  
                  {job.check_in_time && (
                    <div><span className="text-gray-500 dark:text-gray-400 block">Check-in</span><span className="font-semibold text-orange-600 dark:text-orange-400">{new Date(job.check_in_time).toLocaleTimeString()}</span></div>
                  )}
                  {job.check_out_time && (
                    <div><span className="text-gray-500 dark:text-gray-400 block">Check-out</span><span className="font-semibold text-green-600 dark:text-green-400">{new Date(job.check_out_time).toLocaleTimeString()}</span></div>
                  )}
                </div>

                <div className="flex space-x-3 border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
                  {job.status === 'ASSIGNED' && (
                    <>
                      <button onClick={() => updateStatus(job.booking_id, 'ACCEPTED')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold flex-1 transition-transform active:scale-95">
                        ✅ Approve / Accept
                      </button>
                      <button onClick={() => updateStatus(job.booking_id, 'REJECTED')} className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-6 py-2 rounded-lg font-semibold transition-transform active:scale-95">
                        ❌ Reject
                      </button>
                    </>
                  )}
                  {job.status === 'ACCEPTED' && (
                    <button onClick={() => updateStatus(job.booking_id, 'IN_PROGRESS')} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold flex-1 transition-transform active:scale-95">
                      📍 Check-In / Start Job
                    </button>
                  )}
                  {job.status === 'IN_PROGRESS' && (
                    <button onClick={() => updateStatus(job.booking_id, 'COMPLETED')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold flex-1 transition-transform active:scale-95">
                      🏁 Check-Out / Complete
                    </button>
                  )}
                  {job.status === 'COMPLETED' && (
                    <div className="text-green-600 dark:text-green-400 font-bold flex items-center justify-center w-full bg-green-50 dark:bg-green-900/30 py-2 rounded-lg">
                      🎉 Job Completed Successfully
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
