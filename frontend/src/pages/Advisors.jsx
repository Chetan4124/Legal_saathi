import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import api from '../api/axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

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

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Advisors() {
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialization, setSpecialization] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAdvisors();
  }, [specialization, search]);

  const fetchAdvisors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (specialization) params.specialization = specialization;
      if (search) params.search = search;
      const { data } = await api.get('/advisors/', { params });
      setAdvisors(data);
    } catch (err) {
      console.error('Failed to fetch advisors:', err);
      toast.error('Failed to load advisors');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-10"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300/10 rounded-full blur-3xl" />
          
          <div className="relative">
            <span className="text-sm font-semibold uppercase tracking-widest text-amber-100">
              Expert Legal Guidance
            </span>
            <h1 className="mt-3 text-4xl font-bold text-white font-display">
              Consult Legal Experts
            </h1>
            <p className="mt-3 text-lg text-amber-50/80 max-w-2xl">
              Connect with verified legal advisors for personalized consultations on your documents and legal matters.
            </p>
          </div>
        </motion.div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search advisors by name or language..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-4 py-3.5 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            />
          </div>
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Specializations</option>
            {Object.entries(SPECIALIZATION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Advisors Grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : advisors.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl">👨‍⚖️</span>
            <h3 className="mt-4 text-xl font-bold text-gray-700 dark:text-gray-200">No advisors found</h3>
            <p className="mt-2 text-gray-400">Try adjusting your search or filters.</p>
            <Link
              to="/advisor/register"
              className="mt-6 inline-block rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition"
            >
              Become an Advisor
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {advisors.map((advisor, i) => (
              <motion.div
                key={advisor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-lg font-bold shadow-lg">
                    {advisor.user?.username?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      Adv. {advisor.user?.username || 'Unknown'}
                    </h3>
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                      {SPECIALIZATION_LABELS[advisor.specialization] || advisor.specialization}
                    </p>
                  </div>
                </div>

                {advisor.bio && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">
                    {advisor.bio}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div>
                    <StarRating rating={advisor.rating_avg} />
                    <p className="text-xs text-gray-400 mt-1">
                      {advisor.total_reviews} review{advisor.total_reviews !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{advisor.experience_years} yrs exp</p>
                    {advisor.languages && (
                      <p className="text-xs text-gray-400 mt-0.5">{advisor.languages}</p>
                    )}
                  </div>
                </div>

                {advisor.consultation_fee > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ₹{advisor.consultation_fee}
                      <span className="text-sm font-normal text-gray-400"> /consultation</span>
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA for Advisors */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 p-10 text-center"
        >
          <h2 className="text-2xl font-bold text-white font-display">Are You a Legal Professional?</h2>
          <p className="mt-2 text-gray-400 max-w-lg mx-auto">
            Join Legal Saathi as an advisor and connect with clients seeking legal consultation.
          </p>
          <Link
            to="/advisor/register"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition"
          >
            Register as Advisor
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </AppLayout>
  );
}