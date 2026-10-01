'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const BookingContext = createContext(null);
const STORAGE_KEY = 'railassist.active-booking';

export function BookingProvider({ children }) {
  const { user } = useAuth();
  const [activeBooking, setActiveBookingState] = useState(null);
  const activeBookingRef = useRef(null);

  useEffect(() => {
    if (!user) {
      activeBookingRef.current = null;
      setActiveBookingState(null);
      return;
    }
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (stored?.user_id === user.id) {
        activeBookingRef.current = stored;
        setActiveBookingState(stored);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const setActiveBooking = useCallback(bookingOrUpdater => {
    const booking = typeof bookingOrUpdater === 'function'
      ? bookingOrUpdater(activeBookingRef.current)
      : bookingOrUpdater;
    activeBookingRef.current = booking || null;
    setActiveBookingState(booking || null);
    if (booking) localStorage.setItem(STORAGE_KEY, JSON.stringify(booking));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    const apply = event => {
      const booking = event.detail?.booking;
      if (!booking || booking.user_id !== user.id) return;
      setActiveBookingState(current => {
        const merged = { ...(current || {}), ...booking };
        activeBookingRef.current = merged;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      });
    };
    const sync = event => {
      const bookings = Array.isArray(event.detail) ? event.detail : [];
      const currentId = activeBookingRef.current?.id;
      const next = bookings.find(item => item.id === currentId)
        || bookings.find(item => item.status !== 'COMPLETED' && item.status !== 'CANCELLED');
      if (next) setActiveBooking(next);
    };
    const events = ['accepted', 'updated', 'arrived', 'started', 'completed', 'cancelled'];
    events.forEach(name => window.addEventListener(`railassist:booking:${name}`, apply));
    window.addEventListener('railassist:sync', sync);
    return () => {
      events.forEach(name => window.removeEventListener(`railassist:booking:${name}`, apply));
      window.removeEventListener('railassist:sync', sync);
    };
  }, [user, setActiveBooking]);

  return (
    <BookingContext.Provider value={{ activeBooking, setActiveBooking }}>
      {children}
    </BookingContext.Provider>
  );
}

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within BookingProvider');
  return context;
};
