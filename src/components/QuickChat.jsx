'use client';

import Link from 'next/link';

export default function QuickChat({ bookingId, disabled = false, label = 'Open chat' }) {
  if (!bookingId) return null;
  return <Link href={`/active-booking/${bookingId}/chat`} className={`btn-primary inline-flex items-center gap-2 px-4 py-2 ${disabled ? 'bg-gray-500 hover:bg-gray-600' : ''}`}>💬 {disabled ? 'View chat history' : label}</Link>;
}
