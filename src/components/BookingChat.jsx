'use client';

import { useEffect, useRef, useState } from 'react';
import api from '@/lib/axiosInstance';
import { useAuth } from '@/context/AuthContext';

export default function BookingChat({ booking, disabled = false }) {
  const bookingId = booking?.id;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [typingName, setTypingName] = useState('');
  const [newCount, setNewCount] = useState(0);
  const listRef = useRef(null);
  const endRef = useRef(null);
  const typingTimer = useRef(null);
  const remoteTypingTimer = useRef(null);
  const { user } = useAuth();

  const nearBottom = () => {
    const list = listRef.current;
    return !list || list.scrollHeight - list.scrollTop - list.clientHeight < 100;
  };

  useEffect(() => {
    if (!bookingId) return undefined;
    let active = true;
    setLoading(true);
    api.get(`/bookings/${bookingId}/messages`)
      .then(res => { if (active) setMessages(res.data); })
      .catch(err => { if (active) setError(err.response?.data?.error || 'Unable to load chat'); })
      .finally(() => { if (active) setLoading(false); });
    const receive = event => {
      const message = event.detail?.message;
      if (!message || String(message.booking_id) !== String(bookingId) || message.sender_id === user?.id) return;
      const shouldScroll = nearBottom();
      setMessages(current => current.some(item => item.id === message.id) ? current : [...current, message]);
      if (shouldScroll) endRef.current?.scrollIntoView({ behavior: 'smooth' });
      else setNewCount(count => count + 1);
    };
    const receiveTyping = event => {
      const detail = event.detail;
      if (!detail || String(detail.booking_id) !== String(bookingId) || String(detail.sender_id) === String(user?.id)) return;
      setTypingName(detail.typing ? (detail.sender_name || 'Participant') : '');
      window.clearTimeout(remoteTypingTimer.current);
      if (detail.typing) remoteTypingTimer.current = window.setTimeout(() => setTypingName(''), 2500);
    };
    window.addEventListener('railassist:booking:message', receive);
    window.addEventListener('railassist:booking:typing', receiveTyping);
    return () => {
      active = false;
      window.removeEventListener('railassist:booking:message', receive);
      window.removeEventListener('railassist:booking:typing', receiveTyping);
      window.clearTimeout(remoteTypingTimer.current);
      window.clearTimeout(typingTimer.current);
    };
  }, [bookingId, user?.id]);

  useEffect(() => {
    if (!loading) endRef.current?.scrollIntoView();
  }, [loading]);

  const stopTyping = () => {
    window.clearTimeout(typingTimer.current);
    if (!disabled) api.post(`/bookings/${bookingId}/messages`, { typing: false }).catch(() => {});
  };

  const onChange = event => {
    const value = event.target.value;
    setText(value);
    if (disabled) return;
    window.clearTimeout(typingTimer.current);
    if (!value.trim()) return stopTyping();
    api.post(`/bookings/${bookingId}/messages`, { typing: true }).catch(() => {});
    typingTimer.current = window.setTimeout(stopTyping, 1200);
  };

  const send = async event => {
    event.preventDefault();
    if (!text.trim() || sending || disabled) return;
    const messageText = text;
    setSending(true);
    setError('');
    stopTyping();
    try {
      const response = await api.post(`/bookings/${bookingId}/messages`, { message: messageText });
      setMessages(current => current.some(item => item.id === response.data.id) ? current : [...current, response.data]);
      setText('');
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-[28rem] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
          {booking?.counterparty?.profile_picture ? <img src={booking.counterparty.profile_picture} alt="" className="h-full w-full object-cover" /> : (booking?.counterparty?.name || 'P').split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0"><h2 className="truncate font-bold dark:text-white">{booking?.counterparty?.name || 'Service participant'}</h2><p className="text-xs text-gray-500">{booking?.services?.[0]?.type?.replace(/_/g, ' ') || 'Assistance'} · {booking?.status?.replace(/_/g, ' ')}</p></div>
      </div>
      <div ref={listRef} onScroll={() => { if (nearBottom()) setNewCount(0); }} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-900/30">
        {loading && <p className="py-10 text-center text-sm text-gray-500">Loading conversation…</p>}
        {!loading && !messages.length && <div className="py-12 text-center text-gray-500"><div className="text-4xl">💬</div><p className="mt-3 font-semibold">Start a conversation</p><p className="mt-1 text-sm">Coordinate meeting points, directions, or service details.</p></div>}
        {messages.map(item => {
          const mine = String(item.sender_id) === String(user?.id);
          return <div key={item.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[82%] rounded-2xl px-4 py-2.5 shadow-sm ${mine ? 'rounded-br-md bg-blue-600 text-white' : 'rounded-bl-md bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-100'}`}><p className="whitespace-pre-wrap break-words text-sm">{item.message}</p><p className={`mt-1 text-right text-[10px] ${mine ? 'text-blue-100' : 'text-gray-400'}`}>{new Date(item.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p></div></div>;
        })}
        {typingName && <p className="text-xs italic text-blue-600">{typingName} is typing…</p>}
        <div ref={endRef} />
      </div>
      {newCount > 0 && <button type="button" onClick={() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); setNewCount(0); }} className="mx-auto -mt-9 z-10 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow">↓ {newCount} new message{newCount === 1 ? '' : 's'}</button>}
      {disabled ? <div className="border-t border-gray-200 p-4 text-center text-sm text-gray-500 dark:border-gray-700">This conversation is closed. Previous messages remain available.</div> : <form onSubmit={send} className="flex gap-2 border-t border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"><textarea value={text} onChange={onChange} onBlur={stopTyping} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form.requestSubmit(); } }} rows={1} maxLength={500} placeholder="Type a message…" className="input-field min-h-11 flex-1 resize-none" /><button type="submit" disabled={sending || !text.trim()} className="btn-primary self-end px-4 disabled:opacity-50">{sending ? '…' : '➤'}</button></form>}
      {error && <p className="px-4 pb-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
