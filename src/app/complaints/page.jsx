'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axiosInstance';

export default function ComplaintHistoryPage() {
  const [complaints, setComplaints] = useState([]);
  useEffect(() => { api.get('/complaints').then(response => setComplaints(response.data)).catch(() => {}); }, []);
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold dark:text-white mb-2">Complaint History</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Review complaints submitted by your account and their resolution status.</p>
      {complaints.length === 0 ? <div className="card text-gray-500">No complaints submitted.</div> : (
        <div className="space-y-4">{complaints.map(complaint => (
          <article key={complaint.id} className="card">
            <div className="flex flex-wrap justify-between gap-3">
              <h2 className="font-bold dark:text-white">Complaint #{complaint.id}</h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">{complaint.status}</span>
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{complaint.description || complaint.details || complaint.category}</p>
            <p className="mt-2 text-xs text-gray-500">{new Date(complaint.created_at).toLocaleString()}</p>
          </article>
        ))}</div>
      )}
    </div>
  );
}
