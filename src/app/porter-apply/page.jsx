'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axiosInstance';

const STATIONS = [
  'New Delhi', 'Mumbai CST', 'Bengaluru City', 'Chennai Central',
  'Kolkata Howrah', 'Hyderabad Deccan', 'Pune Junction', 'Ahmedabad Junction',
  'Jaipur Junction', 'Lucknow Charbagh', 'Patna Junction', 'Kochi Central',
];

const SERVICE_TYPES = [
  { value: 'PORTER', label: '🧳 Porter / Coolie', desc: 'Carry luggage for passengers' },
  { value: 'WHEELCHAIR', label: '♿ Wheelchair Assistant', desc: 'Assist differently-abled and elderly' },
  { value: 'MEET_AND_GREET', label: '🤝 Meet & Greet', desc: 'Receive and escort passengers' },
];

export default function PorterApplyPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    provider_type: 'PORTER', station: 'New Delhi',
    experience_years: '', aadhar_number: '',
    agree: false,
  });
  const [aadharImage, setAadharImage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [step, setStep] = useState(1); // 1 = form, 2 = success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Aadhaar image size must be under 5MB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setAadharImage(reader.result);
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!form.agree) {
      setError('Please agree to the terms and conditions to proceed.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/provider/apply', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        provider_type: form.provider_type,
        station: form.station,
        experience_years: form.experience_years,
        aadhar_number: form.aadhar_number,
        aadhar_image: aadharImage,
      });
      setStep(2);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (step === 2) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-16 bg-[#f0f4ff] dark:bg-[#0d1b2a]">
        <div className="max-w-lg w-full animate-slide-up">
          <div className="card text-center py-12 px-8">
            <div className="text-7xl mb-6">🎉</div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">Application Submitted!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Thank you for applying as a porter on RailAssist. Our admin team will review your application within <strong>24–48 hours</strong>.
              You will be able to log in once your account is approved.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-xl p-4 mb-8 text-sm text-left space-y-2">
              <p className="font-semibold text-[#003087] dark:text-blue-300">What happens next?</p>
              <p className="text-gray-600 dark:text-gray-400">1. Admin verifies your details and railway badge.</p>
              <p className="text-gray-600 dark:text-gray-400">2. You'll receive approval notification.</p>
              <p className="text-gray-600 dark:text-gray-400">3. Log in as &ldquo;Employee&rdquo; and start accepting jobs.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="btn-secondary px-6 py-3">→ Go to Login</Link>
              <Link href="/" className="btn-outline px-6 py-3">🏠 Back to Home</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#f0f4ff] dark:bg-[#0d1b2a] py-12 px-4">
      <div className="max-w-2xl mx-auto animate-slide-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#E85D04] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">📋</div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Join RailAssist as a Porter</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Get more bookings, digital payments, and a professional profile. Free to register.
          </p>
        </div>

        {/* Benefits bar */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {['✅ Free Registration', '💰 Digital Payments', '⭐ Build Rating'].map(b => (
            <div key={b} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
              {b}
            </div>
          ))}
        </div>

        <div className="ir-card">
          <div className="ir-card-header">📋 Porter Application Form</div>
          <div className="p-6 md:p-8">
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex gap-2">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-sm uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                    <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="As per Aadhaar" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Mobile Number <span className="text-red-400">*</span></label>
                    <input type="tel" name="phone" required value={form.phone} onChange={handleChange} placeholder="10-digit mobile" maxLength={10} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address <span className="text-red-400">*</span></label>
                    <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Aadhaar Number <span className="text-red-400">*</span></label>
                    <input type="text" name="aadhar_number" required value={form.aadhar_number} onChange={handleChange} placeholder="12-digit Aadhaar" maxLength={12} className="input-field" />
                  </div>
                </div>

                {/* Aadhaar Image Upload */}
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Upload Aadhaar Card Image / Photo <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#003087] file:text-white hover:file:bg-[#002270] cursor-pointer"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Upload clear photo/scan of Aadhaar Card (JPG, PNG, WEBP up to 5MB).</p>

                  {previewUrl && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 mb-2">📷 Aadhaar Image Preview:</p>
                      <img src={previewUrl} alt="Aadhaar Preview" className="max-h-40 rounded-lg shadow-sm object-contain border border-gray-200 dark:border-gray-600" />
                    </div>
                  )}
                </div>
              </div>


              {/* Work Info */}
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-sm uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                  Work Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Service Type <span className="text-red-400">*</span></label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {SERVICE_TYPES.map(st => (
                        <label key={st.value} className={`cursor-pointer flex flex-col p-3 border-2 rounded-xl transition-all ${form.provider_type === st.value ? 'border-[#003087] bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'}`}>
                          <input type="radio" name="provider_type" value={st.value} checked={form.provider_type === st.value} onChange={handleChange} className="sr-only" />
                          <span className="text-xl mb-1">{st.label.split(' ')[0]}</span>
                          <span className="font-semibold text-sm dark:text-white">{st.label.split(' ').slice(1).join(' ')}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{st.desc}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Home Station <span className="text-red-400">*</span></label>
                      <select name="station" required value={form.station} onChange={handleChange} className="input-field">
                        {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Years of Experience</label>
                      <input type="number" name="experience_years" value={form.experience_years} onChange={handleChange} placeholder="e.g. 5" min="0" max="50" className="input-field" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Account */}
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-sm uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                  Create Account Password
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password <span className="text-red-400">*</span></label>
                    <input type="password" name="password" required minLength={6} value={form.password} onChange={handleChange} placeholder="Min. 6 characters" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password <span className="text-red-400">*</span></label>
                    <input type="password" name="confirmPassword" required value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" className="input-field" />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <label className="flex gap-3 cursor-pointer">
                <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} className="mt-0.5 w-4 h-4 accent-[#003087] rounded shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  I confirm that I hold a valid Indian Railways porter/coolie badge. I agree to RailAssist&apos;s{' '}
                  <span className="text-[#003087] dark:text-blue-400 font-semibold underline cursor-pointer">Terms of Service</span>{' '}
                  and{' '}
                  <span className="text-[#003087] dark:text-blue-400 font-semibold underline cursor-pointer">Code of Conduct</span>.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Submitting Application...
                  </span>
                ) : '📋 Submit Application'}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="text-[#003087] dark:text-blue-400 font-semibold hover:underline">Sign In</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
