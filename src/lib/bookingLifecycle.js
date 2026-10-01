export const BOOKING_SERVICES = ['PORTER', 'WHEELCHAIR', 'MEET_AND_GREET'];

export const CANCELLATION_REASONS = [
  { code: 'CHANGED_PLANS', label: 'My plans changed' },
  { code: 'WAIT_TOO_LONG', label: 'Provider wait time is too long' },
  { code: 'WRONG_DETAILS', label: 'Booking details are incorrect' },
  { code: 'FOUND_ALTERNATIVE', label: 'I found another option' },
  { code: 'SAFETY_CONCERN', label: 'Safety concern' },
  { code: 'OTHER', label: 'Other' },
];

export function parseCancellation(body = {}) {
  const reasonCode = typeof body.reason_code === 'string' ? body.reason_code.trim().toUpperCase() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const legacyReason = typeof body.reason === 'string' ? body.reason.trim() : '';
  const known = CANCELLATION_REASONS.some(item => item.code === reasonCode);
  if (!known) return { error: 'Select a valid cancellation reason.' };
  if (reasonCode === 'OTHER' && description.length < 3) {
    return { error: 'Please describe the reason for selecting Other.' };
  }
  if (description.length > 500) return { error: 'Cancellation description must be 500 characters or fewer.' };
  return { reasonCode, description: description || legacyReason || CANCELLATION_REASONS.find(item => item.code === reasonCode).label };
}

export function stripSecrets(booking) {
  if (!booking) return booking;
  const { otp_hash, otp_code, ...safe } = booking;
  return safe;
}

export function activeBookingStatus(status) {
  return !['CANCELLED', 'COMPLETED'].includes(status);
}
