import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ bookings: [], users: [], providers: [], audit_logs: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({ name: '', email: '', password: '', provider_type: 'PORTER', station: 'New Delhi' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      await new Promise(r => setTimeout(r, 600)); // Simulate delay
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch (err) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/admin/employees', employeeForm);
      setShowEmployeeModal(false);
      setEmployeeForm({ name: '', email: '', password: '', provider_type: 'PORTER', station: 'New Delhi' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await api.delete(`/admin/employees/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete employee');
    }
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-gray-100">
      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
    </tr>
  );

  const StatCard = ({ title, value, color }) => (
    <div className="card transition-all hover:shadow-md">
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{title}</p>
      {loading ? (
        <div className="animate-pulse h-8 bg-gray-200 rounded w-1/2"></div>
      ) : (
        <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="mb-8 flex justify-between items-center transition-all duration-300">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Master Portal</h1>
            <p className="text-gray-500">System Overview & Administration</p>
          </div>
          <button onClick={fetchData} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm">
            Refresh Data
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6">⚠️ {error}</div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200 pb-2 overflow-x-auto">
          {['overview', 'bookings', 'users', 'employees', 'audit_logs'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'bg-[#1a3a6b] text-white' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={data.stats.total_users || 0} color="blue" />
                <StatCard title="Total Employees" value={data.stats.total_employees || 0} color="indigo" />
                <StatCard title="Pending Requests" value={data.stats.pending_bookings || 0} color="yellow" />
                <StatCard title="Active Bookings" value={data.stats.active_bookings || 0} color="orange" />
                <StatCard title="Completed Bookings" value={data.stats.completed_bookings || 0} color="green" />
                <StatCard title="Total Bookings" value={data.stats.total_bookings || 0} color="purple" />
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">ID / Time</th>
                      <th className="px-4 py-3">Station</th>
                      <th className="px-4 py-3">User ID</th>
                      <th className="px-4 py-3">Assigned Employees</th>
                      <th className="px-4 py-3">Check-In</th>
                      <th className="px-4 py-3">Check-Out</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />) : data.bookings.length === 0 ? (
                      <tr><td colSpan="7" className="text-center py-8 text-gray-500">No booking requests yet.</td></tr>
                    ) : data.bookings.map(b => (
                      <tr key={b.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-900">#{b.id}</div>
                          <div className="text-xs text-gray-500">{new Date(b.created_at).toLocaleString()}</div>
                        </td>
                        <td className="px-4 py-3">{b.station}</td>
                        <td className="px-4 py-3">U-{b.user_id}</td>
                        <td className="px-4 py-3">
                          {b.services.map((s, idx) => (
                            <div key={idx} className="text-xs mb-1">
                              {s.type}: {s.provider_name ? <span className="text-indigo-600 font-semibold">{s.provider_name}</span> : <span className="text-yellow-600 font-medium">Pending assignment</span>}
                            </div>
                          ))}
                        </td>
                        <td className="px-4 py-3 text-xs text-orange-600 font-medium">{b.check_in_time ? new Date(b.check_in_time).toLocaleTimeString() : '-'}</td>
                        <td className="px-4 py-3 text-xs text-green-600 font-medium">{b.check_out_time ? new Date(b.check_out_time).toLocaleTimeString() : '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 bg-gray-100 rounded-full text-[10px] font-bold uppercase`}>{b.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">User ID</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Joined Date</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? [...Array(4)].map((_, i) => <SkeletonRow key={i} />) : data.users.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-8 text-gray-500">No users found.</td></tr>
                    ) : data.users.map(u => (
                      <tr key={u.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">U-{u.id}</td>
                        <td className="px-4 py-3">{u.name}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3"><span className="text-green-600 font-bold text-xs">ACTIVE</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="font-bold text-gray-900">Manage Employees</h2>
                <button 
                  onClick={() => setShowEmployeeModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  + Add Employee
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">EMP ID</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Role / Service</th>
                      <th className="px-4 py-3">Station</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Earnings</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? [...Array(4)].map((_, i) => <SkeletonRow key={i} />) : data.providers.length === 0 ? (
                      <tr><td colSpan="7" className="text-center py-8 text-gray-500">No employees found.</td></tr>
                    ) : data.providers.map(p => (
                      <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">E-{p.id}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-semibold">{p.provider_type}</span>
                        </td>
                        <td className="px-4 py-3">{p.station}</td>
                        <td className="px-4 py-3">
                          {p.available ? <span className="text-green-600 font-bold text-xs">AVAILABLE</span> : <span className="text-orange-500 font-bold text-xs">BUSY</span>}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">₹{p.earnings || 0}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeleteEmployee(p.id)} className="text-red-500 hover:text-red-700 font-bold text-xs">
                            DELETE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'audit_logs' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Actor ID</th>
                      <th className="px-4 py-3">Booking ID</th>
                      <th className="px-4 py-3">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? [...Array(6)].map((_, i) => <SkeletonRow key={i} />) : data.audit_logs.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-8 text-gray-500">No audit logs found.</td></tr>
                    ) : data.audit_logs.map(log => (
                      <tr key={log._id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-[10px] font-bold uppercase">{log.action}</span>
                        </td>
                        <td className="px-4 py-3 font-medium">U-{log.actor_id}</td>
                        <td className="px-4 py-3 font-medium">#{log.booking_id}</td>
                        <td className="px-4 py-3 text-gray-700">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add New Employee</h2>
            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                <input required type="text" value={employeeForm.name} onChange={e => setEmployeeForm({...employeeForm, name: e.target.value})} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input required type="email" value={employeeForm.email} onChange={e => setEmployeeForm({...employeeForm, email: e.target.value})} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input required minLength={6} type="password" value={employeeForm.password} onChange={e => setEmployeeForm({...employeeForm, password: e.target.value})} className="input-field w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                  <select value={employeeForm.provider_type} onChange={e => setEmployeeForm({...employeeForm, provider_type: e.target.value})} className="input-field w-full">
                    <option value="PORTER">Porter</option>
                    <option value="WHEELCHAIR">Wheelchair</option>
                    <option value="MEET_AND_GREET">Meet & Greet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Station</label>
                  <select value={employeeForm.station} onChange={e => setEmployeeForm({...employeeForm, station: e.target.value})} className="input-field w-full">
                    <option value="New Delhi">New Delhi</option>
                    <option value="Mumbai CST">Mumbai CST</option>
                    <option value="Bengaluru City">Bengaluru City</option>
                    <option value="Chennai Central">Chennai Central</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowEmployeeModal(false)} className="px-4 py-2 text-gray-600 font-semibold rounded-lg hover:bg-gray-100">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
