'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axiosInstance';
import BookingCard from '@/components/BookingCard';

// ─────────────────────────────────────────────────────────────────────────────
// 1. PASSENGER VIEW
// ─────────────────────────────────────────────────────────────────────────────
function PassengerView({ user }) {
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelMsg, setCancelMsg] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data);
    } catch {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  useEffect(() => {
    api.get('/complaints')
      .then(res => setComplaints(res.data))
      .catch(() => setError('Failed to load complaint history'))
      .finally(() => setComplaintsLoading(false));
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      setCancelMsg('Booking cancelled successfully!');
      fetchBookings();
      setTimeout(() => setCancelMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const activeStatuses = ['REQUESTED', 'ASSIGNED', 'PARTIALLY_ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'];
  const activeBookings = bookings.filter(b => activeStatuses.includes(b.status));
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED' || b.status === 'REJECTED_OR_CANCELLED');
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const totalSpent = completedBookings.reduce((sum, b) => sum + b.total_price, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-[#1a3a6b] to-[#2563eb] dark:from-[#0f2347] dark:to-[#1a3a6b] text-white rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 text-[10rem] leading-none">🚂</div>
        <h1 className="text-3xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-blue-200">Here's a summary of your railway activity.</p>
        <div className="mt-6">
          <Link href="/book" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm shadow-sm">🧳 Request Assistance</Link>
          <Link href="/report" className="ml-3 border border-white/50 hover:bg-white/10 text-white font-semibold px-6 py-2.5 rounded-lg text-sm">📣 Report Activity</Link>
        </div>
      </div>

      {cancelMsg && <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm">✅ {cancelMsg}</div>}
      {error && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">⚠️ {error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Bookings', value: bookings.length, icon: '📋', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
          { label: 'Active', value: activeBookings.length, icon: '✅', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
          { label: 'Cancelled', value: cancelledBookings.length, icon: '❌', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' },
          { label: 'Total Spent', value: `₹${totalSpent}`, icon: '💰', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30' },
        ].map(stat => (
          <div key={stat.label} className="card hover:shadow-md transition-all">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center text-xl mb-3`}>{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {loading ? <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-14 animate-pulse" /> : stat.value}
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">👤 My Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div><p className="text-gray-500 dark:text-gray-400 mb-1">Full Name</p><p className="font-semibold dark:text-white">{user?.name}</p></div>
          <div><p className="text-gray-500 dark:text-gray-400 mb-1">Email</p><p className="font-semibold dark:text-white">{user?.email}</p></div>
          <div><p className="text-gray-500 dark:text-gray-400 mb-1">Phone</p><p className="font-semibold dark:text-white">{user?.phone || '—'}</p></div>
          <div><p className="text-gray-500 dark:text-gray-400 mb-1">Good Human Score</p><p className="font-semibold text-green-600 dark:text-green-400">{user?.good_human_score ?? 100}/100</p></div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">📣 My Complaint Logs</h2>
          <Link href="/report" className="text-sm text-orange-500 hover:text-orange-600 font-semibold">+ New Report</Link>
        </div>
        {complaintsLoading ? (
          <div className="card animate-pulse h-32" />
        ) : complaints.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">You have not submitted any activity reports.</p>
            <Link href="/report" className="btn-outline text-sm">Report an Activity</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map(complaint => (
              <div key={complaint.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Report #{complaint.id} · {complaint.category}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {complaint.station} · {new Date(complaint.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <span className="badge-info">{complaint.status.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{complaint.description}</p>
                {complaint.resolution && (
                  <div className="mt-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3 text-sm text-gray-600 dark:text-gray-300">
                    <strong>Review outcome:</strong> {complaint.resolution.action.replace(/_/g, ' ')}
                    {complaint.resolution.notes ? ` — ${complaint.resolution.notes}` : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">🧳 My Bookings</h2>
          <Link href="/book" className="text-sm text-orange-500 hover:text-orange-600 font-semibold">+ New Request</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{[1,2].map(i => <div key={i} className="card animate-pulse h-48" />)}</div>
        ) : bookings.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">🧳</div>
            <h3 className="text-xl font-bold dark:text-white mb-2">No bookings yet.</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Book your first provider for your upcoming journey!</p>
            <Link href="/book" className="btn-primary inline-block">Request Assistance</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {bookings.map(booking => <BookingCard key={booking.id} booking={booking} onCancel={handleCancel} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PROVIDER VIEW (Employee Portal)
// ─────────────────────────────────────────────────────────────────────────────
function ProviderView({ user }) {
  const [jobs, setJobs] = useState([]);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/provider/dashboard');
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const toggleAvailability = async () => {
    try {
      const res = await api.patch('/provider/availability', { available: !available });
      setAvailable(res.data.available);
    } catch { alert('Failed to update availability'); }
  };

  const updateStatus = async (bookingId, status) => {
    try {
      setJobs(jobs.map(j => j.booking_id === bookingId ? { ...j, status } : j));
      await api.patch(`/provider/job/${bookingId}/status`, { status });
      fetchJobs();
    } catch {
      alert('Failed to update status');
      fetchJobs();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="card flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold px-2 py-1 rounded-full">EMPLOYEE PORTAL</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Provider Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleAvailability}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${available ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}
          >
            {available ? '🟢 Available' : '🔴 Busy'}
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assigned Jobs</h2>

      {loading ? (
        <div className="space-y-4">{[1,2].map(i => <div key={i} className="card animate-pulse h-40" />)}</div>
      ) : jobs.length === 0 ? (
        <div className="card text-center py-10">
          <div className="text-5xl mb-4">😴</div>
          <h3 className="text-lg font-bold dark:text-white">No active jobs</h3>
          <p className="text-gray-500 dark:text-gray-400">Stay available to receive incoming requests.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.map(job => (
            <div key={job.booking_id} className="card hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                    job.status === 'ASSIGNED' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                    job.status === 'ACCEPTED' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' :
                    job.status === 'IN_PROGRESS' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                    job.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {job.status === 'IN_PROGRESS' ? 'IN PROGRESS' : job.status}
                  </span>
                  <h3 className="text-lg font-bold dark:text-white">{job.type} @ {job.station}</h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{job.price}</p>
                  <p className="text-xs text-gray-500">Earnings</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl mb-4">
                <div><span className="text-gray-500 dark:text-gray-400 block text-xs">Train</span><span className="font-semibold dark:text-white">{job.train_number || 'N/A'}</span></div>
                <div><span className="text-gray-500 dark:text-gray-400 block text-xs">Platform</span><span className="font-semibold dark:text-white">{job.platform || 'N/A'}</span></div>
                <div><span className="text-gray-500 dark:text-gray-400 block text-xs">Scheduled</span><span className="font-semibold dark:text-white">{job.scheduled_at ? new Date(job.scheduled_at).toLocaleString() : 'ASAP'}</span></div>
                {job.type === 'PORTER' && <div><span className="text-gray-500 dark:text-gray-400 block text-xs">Bags</span><span className="font-semibold dark:text-white">{job.bags_count}</span></div>}
              </div>
              <div className="flex space-x-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                {job.status === 'ASSIGNED' && (
                  <>
                    <button onClick={() => updateStatus(job.booking_id, 'ACCEPTED')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold flex-1 active:scale-95">✅ Accept</button>
                    <button onClick={() => updateStatus(job.booking_id, 'REJECTED')} className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 text-gray-800 dark:text-white px-6 py-2 rounded-lg font-semibold active:scale-95">❌ Reject</button>
                  </>
                )}
                {job.status === 'ACCEPTED' && (
                  <button onClick={() => updateStatus(job.booking_id, 'IN_PROGRESS')} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold flex-1 active:scale-95">📍 Check-In / Start</button>
                )}
                {job.status === 'IN_PROGRESS' && (
                  <button onClick={() => updateStatus(job.booking_id, 'COMPLETED')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold flex-1 active:scale-95">🏁 Check-Out / Complete</button>
                )}
                {job.status === 'COMPLETED' && (
                  <div className="text-green-600 dark:text-green-400 font-bold flex items-center justify-center w-full bg-green-50 dark:bg-green-900/30 py-2 rounded-lg">🎉 Job Completed!</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. COMPLAINT REVIEW PORTAL
// ─────────────────────────────────────────────────────────────────────────────
function ComplaintsView() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [forms, setForms] = useState({});

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const review = async (complaint) => {
    const form = forms[complaint.id] || {};
    setActionLoading(prev => ({ ...prev, [complaint.id]: true }));
    try {
      await api.patch(`/complaints/${complaint.id}`, {
        action: form.action || 'UPHOLD',
        accused_user_id: form.accused_user_id,
        fine_amount: form.fine_amount || 0,
        score_penalty: form.score_penalty || 0,
        notes: form.notes,
      });
      await fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.error || 'Unable to review complaint');
    } finally {
      setActionLoading(prev => ({ ...prev, [complaint.id]: false }));
    }
  };

  const setForm = (id, key, value) => setForms(prev => ({ ...prev, [id]: { ...prev[id], [key]: value } }));

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold dark:text-white">📣 Complaint Review Portal</h1><p className="text-sm text-gray-500 dark:text-gray-400">Review evidence fairly. Only apply penalties when the facts support the complaint.</p></div>
        <button onClick={fetchComplaints} className="btn-outline text-sm px-3 py-2">🔄 Refresh</button>
      </div>
      {loading ? <div className="card animate-pulse h-40" /> : complaints.length === 0 ? <div className="card text-center py-12 text-gray-500">No complaints have been registered.</div> : complaints.map(complaint => {
        const form = forms[complaint.id] || {};
        const open = ['OPEN', 'INFO_REQUESTED'].includes(complaint.status);
        return <div key={complaint.id} className="card space-y-4">
          <div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-bold text-lg dark:text-white">#{complaint.id} · {complaint.category}</h2><p className="text-sm text-gray-500">{complaint.station}{complaint.train_number ? ` · Train ${complaint.train_number}` : ''} · Reported by {complaint.reporter_name} (U-{complaint.reporter_id})</p></div><span className="badge-info">{complaint.status}</span></div>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{complaint.description}</p>
          {complaint.images?.length > 0 && <div className="flex gap-3 flex-wrap">{complaint.images.map((image, index) => <a key={index} href={image.data} target="_blank" rel="noreferrer"><img src={image.data} alt={`Complaint evidence ${index + 1}`} className="w-24 h-24 object-cover rounded-lg border dark:border-gray-600" /></a>)}</div>}
          {open && <div className="grid grid-cols-2 md:grid-cols-5 gap-3 border-t pt-4 dark:border-gray-700">
            <input className="input-field" placeholder="Accused user ID" value={form.accused_user_id || ''} onChange={e => setForm(complaint.id, 'accused_user_id', e.target.value)} />
            <input className="input-field" type="number" min="0" max="100" placeholder="Score penalty" value={form.score_penalty || ''} onChange={e => setForm(complaint.id, 'score_penalty', e.target.value)} />
            <input className="input-field" type="number" min="0" placeholder="Fine (₹)" value={form.fine_amount || ''} onChange={e => setForm(complaint.id, 'fine_amount', e.target.value)} />
            <select className="input-field" value={form.action || 'UPHOLD'} onChange={e => setForm(complaint.id, 'action', e.target.value)}><option value="UPHOLD">Uphold</option><option value="DISMISS">Dismiss</option><option value="REQUEST_INFO">Request info</option></select>
            <button disabled={actionLoading[complaint.id]} onClick={() => review(complaint)} className="btn-primary">{actionLoading[complaint.id] ? 'Saving...' : 'Save Review'}</button>
            <textarea className="input-field col-span-2 md:col-span-5" rows="2" placeholder="Review notes" value={form.notes || ''} onChange={e => setForm(complaint.id, 'notes', e.target.value)} />
          </div>}
          {!open && complaint.resolution && <p className="text-sm text-gray-500">Resolution: {complaint.resolution.action}; fine ₹{complaint.resolution.fine_amount}; score penalty {complaint.resolution.score_penalty}. {complaint.resolution.notes || ''}</p>}
        </div>;
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ADMIN VIEW (Master Portal)
// ─────────────────────────────────────────────────────────────────────────────
function AdminView({ currentUser }) {
  const [data, setData] = useState({ bookings: [], users: [], providers: [], audit_logs: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Employee modal
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({ name: '', email: '', password: '', provider_type: 'PORTER', station: 'New Delhi' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settings (change own credentials)
  const [settingsForm, setSettingsForm] = useState({ currentPassword: '', newEmail: '', newPassword: '', confirmNewPassword: '' });
  const [settingsMsg, setSettingsMsg] = useState({ type: '', text: '' });
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Show/hide hashed password per employee
  const [revealPwFor, setRevealPwFor] = useState({});

  // Porter applications
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState('');
  const [appActionLoading, setAppActionLoading] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    setAppsLoading(true);
    setAppsError('');
    try {
      const res = await api.get('/admin/applications');
      setApplications(res.data);
    } catch {
      setAppsError('Failed to load applications');
    } finally {
      setAppsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (activeTab === 'applications') fetchApplications(); }, [activeTab]);

  const handleApplicationAction = async (id, action) => {
    setAppActionLoading(prev => ({ ...prev, [id]: action }));
    try {
      await api.patch(`/admin/applications/${id}`, { action });
      fetchApplications();
      fetchData(); // Refresh employee counts
    } catch (err) {
      alert(err.response?.data?.error || `Failed to ${action} application`);
    } finally {
      setAppActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };


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
    if (!window.confirm('Are you sure? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/employees/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete employee');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (settingsForm.newPassword && settingsForm.newPassword !== settingsForm.confirmNewPassword) {
      setSettingsMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setSettingsLoading(true);
    setSettingsMsg({ type: '', text: '' });
    try {
      await api.patch('/admin/settings', {
        currentPassword: settingsForm.currentPassword,
        newEmail: settingsForm.newEmail || undefined,
        newPassword: settingsForm.newPassword || undefined,
      });
      setSettingsMsg({ type: 'success', text: '✅ Credentials updated! Please log in again with your new details.' });
      setSettingsForm({ currentPassword: '', newEmail: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setSettingsMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update credentials.' });
    } finally {
      setSettingsLoading(false);
    }
  };

  const pendingCount = applications.filter(a => a.status === 'PENDING').length;
  const TABS = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'bookings', label: '🧳 Bookings' },
    { id: 'users', label: '👤 Users' },
    { id: 'employees', label: '👷 Employees' },
    { id: 'applications', label: `📋 Applications${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
    { id: 'complaints', label: '📣 Complaints' },
    { id: 'audit_logs', label: '🗒️ Audit Logs' },
    { id: 'settings', label: '⚙️ Settings' },
  ];


  const StatCard = ({ title, value, color }) => (
    <div className="card hover:shadow-md transition-all">
      <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-2">{title}</p>
      {loading ? <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" /> : (
        <p className={`text-3xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold px-2 py-1 rounded-full">🛡️ MASTER PORTAL</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Administration</h1>
          <p className="text-gray-500 dark:text-gray-400">Logged in as <span className="font-semibold">{currentUser?.email}</span></p>
        </div>
        <button onClick={fetchData} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700">
          🔄 Refresh
        </button>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl">⚠️ {error}</div>}

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-px">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-red-600 text-red-600 dark:text-red-400 dark:border-red-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === 'complaints' && <ComplaintsView />}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Total Users" value={data.stats?.total_users || 0} color="blue" />
          <StatCard title="Employees" value={data.stats?.total_employees || 0} color="indigo" />
          <StatCard title="Pending" value={data.stats?.pending_bookings || 0} color="yellow" />
          <StatCard title="Active" value={data.stats?.active_bookings || 0} color="orange" />
          <StatCard title="Completed" value={data.stats?.completed_bookings || 0} color="green" />
          <StatCard title="Total Bookings" value={data.stats?.total_bookings || 0} color="purple" />
        </div>
      )}

      {/* ── Bookings ── */}
      {activeTab === 'bookings' && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {['ID / Time','Station','User ID','Assigned Employees','Check-In','Check-Out','Status'].map(h => (
                    <th key={h} className="px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b dark:border-gray-700 animate-pulse">
                    {[...Array(7)].map((__, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>)}
                  </tr>
                )) : data.bookings?.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-10 text-gray-500">No bookings yet.</td></tr>
                ) : data.bookings?.map(b => (
                  <tr key={b.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900 dark:text-white">#{b.id}</div>
                      <div className="text-xs text-gray-500">{new Date(b.created_at).toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3 dark:text-gray-300">{b.station}</td>
                    <td className="px-4 py-3 dark:text-gray-300">U-{b.user_id}</td>
                    <td className="px-4 py-3">
                      {b.services?.map((s, idx) => (
                        <div key={idx} className="text-xs mb-1">
                          <span className="text-gray-500">{s.type}:</span>{' '}
                          {s.provider_name
                            ? <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{s.provider_name}</span>
                            : <span className="text-yellow-600 dark:text-yellow-400">Pending</span>
                          }
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-xs text-orange-600 font-medium">{b.check_in_time ? new Date(b.check_in_time).toLocaleTimeString() : '—'}</td>
                    <td className="px-4 py-3 text-xs text-green-600 font-medium">{b.check_out_time ? new Date(b.check_out_time).toLocaleTimeString() : '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-[10px] font-bold uppercase">{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Users ── */}
      {activeTab === 'users' && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {['User ID','Name','Email','Phone','Joined'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading ? [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b dark:border-gray-700 animate-pulse">
                    {[...Array(5)].map((__, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>)}
                  </tr>
                )) : data.users?.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-10 text-gray-500">No passengers yet.</td></tr>
                ) : data.users?.map(u => (
                  <tr key={u.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-gray-600 dark:text-gray-400">U-{u.id}</td>
                    <td className="px-4 py-3 font-medium dark:text-white">{u.name}</td>
                    <td className="px-4 py-3 text-blue-600 dark:text-blue-400">{u.email}</td>
                    <td className="px-4 py-3 dark:text-gray-300">{u.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Employees ── */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Manage Employees</h2>
            <button
              onClick={() => setShowEmployeeModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              + Add Employee
            </button>
          </div>

          {/* Employee cards with full details */}
          {loading ? (
            <div className="space-y-3">{[1,2].map(i => <div key={i} className="card animate-pulse h-28" />)}</div>
          ) : data.providers?.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-gray-500">No employees yet. Add one above.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {data.providers?.map(p => (
                <div key={p.id} className="card border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-bold dark:text-white">{p.name}</span>
                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full">{p.provider_type}</span>
                        {p.available
                          ? <span className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">🟢 AVAILABLE</span>
                          : <span className="bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold px-2 py-0.5 rounded-full">🔴 BUSY</span>
                        }
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1 text-sm">
                        <div>
                          <span className="text-gray-400 dark:text-gray-500 text-xs block">Employee ID</span>
                          <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">E-{p.id}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 dark:text-gray-500 text-xs block">Login Email</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">{p.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 dark:text-gray-500 text-xs block">Station</span>
                          <span className="font-semibold dark:text-gray-300">{p.station}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 dark:text-gray-500 text-xs block">Jobs Completed</span>
                          <span className="font-semibold dark:text-gray-300">{p.completed_jobs || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 dark:text-gray-500 text-xs block">Total Earnings</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">₹{p.earnings || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 dark:text-gray-500 text-xs block">Rating</span>
                          <span className="font-semibold dark:text-gray-300">⭐ {p.rating || 'N/A'}</span>
                        </div>
                      </div>
                      {/* Hashed password row */}
                      <div className="mt-2">
                        <span className="text-gray-400 dark:text-gray-500 text-xs block mb-1">Password Hash (bcrypt)</span>
                        <div className="flex items-center gap-2">
                          <code className="text-[11px] font-mono bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 break-all">
                            {revealPwFor[p.id] ? (p.password_hash || '—') : '•'.repeat(40)}
                          </code>
                          <button
                            onClick={() => setRevealPwFor(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap font-semibold"
                          >
                            {revealPwFor[p.id] ? '🙈 Hide' : '👁️ Reveal'}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex md:flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleDeleteEmployee(p.id)}
                        className="text-red-500 hover:text-white hover:bg-red-600 border border-red-300 dark:border-red-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Audit Logs ── */}
      {activeTab === 'audit_logs' && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {['Timestamp','Action','Actor ID','Booking ID','Details'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b dark:border-gray-700 animate-pulse">
                    {[...Array(5)].map((__, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>)}
                  </tr>
                )) : data.audit_logs?.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-10 text-gray-500">No logs yet.</td></tr>
                ) : data.audit_logs?.map((log, i) => (
                  <tr key={i} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3"><span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-[10px] font-bold">{log.action}</span></td>
                    <td className="px-4 py-3 font-mono text-xs dark:text-gray-300">U-{log.actor_id}</td>
                    <td className="px-4 py-3 font-mono text-xs dark:text-gray-300">{log.booking_id ? `#${log.booking_id}` : '—'}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Applications (Porter Self-Registration) ── */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Porter Applications</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Review self-registered porter applications. Approve to activate their account.</p>
            </div>
            <button onClick={fetchApplications} className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700">
              🔄 Refresh
            </button>
          </div>

          {appsError && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl">⚠️ {appsError}</div>}

          {appsLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card animate-pulse h-28" />)}</div>
          ) : applications.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-5xl mb-3">📭</div>
              <h3 className="font-bold dark:text-white mb-1">No Applications Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">When porters self-register via the public form, their applications appear here.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {applications.map(app => (
                <div key={app.id} className="card border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-lg font-bold dark:text-white">{app.name}</span>
                        {app.status === 'PENDING' && <span className="badge-pending">⏳ Pending Review</span>}
                        {app.status === 'APPROVED' && <span className="badge-approved">✅ Approved</span>}
                        {app.status === 'REJECTED' && <span className="badge-rejected">❌ Rejected</span>}
                        <span className="badge-info">{app.provider_type}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 text-sm">
                        <div>
                          <span className="text-gray-400 dark:text-gray-500 text-xs block">Email</span>
                          <span className="font-medium text-blue-600 dark:text-blue-400">{app.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 dark:text-gray-500 text-xs block">Phone</span>
                          <span className="font-medium dark:text-gray-300">{app.phone || '—'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 dark:text-gray-500 text-xs block">Station</span>
                          <span className="font-medium dark:text-gray-300">{app.station}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 dark:text-gray-500 text-xs block">Experience</span>
                          <span className="font-medium dark:text-gray-300">{app.experience_years > 0 ? `${app.experience_years} yrs` : 'Fresher'}</span>
                        </div>
                        {app.aadhar_number && (
                          <div>
                            <span className="text-gray-400 dark:text-gray-500 text-xs block">Aadhaar</span>
                            <span className="font-mono font-medium dark:text-gray-300">{'*'.repeat(8)}{app.aadhar_number.slice(-4)}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-400 dark:text-gray-500 text-xs block">Applied On</span>
                          <span className="font-medium dark:text-gray-300">{new Date(app.applied_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {app.status === 'PENDING' && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleApplicationAction(app.id, 'approve')}
                          disabled={!!appActionLoading[app.id]}
                          className="btn-success text-sm px-4 py-2 disabled:opacity-50"
                        >
                          {appActionLoading[app.id] === 'approve' ? '...' : '✅ Approve'}
                        </button>
                        <button
                          onClick={() => handleApplicationAction(app.id, 'reject')}
                          disabled={!!appActionLoading[app.id]}
                          className="btn-danger text-sm px-4 py-2 disabled:opacity-50"
                        >
                          {appActionLoading[app.id] === 'reject' ? '...' : '❌ Reject'}
                        </button>
                      </div>
                    )}
                    {(app.status === 'APPROVED' || app.status === 'REJECTED') && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                        Reviewed: {app.reviewed_at ? new Date(app.reviewed_at).toLocaleString() : '—'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Settings ── */}
      {activeTab === 'settings' && (

        <div className="max-w-lg">
          <div className="card space-y-6">
            <div>
              <h2 className="text-xl font-bold dark:text-white mb-1">⚙️ Admin Credentials</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Change your login email or password. Current credentials are stored in <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">admin.md</code>.
              </p>
            </div>

            {settingsMsg.text && (
              <div className={`px-4 py-3 rounded-lg text-sm border ${
                settingsMsg.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
              }`}>
                {settingsMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Current Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Verify your identity"
                  value={settingsForm.currentPassword}
                  onChange={e => setSettingsForm(f => ({ ...f, currentPassword: e.target.value }))}
                  className="input-field"
                />
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">New Email Address</label>
                <input
                  type="email"
                  placeholder={`Current: ${currentUser?.email}`}
                  value={settingsForm.newEmail}
                  onChange={e => setSettingsForm(f => ({ ...f, newEmail: e.target.value }))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={settingsForm.newPassword}
                  onChange={e => setSettingsForm(f => ({ ...f, newPassword: e.target.value }))}
                  className="input-field"
                  minLength={settingsForm.newPassword ? 6 : undefined}
                />
              </div>

              {settingsForm.newPassword && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={settingsForm.confirmNewPassword}
                    onChange={e => setSettingsForm(f => ({ ...f, confirmNewPassword: e.target.value }))}
                    className="input-field"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={settingsLoading}
                className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 flex justify-center items-center h-12"
              >
                {settingsLoading ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                    <span>Saving...</span>
                  </span>
                ) : '🔐 Save Credentials'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 dark:text-white">👷 Add New Employee</h2>
            <form onSubmit={handleCreateEmployee} className="space-y-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Password', key: 'password', type: 'password' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                  <input
                    required
                    type={type}
                    minLength={key === 'password' ? 6 : undefined}
                    value={employeeForm[key]}
                    onChange={e => setEmployeeForm({ ...employeeForm, [key]: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Service Type</label>
                  <select value={employeeForm.provider_type} onChange={e => setEmployeeForm({ ...employeeForm, provider_type: e.target.value })} className="input-field w-full">
                    <option value="PORTER">Porter</option>
                    <option value="WHEELCHAIR">Wheelchair</option>
                    <option value="MEET_AND_GREET">Meet & Greet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Station</label>
                  <select value={employeeForm.station} onChange={e => setEmployeeForm({ ...employeeForm, station: e.target.value })} className="input-field w-full">
                    <option>New Delhi</option>
                    <option>Mumbai CST</option>
                    <option>Bengaluru City</option>
                    <option>Chennai Central</option>
                    <option>Kolkata Howrah</option>
                    <option>Hyderabad Deccan</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button type="button" onClick={() => setShowEmployeeModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD ROUTER
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-3">🚂</div>
          <p className="text-gray-500 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] py-8 px-4 max-w-7xl mx-auto">
      {user.role === 'ADMIN'     && <AdminView currentUser={user} />}
      {user.role === 'PROVIDER'  && <ProviderView user={user} />}
      {user.role === 'PASSENGER' && <PassengerView user={user} />}
      {user.role === 'MANAGER'   && <ComplaintsView />}
    </div>
  );
}
