'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const BookingContext = createContext(null);
const STORAGE_KEY = 'railassist.active-booking';
const ACTIVE_STATUSES = new Set(['REQUESTED', 'SEARCHING', 'ASSIGNED', 'PARTIALLY_ASSIGNED', 'ACCEPTED', 'ARRIVED', 'STARTED', 'IN_PROGRESS']);
const isActive = booking => Boolean(booking?.id && ACTIVE_STATUSES.has(booking.status));

export function BookingProvider({ children }) {
  const { user } = useAuth();
  const [activeBooking, setState] = useState(null);
  const ref = useRef(null);

  const setActiveBooking = useCallback(value => {
    const next = isActive(typeof value === 'function' ? value(ref.current) : value) ? (typeof value === 'function' ? value(ref.current) : value) : null;
    ref.current = next;
    setState(next);
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (!user) { ref.current = null; setState(null); return; }
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (stored?.user_id === user.id && isActive(stored)) { ref.current = stored; setState(stored); }
      else localStorage.removeItem(STORAGE_KEY);
    } catch { localStorage.removeItem(STORAGE_KEY); }
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;
    const apply = event => {
      const booking = event.detail?.booking;
      if (booking?.user_id !== user.id) return;
      if (['COMPLETED', 'CANCELLED', 'REJECTED_OR_CANCELLED', 'CANCELLED_BY_PROVIDER'].includes(booking.status)) {
        setActiveBooking(null);
        return;
      }
      setActiveBooking(current => ({ ...(current || {}), ...booking }));
    };
    const sync = event => {
      const bookings = Array.isArray(event.detail) ? event.detail : [];
      const next = bookings.find(item => item.id === ref.current?.id) || bookings.find(isActive);
      setActiveBooking(next || null);
    };
    const names = ['accepted', 'updated', 'arrived', 'started', 'completed', 'cancelled'];
    names.forEach(name => window.addEventListener(`railassist:booking:${name}`, apply));
    window.addEventListener('railassist:sync', sync);
    return () => {
      names.forEach(name => window.removeEventListener(`railassist:booking:${name}`, apply));
      window.removeEventListener('railassist:sync', sync);
    };
  }, [user, setActiveBooking]);

  return <BookingContext.Provider value={{ activeBooking, setActiveBooking }}>{children}</BookingContext.Provider>;
}

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within BookingProvider');
  return context;
};
