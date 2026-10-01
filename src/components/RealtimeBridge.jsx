'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

export default function RealtimeBridge() {
  const { user } = useAuth();
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!user || !token) return undefined;
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
    const socket = io(socketUrl, {
      path: '/api/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
    });
    const forward = event => payload => {
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`[realtime] received ${event}`);
      }
      window.dispatchEvent(new CustomEvent(`railassist:${event}`, { detail: payload }));
    };
    socket.on('connect_error', error => {
      window.dispatchEvent(new CustomEvent('railassist:socket-error', { detail: { message: error.message } }));
    });
    socket.on('disconnect', reason => {
      window.dispatchEvent(new CustomEvent('railassist:disconnected', { detail: { reason } }));
    });
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
      window.dispatchEvent(new CustomEvent('railassist:socket-ready'));
      socket.emit('booking:sync', async result => {
        if (!result?.reload) return;
        const endpoint = user.role === 'PROVIDER' ? '/api/provider/dashboard' : '/api/bookings/my';
        const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
        if (response.ok) window.dispatchEvent(new CustomEvent('railassist:sync', { detail: await response.json() }));
      });
    });
    const watchBooking = event => {
      if (event.detail?.bookingId) socket.emit('booking:subscribe', event.detail.bookingId);
    };
    window.addEventListener('railassist:watch-booking', watchBooking);
    return () => {
      window.removeEventListener('railassist:watch-booking', watchBooking);
      socket.disconnect();
    };
  }, [user]);
  return null;
}
