import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';

const SPECIALIZATIONS = [
  'criminal', 'civil', 'corporate', 'family', 'property',
  'constitutional', 'tax', 'labour', 'intellectual_property', 'consumer', 'other',
];

const SPECIALIZATION_LABELS = {
  criminal: 'Criminal Law',
  civil: 'Civil Law',
  corporate: 'Corporate Law',
  family: 'Family Law',
  property: 'Property Law',
  constitutional: 'Constitutional Law',
  tax: 'Tax Law',
  labour: 'Labour & Employment',
  intellectual_property: 'Intellectual Property',
  consumer: 'Consumer Protection',
  other: 'Other',
};

export default function AdvisorRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirm: '',
    specialization: '',
    experience_years: '',
    bar_council_id: '',
    bio: '',
    consultation_fee: '',
    languages: '',
  });
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }

    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setBusy(true);
    try {
      const payload = {
        email: form.email,
        username: form.username,
        password: form.password,
        specialization: form.specialization,
        experience_years: parseInt(form.experience_years),
        bar_council_id: form.bar_council_id,
        bio: form.bio,
        consultation_fee: parseFloat(form.consultation_fee) || 0,
        languages: form.languages,
      };

      await api.post('/advisors/register/', payload);
      toast.success('Registration submitted! Awaiting verification.');
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      const msg = data ? Object.values(data).flat().join(' ') : 'Registration failed';
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white p-8 shadow-xl shadow-gray-200/50 dark:bg-gray-900 dark:shadow-gray-900/80 md:p-12"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl shadow-lg mb-4">
              👨‍⚖️
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">
              Join as a Legal Advisor
            </h1>
            <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
              Create your advisor profile and start consulting clients on Legal Saathi
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Details */}
            <div className="rounded-2xl bg-gray-50 p-6 dark:bg-gray-800/50">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 font-display">
                📧 Account Details
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email" name="email" required
                    value={form.email} onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Username *
                  </label>
                  <input
                    type="text" name="username" required
                    value={form.username} onChange={handleChange}
                    placeholder="johndoe"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Password *
                  </label>
                  <input
                    type="password" name="password" required
                    value={form.password} onChange={handleChange}
                    placeholder="Min. 8 characters"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Confirm Password *
                  </label>
                  <input
                    type="password" name="confirm" required
                    value={form.confirm} onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div className="rounded-2xl bg-gray-50 p-6 dark:bg-gray-800/50">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 font-display">
                ⚖️ Professional Details
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Specialization *
                  </label>
                  <select
                    name="specialization" required
                    value={form.specialization} onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  >
                    <option value="">Select specialization...</option>
                    {SPECIALIZATIONS.map((s) => (
                      <option key={s} value={s}>{SPECIALIZATION_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Experience (Years) *
                  </label>
                  <input
                    type="number" name="experience_years" required min="0"
                    value={form.experience_years} onChange={handleChange}
                    placeholder="e.g. 5"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Bar Council ID
                  </label>
                  <input
                    type="text" name="bar_council_id"
                    value={form.bar_council_id} onChange={handleChange}
                    placeholder="e.g. BC/1234/2020"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Consultation Fee (₹)
                  </label>
                  <input
                    type="number" name="consultation_fee" min="0"
                    value={form.consultation_fee} onChange={handleChange}
                    placeholder="e.g. 500"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Languages
                  </label>
                  <input
                    type="text" name="languages"
                    value={form.languages} onChange={handleChange}
                    placeholder="Hindi, English, Marathi, Gujarati..."
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Bio
                  </label>
                  <textarea
                    name="bio" rows={4}
                    value={form.bio} onChange={handleChange}
                    placeholder="Tell clients about your experience, expertise, and approach to legal consultation..."
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-base font-semibold text-white hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 transition-all"
            >
              {busy ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting...
                </span>
              ) : (
                'Register as Legal Advisor'
              )}
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-amber-600 hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}