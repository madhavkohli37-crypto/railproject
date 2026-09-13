import { nextId } from './db';

export const MIN_SCORE = 0;
export const MAX_SCORE = 1000;
export const SAFE_SCORE_THRESHOLD = 200;
export const DEFAULT_SCORE = 400;
export const SCORE_BANDS = [
  { min: 0, max: 199, key: 'LOW', label: 'Low', safe: false, color: 'red' },
  { min: 200, max: 499, key: 'SAFE', label: 'Safe', safe: true, color: 'yellow' },
  { min: 500, max: 749, key: 'GOOD', label: 'Good', safe: true, color: 'green' },
  { min: 750, max: 1000, key: 'EXCELLENT', label: 'Excellent', safe: true, color: 'deep-green' }
];

export function clampScore(score) {
  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, Number(score) || 0));
}

export function getScoreBand(score) {
  const value = clampScore(score);
  return SCORE_BANDS.find(band => value >= band.min && value <= band.max);
}

// Coins are deliberately separate from score: score is reputation, coins are spendable value.
export function coinsForScoreChange(delta) {
  return delta > 0 ? Math.max(0, Math.floor(delta)) : 0;
}

export async function addScoreTransaction(db, userId, { delta, reason, referenceId = null, idempotencyKey = null, coins = coinsForScoreChange(delta), metadata = {} }) {
  const key = idempotencyKey || `${reason}:${referenceId || Date.now()}:${userId}`;
  const existing = await db.collection('score_transactions').findOne({ idempotency_key: key });
  if (existing) {
    const user = await db.collection('users').findOne({ id: Number(userId) }, { projection: { good_human_score: 1, reward_coins: 1 } });
    return { transaction: existing, user, duplicate: true };
  }
  const transaction = { id: await nextId('scoreTransactions', db), user_id: Number(userId), delta: Number(delta) || 0, coins: Number(coins) || 0, reason, reference_id: referenceId, idempotency_key: key, metadata, status: 'PENDING', created_at: new Date().toISOString() };
  try { await db.collection('score_transactions').insertOne(transaction); } catch (error) {
    if (error?.code === 11000) {
      const existingTransaction = await db.collection('score_transactions').findOne({ idempotency_key: key });
      const user = await db.collection('users').findOne({ id: Number(userId) }, { projection: { good_human_score: 1, reward_coins: 1 } });
      return { transaction: existingTransaction, user, duplicate: true };
    }
    throw error;
  }
  const user = await db.collection('users').findOneAndUpdate(
    { id: Number(userId) },
    [{ $set: { good_human_score: { $max: [MIN_SCORE, { $min: [MAX_SCORE, { $add: [{ $ifNull: ['$good_human_score', DEFAULT_SCORE] }, Number(delta) || 0] }] }] }, reward_coins: { $max: [0, { $add: [{ $ifNull: ['$reward_coins', 0] }, Number(coins) || 0] }] } } }],
    { returnDocument: 'after' }
  );
  if (!user) {
    await db.collection('score_transactions').deleteOne({ idempotency_key: key, status: 'PENDING' });
    throw new Error('User not found');
  }
  await db.collection('score_transactions').updateOne({ idempotency_key: key }, { $set: { status: 'COMPLETED' } });
  transaction.status = 'COMPLETED';
  return { transaction, user };
}
