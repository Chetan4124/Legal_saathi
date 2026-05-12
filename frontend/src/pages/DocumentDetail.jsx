import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import api from '../api/axios';
import { getDocumentSummary } from '../api/chats';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

function Skeleton({ className }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800 ${className}`} />;
}

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('text');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/documents/${id}/`);
        setDoc(data);
        if (data?.status === 'completed' && data?.extracted_text) {
          fetchSummary();
        }
      } catch {
        toast.error('Document not found');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const fetchSummary = async () => {
    setSummaryLoading(true);
    try {
      const { data } = await getDocumentSummary(id);
      setSummary(data.summary);
    } catch (err) {
      console.error('Summary fetch error:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleRetryOCR = async () => {
    setRetrying(true);
    try {
      await api.post(`/ocr/retry/${id}/`);
      setDoc((prev) => ({ ...prev, status: 'processing' }));
      toast.success('OCR retry initiated');
    } catch {
      toast.error('OCR retry failed');
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-96" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Skeleton className="h-96" />
            </div>
            <Skeleton className="h-64" />
          </div>
        </div>
      </AppLayout>
    );
  }

  const charCount = doc.extracted_text?.length || 0;
  const wordCount = doc.extracted_text?.split(/\s+/).filter(Boolean).length || 0;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Breadcrumb + Title */}
        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition group"
          >
            <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Documents
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-gray-900 dark:text-white font-display"
              >
                {doc.title}
              </motion.h1>
              <p className="mt-1 text-sm text-gray-400">
                Uploaded {new Date(doc.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Status Pill */}
              <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                doc.status === 'completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' :
                doc.status === 'processing' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                doc.status === 'failed' ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400' :
                'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                <span className={`h-2 w-2 rounded-full ${
                  doc.status === 'completed' ? 'bg-emerald-500' :
                  doc.status === 'processing' ? 'bg-blue-500 animate-pulse' :
                  doc.status === 'failed' ? 'bg-rose-500' : 'bg-gray-400'
                }`} />
                {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
              </span>

              {doc.status === 'failed' && (
                <button onClick={handleRetryOCR} disabled={retrying}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition">
                  {retrying ? 'Retrying...' : 'Retry OCR'}
                </button>
              )}
              {doc.status === 'completed' && (
                <Link to={`/chat/${doc.id}`}
                  className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 transition">
                  💬 Chat with AI
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs */}
            <div className="flex gap-1 rounded-2xl bg-gray-100 dark:bg-gray-800 p-1">
              {['text', 'stats'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {tab === 'text' ? '📄 Extracted Text' : '📊 Statistics'}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'text' ? (
                <motion.div
                  key="text"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
                >
                  {doc.extracted_text ? (
                    <div className="p-8">
                      <pre className="whitespace-pre-wrap text-sm leading-7 text-gray-600 dark:text-gray-300 font-sans max-h-[600px] overflow-y-auto">
                        {doc.extracted_text}
                      </pre>
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <span className="text-4xl">📭</span>
                      <p className="mt-3 text-gray-400">
                        {doc.status === 'processing' ? 'AI is reading your document...' : 'No text extracted yet.'}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-2 gap-4"
                >
                  {[
                    { label: 'Characters', value: charCount.toLocaleString(), icon: '🔤' },
                    { label: 'Words', value: wordCount.toLocaleString(), icon: '📝' },
                    { label: 'Lines', value: (doc.extracted_text?.split('\n').length || 0).toLocaleString(), icon: '📏' },
                    { label: 'File Type', value: doc.file_type?.toUpperCase() || 'N/A', icon: '📎' },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6">
                      <span className="text-2xl">{stat.icon}</span>
                      <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white font-display">{stat.value}</p>
                      <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar — AI Summary */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
            >
              {/* Summary Header */}
              <div className="bg-gradient-to-r from-brand-500 to-violet-500 px-6 py-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white font-display">🤖 AI Summary</h2>
                  {summary && (
                    <button onClick={fetchSummary} className="text-xs text-white/80 hover:text-white transition">
                      Regenerate
                    </button>
                  )}
                </div>
              </div>

              {/* Summary Content */}
              <div className="p-6">
                {doc.status !== 'completed' ? (
                  <div className="text-center py-8">
                    <span className="text-3xl">🔒</span>
                    <p className="mt-2 text-sm text-gray-400">Summary available after OCR completes.</p>
                  </div>
                ) : summaryLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-4" style={{ width: `${85 - i * 10}%` }} />
                    ))}
                    <p className="text-xs text-gray-400 mt-3">Generating insights...</p>
                  </div>
                ) : summary ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert max-h-[500px] overflow-y-auto">
                    <div className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                      {summary}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={fetchSummary}
                    className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-violet-500 px-5 py-3.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-brand-500/25 transition-all"
                  >
                    ✨ Generate Summary
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}