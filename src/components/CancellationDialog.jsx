'use client';

import { useEffect, useState } from 'react';

const PASSENGER_REASONS = [
  'No longer required',
  'Taking too long',
  'Unable to reach the other person',
  'Incorrect booking details',
  'Emergency',
  'Other',
];

const EMPLOYEE_REASONS = [
  'Unable to reach the passenger',
  'Passenger is not at the agreed meeting point',
  'Passenger provided incorrect location details',
  'Service area is inaccessible or unsafe',
  'Another urgent operational issue',
  'Personal emergency',
  'Other',
];

export default function CancellationDialog({ open, onClose, onConfirm, loading = false, actorRole = 'PASSENGER' }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const reasons = actorRole === 'PROVIDER' ? EMPLOYEE_REASONS : PASSENGER_REASONS;

  useEffect(() => {
    if (open) {
      setReason('');
      setDescription('');
    }
  }, [open]);

  if (!open) return null;
  const valid = Boolean(reason && (reason !== 'Other' || description.trim()));

  const confirm = async event => {
    event.preventDefault();
    if (!valid || loading) return;
    await onConfirm({ reason, description: description.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="cancel-request-title">
      <form onSubmit={confirm} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
        <h2 id="cancel-request-title" className="text-xl font-bold text-gray-900 dark:text-white">Cancel Booking?</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Select a reason before cancelling. It will be shown to the other participant.</p>
        <fieldset className="mt-5 space-y-3">
          <legend className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Why are you cancelling? <span className="text-red-500">*</span></legend>
          {reasons.map(option => (
            <label key={option} className="flex cursor-pointer items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
              <input type="radio" name="cancellation-reason" value={option} checked={reason === option} onChange={event => setReason(event.target.value)} />
              {option}
            </label>
          ))}
        </fieldset>
        <label className="mt-5 block text-sm font-semibold text-gray-700 dark:text-gray-200">
          {reason === 'Other' ? 'Custom reason *' : 'Additional details (optional)'}
          <textarea
            value={description}
            onChange={event => setDescription(event.target.value)}
            required={reason === 'Other'}
            rows={3}
            className="input-field mt-1 w-full resize-none"
            placeholder={reason === 'Other' ? 'Enter your cancellation reason' : 'Add more context if needed'}
          />
        </label>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={loading} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-200">Keep Request</button>
          <button type="submit" disabled={!valid || loading} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? 'Cancelling…' : 'Confirm Cancellation'}
          </button>
        </div>
      </form>
    </div>
  );
}
