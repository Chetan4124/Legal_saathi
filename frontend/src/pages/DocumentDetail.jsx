import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import api from '../api/axios';
import { getDocumentSummary } from '../api/chats';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/documents/${id}/`);
        setDoc(data);
        // Auto-fetch summary if document is completed
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
  }, [id, navigate]);

  const fetchSummary = async () => {
    setSummaryLoading(true);
    setSummaryError(false);
    try {
      const { data } = await getDocumentSummary(id);
      setSummary(data.summary);
    } catch (err) {
      console.error('Summary fetch error:', err);
      setSummaryError(true);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleRetryOCR = async () => {
    setRetrying(true);
    try {
      const { data } = await api.post(`/ocr/retry/${id}/`);
      setDoc((prev) => ({ ...prev, status: data.status, extracted_text: data.extracted_text }));
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
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          ← Back to Documents
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{doc.title}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Uploaded {new Date(doc.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          {doc.status === 'failed' && (
            <button
              onClick={handleRetryOCR}
              disabled={retrying}
              className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50 transition"
            >
              {retrying ? 'Retrying...' : 'Retry OCR'}
            </button>
          )}
          {doc.status === 'completed' && (
            <Link
              to={`/chat/${doc.id}`}
              className="rounded-xl bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
            >
              💬 Chat with AI
            </Link>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
          doc.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
          doc.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
          doc.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
          'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {doc.status === 'completed' ? '✅' : doc.status === 'processing' ? '⚙️' : doc.status === 'failed' ? '❌' : '⏳'}
          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Extracted Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900"
          >
            <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">📄 Extracted Text</h2>
            {doc.extracted_text ? (
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600 dark:text-gray-300 max-h-96 overflow-y-auto">
                {doc.extracted_text}
              </pre>
            ) : (
              <p className="text-sm italic text-gray-400 dark:text-gray-500">
                {doc.status === 'processing' ? 'OCR is still processing...' : 'No text extracted yet.'}
              </p>
            )}
          </motion.div>
        </div>

        {/* Sidebar — AI Summary */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">🤖 AI Summary</h2>
              {summary && (
                <button
                  onClick={fetchSummary}
                  className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  Refresh
                </button>
              )}
            </div>

            {doc.status !== 'completed' ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Summary will be available once OCR is complete.
              </p>
            ) : summaryLoading ? (
              <div className="space-y-3">
                <div className="animate-pulse space-y-2">
                  <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                <p className="text-xs text-gray-400">Generating summary...</p>
              </div>
            ) : summaryError ? (
              <div className="text-center py-4">
                <p className="text-sm text-red-500 mb-2">Failed to generate summary</p>
                <button
                  onClick={fetchSummary}
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  Try again
                </button>
              </div>
            ) : summary ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600 dark:text-gray-300 max-h-[500px] overflow-y-auto">
                  {summary}
                </div>
              </div>
            ) : (
              <button
                onClick={fetchSummary}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                Generate Summary
              </button>
            )}
          </motion.div>

          {/* Quick Stats */}
          {doc.extracted_text && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900"
            >
              <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">📊 Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Characters</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">
                    {doc.extracted_text.length.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Words</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">
                    {doc.extracted_text.split(/\s+/).filter(Boolean).length.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Lines</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">
                    {doc.extracted_text.split('\n').filter(Boolean).length.toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}