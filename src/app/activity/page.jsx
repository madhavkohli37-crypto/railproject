'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axiosInstance';

export default function ActivityPage() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.get('/activity').then(response => setLogs(response.data)).catch(() => {}); }, []);
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold dark:text-white mb-2">Account Activity</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">A chronological record of important account actions.</p>
      {logs.length === 0 ? <div className="card text-gray-500">No account activity yet.</div> : (
        <div className="space-y-3">{logs.map(log => (
          <article key={log.id || `${log.action}-${log.timestamp}`} className="card flex justify-between gap-4">
            <div><h2 className="font-semibold dark:text-white">{String(log.action || 'Account activity').replaceAll('_', ' ')}</h2><p className="text-sm text-gray-500">{log.details}</p></div>
            <time className="shrink-0 text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</time>
          </article>
        ))}</div>
      )}
    </div>
  );
}
