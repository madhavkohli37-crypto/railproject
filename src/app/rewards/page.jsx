'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axiosInstance';
import RewardCoinIcon from '@/components/RewardCoinIcon';

const bandStyles = {
  LOW: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  SAFE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  GOOD: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  EXCELLENT: 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200',
};

export default function RewardsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [state, setState] = useState(null);
  const [catalog, setCatalog] = useState({ coupons: [], plans: [] });
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [redeeming, setRedeeming] = useState('');

  const load = async () => {
    try {
      const [stateRes, catalogRes, historyRes] = await Promise.all([
        api.get('/rewards/state'), api.get('/rewards/catalog'), api.get('/rewards/history'),
      ]);
      setState(stateRes.data);
      setCatalog(catalogRes.data);
      setHistory([...(historyRes.data.redemptions || []), ...(historyRes.data.score_transactions || [])]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) { setError(err.response?.data?.error || 'Unable to load rewards.'); }
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'PASSENGER')) router.push('/login');
    if (user?.role === 'PASSENGER') load();
  }, [authLoading, user, router]);

  const redeem = async (item, type) => {
    setRedeeming(item.id); setError('');
    try {
      await api.post('/rewards/redeem', { item_id: item.id, type, idempotency_key: `${item.id}-${Date.now()}` });
      await load();
    } catch (err) { setError(err.response?.data?.error || 'Redemption failed.'); }
    finally { setRedeeming(''); }
  };

  if (authLoading || !user || user.role !== 'PASSENGER') return null;
  const score = state?.score ?? user.good_human_score ?? 400;
  const band = state?.band || { key: 'SAFE', label: 'Safe' };

  return <div className="page-wrapper animate-fade-in space-y-8">
    <div className="flex flex-wrap justify-between items-end gap-4">
      <div><h1 className="section-title mb-1">🎁 Rewards &amp; Good Human Score</h1><p className="section-subtitle">Your reputation score and spendable RailCoins are separate balances.</p></div>
      <div className="text-right"><div className="flex items-center justify-end gap-2 text-3xl font-extrabold text-orange-500"><RewardCoinIcon className="h-8 w-8" />{state?.coins ?? 0}</div><div className="text-xs text-gray-500">RailCoins to spend</div></div>
    </div>
    {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">{error}</div>}
    <section className="card">
      <div className="flex justify-between gap-4 items-start"><div><p className="text-sm text-gray-500">Good Human Score</p><div className="flex items-baseline gap-3"><span className="text-4xl font-extrabold dark:text-white">{score}<span className="text-lg text-gray-400">/1000</span></span><span className={`px-3 py-1 rounded-full text-sm font-bold ${bandStyles[band.key] || bandStyles.SAFE}`}>{band.label}</span></div></div><span className="text-4xl">🌱</span></div>
      <div className="mt-5 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-700 rounded-full" style={{ width: `${Math.max(1, score / 10)}%` }} /></div>
      <p className="text-xs text-gray-500 mt-2">Safe threshold: {state?.safe_threshold ?? 200}. Low 0–199 · Safe 200–499 · Good 500–749 · Excellent 750–1000.</p>
      {state?.plan && <p className="mt-3 text-sm font-semibold text-blue-700 dark:text-blue-300">✨ Premium plan active: {state.plan}</p>}
    </section>
    <section className="card">
      <h2 className="text-xl font-bold dark:text-white">How to earn RailCoins</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">RailCoins are awarded only after an activity is verified. They are separate from your Good Human Score.</p>
      <div className="grid md:grid-cols-2 gap-3 mt-4">
        <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-4">
          <p className="font-bold text-green-800 dark:text-green-300">Genuine report upheld</p>
          <p className="text-sm text-green-700 dark:text-green-400 mt-1">Earn <strong>+5 Good Human Score</strong> and <strong>+5 RailCoins</strong> when a manager confirms your report.</p>
        </div>
        <div className="rounded-xl bg-gray-50 dark:bg-gray-700/50 p-4">
          <p className="font-bold dark:text-white">More verified activities coming</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Future administrator-approved activities can award coins. Unverified, duplicate, or spam reports do not earn coins.</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-3">False or spam reports may reduce your Good Human Score. Repeated submissions cannot be used to farm rewards.</p>
    </section>
    <section><h2 className="text-xl font-bold dark:text-white mb-4">Redeem rewards</h2><div className="grid md:grid-cols-2 gap-5">
      {[...(catalog.coupons || []).map(item => ({ ...item, redemptionType: 'COUPON' })), ...(catalog.plans || []).map(item => ({ ...item, redemptionType: 'PLAN' }))].map(item =>
        <div className="card" key={`${item.redemptionType}-${item.id}`}><div className="flex justify-between gap-3"><h3 className="font-bold dark:text-white">{item.title}</h3>{item.redemptionType === 'PLAN' ? <span className="font-bold text-blue-600">₹{item.money_price}</span> : <span className="flex items-center gap-1 font-bold text-orange-500"><RewardCoinIcon className="h-5 w-5" />{item.cost_coins}</span>}</div><p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{item.description}</p>{item.duration_days && <p className="text-xs mt-2 text-gray-500">Duration: {item.duration_days} day{item.duration_days === 1 ? '' : 's'}</p>}{item.minimum_score > 0 && <p className="text-xs mt-2 text-blue-600 dark:text-blue-300">Requires score {item.minimum_score}+</p>}{item.redemptionType === 'PLAN' ? <Link href="/#premium" className="btn-outline mt-4 w-full text-center">View more</Link> : <button disabled={redeeming === item.id || (state?.coins || 0) < item.cost_coins} onClick={() => redeem(item, item.redemptionType)} className="btn-primary mt-4 w-full">{redeeming === item.id ? 'Redeeming...' : (state?.coins || 0) < item.cost_coins ? 'Not enough RailCoins' : 'Redeem voucher'}</button>}</div>
      )}
    </div></section>
    <section><h2 className="text-xl font-bold dark:text-white mb-4">Reward activity</h2>{history.length === 0 ? <div className="card text-sm text-gray-500">No reward activity yet. Genuine, upheld reports can earn score and RailCoins.</div> : <div className="card divide-y dark:divide-gray-700">{history.map((item, index) => <div key={`${item.id}-${index}`} className="py-3 flex justify-between gap-3 text-sm"><div><span className="font-semibold dark:text-white">{item.title || item.reason || 'Score update'}</span><p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString('en-IN')}</p></div><span className={item.delta > 0 || item.coins > 0 ? 'text-green-600 font-bold' : 'text-gray-600'}>{item.delta ? `${item.delta > 0 ? '+' : ''}${item.delta} score${item.coins ? ` · +${item.coins} RailCoins` : ''}` : <span className="inline-flex items-center gap-1">- {item.cost_coins} <RewardCoinIcon className="h-4 w-4" /></span>}</span></div>)}</div>}</section>
  </div>;
}
