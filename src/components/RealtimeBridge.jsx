'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

export default function RealtimeBridge() {
  const { user } = useAuth();
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!user || !token) return undefined;
    const configuredUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
    let socketUrl = configuredUrl;
    try {
      const normalizedConfiguredUrl = /^[a-z][a-z\d+.-]*:\/\//i.test(configuredUrl) ? configuredUrl : `https://${configuredUrl}`;
      const url = new URL(normalizedConfiguredUrl, window.location.origin);
      url.pathname = '';
      url.search = '';
      url.hash = '';
      socketUrl = url.toString().replace(/\/$/, '');
    } catch {
      socketUrl = configuredUrl.replace(/\/api\/socket\.io\/?$/, '').replace(/\/$/, '');
    }
    const socket = io(socketUrl, {
      path: '/api/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
    });
    const forward = event => payload => {
      if (process.env.NODE_ENV !== 'production') console.debug(`[realtime] received ${event}`);
      window.dispatchEvent(new CustomEvent(`railassist:${event}`, { detail: payload }));
    };
    socket.on('connect_error', error => window.dispatchEvent(new CustomEvent('railassist:socket-error', { detail: { message: error.message } })));
    socket.on('disconnect', reason => window.dispatchEvent(new CustomEvent('railassist:disconnected', { detail: { reason } })));
    socket.on('booking:created', forward('booking:created'));
    socket.on('booking:new', forward('booking:new'));
    socket.on('booking:offer', forward('booking:offer'));
    socket.on('booking:accepted', forward('booking:accepted'));
    socket.on('booking:declined', forward('booking:declined'));
    socket.on('booking:removed', forward('booking:removed'));
    socket.on('booking:cancelled', forward('booking:cancelled'));
    socket.on('provider:arrived', forward('provider:arrived'));
    socket.on('booking:started', forward('booking:started'));
    socket.on('booking:completed', forward('booking:completed'));
    socket.on('booking:updated', forward('booking:updated'));
    socket.on('notification:new', forward('notification:new'));
    socket.on('connect', async () => {
      window.dispatchEvent(new CustomEvent('railassist:connected'));
      socket.emit('booking:sync', async result => {
        if (!result?.reload) return;
        const endpoint = user.role === 'PROVIDER' ? '/api/provider/dashboard' : '/api/bookings/my';
        const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
        if (response.ok) window.dispatchEvent(new CustomEvent('railassist:sync', { detail: await response.json() }));
      });
    });
    return () => socket.disconnect();
  }, [user]);
  return null;
}
