import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AppLayout from '../components/AppLayout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

// Stats Card Component
function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900"
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description, to }) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
      onClick={() => to && navigate(to)}
      className={`rounded-2xl bg-white p-6 shadow-sm transition dark:bg-gray-900 ${
        to ? 'cursor-pointer hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-800' : ''
      }`}
    >
      <span className="text-3xl">{icon}</span>
      <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{description}</p>
      {to && (
        <span className="mt-3 inline-block text-sm font-medium text-blue-600 dark:text-blue-400">
          Try it →
        </span>
      )}
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const fetchDocs = useCallback(async () => {
    try {
      const { data } = await api.get('/documents/');
      setDocs(data);
    } catch (err) {
      console.error('Fetch docs error:', err);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const uploadFile = async (file) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, PNG, and JPEG files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    setUploading(true);
    try {
      await api.post('/documents/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document uploaded! OCR processing started...');
      await fetchDocs();
    } catch (err) {
      console.error('Upload error:', err.response?.data);
      toast.error(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleRetryOCR = async (e, docId) => {
    e.stopPropagation();
    try {
      await api.post(`/ocr/retry/${docId}/`);
      toast.success('OCR retry started');
      fetchDocs();
    } catch {
      toast.error('Retry failed');
    }
  };

  // Compute stats
  const totalDocs = docs.length;
  const completedDocs = docs.filter((d) => d.status === 'completed').length;
  const processingDocs = docs.filter((d) => d.status === 'processing').length;
  const failedDocs = docs.filter((d) => d.status === 'failed').length;

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    const icons = {
      pending: '⏳',
      processing: '⚙️',
      completed: '✅',
      failed: '❌',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}>
        {icons[status] || '📄'} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getFileIcon = (title) => {
    const ext = title?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📕';
    if (['png', 'jpg', 'jpeg'].includes(ext)) return '🖼️';
    return '📄';
  };

  // Featured documents (last 3 completed)
  const featuredDocs = docs.filter((d) => d.status === 'completed').slice(0, 3);

  return (
    <AppLayout>
      {/* ── Welcome Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Welcome back, {user?.username || 'User'} 👋
        </h1>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Here's what's happening with your legal documents today.
        </p>
      </motion.div>

      {/* ── Stats Row ── */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="📄" label="Total Documents" value={totalDocs} color="blue" />
        <StatCard icon="✅" label="Completed" value={completedDocs} color="green" />
        <StatCard icon="⚙️" label="Processing" value={processingDocs} color="orange" />
        <StatCard icon="❌" label="Failed" value={failedDocs} color="purple" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── Main Content (2/3) ── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upload Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
              dragging
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10 scale-[1.01]'
                : 'border-gray-300 bg-white hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900'
            }`}
          >
            <span className="text-5xl">📁</span>
            <h3 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">
              Drop your legal document here
            </h3>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
              Supports PDF, PNG, and JPEG up to 10MB
            </p>
            <label
              className={`mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold text-white transition ${
                uploading
                  ? 'cursor-not-allowed bg-blue-400'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              {uploading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Choose File
                </>
              )}
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </motion.div>

          {/* Document List */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Recent Documents</h2>
              {docs.length > 0 && (
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  {totalDocs} document{totalDocs !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl bg-white p-5 shadow-sm dark:bg-gray-900"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-3">
                        <div className="h-5 w-56 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-4 w-28 rounded bg-gray-100 dark:bg-gray-800" />
                      </div>
                      <div className="h-7 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </div>
                ))}
              </div>
            ) : docs.length === 0 ? (
              <div className="rounded-2xl bg-white py-16 text-center shadow-sm dark:bg-gray-900">
                <span className="text-6xl">📭</span>
                <h3 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">
                  No documents yet
                </h3>
                <p className="mt-1 text-base text-gray-400 dark:text-gray-500">
                  Upload your first legal document to get started with AI analysis
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {docs.slice(0, 10).map((doc) => (
                  <motion.div
                    key={doc.id}
                    whileHover={{ x: 4 }}
                    onClick={() => navigate(`/documents/${doc.id}`)}
                    className="group flex cursor-pointer items-center justify-between rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md hover:ring-1 hover:ring-blue-200 dark:bg-gray-900 dark:hover:ring-blue-800"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{getFileIcon(doc.title)}</span>
                      <div>
                        <h3 className="text-base font-semibold text-gray-800 group-hover:text-blue-600 dark:text-gray-200 dark:group-hover:text-blue-400 transition">
                          {doc.title}
                        </h3>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                          {formatDate(doc.uploaded_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {doc.status === 'failed' && (
                        <button
                          onClick={(e) => handleRetryOCR(e, doc.id)}
                          className="rounded-lg bg-orange-100 px-3 py-1.5 text-sm font-medium text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 transition"
                        >
                          Retry
                        </button>
                      )}
                      {getStatusBadge(doc.status)}
                      {doc.status === 'completed' && (
                        <Link
                          to={`/chat/${doc.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 transition"
                        >
                          Chat
                        </Link>
                      )}
                      <svg
                        className="h-5 w-5 text-gray-300 group-hover:text-gray-500 dark:text-gray-600 transition"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar Content (1/3) ── */}
        <div className="space-y-6">
          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">⚡ Features</h2>
            <div className="space-y-3">
              <FeatureCard
                icon="🔍"
                title="Smart OCR"
                description="Extract text from PDFs and images automatically with our AI-powered OCR engine."
              />
              <FeatureCard
                icon="🤖"
                title="AI Legal Advisor"
                description="Chat with an AI that understands legal context and cites specific clauses from your documents."
                to={featuredDocs[0] ? `/chat/${featuredDocs[0].id}` : null}
              />
              <FeatureCard
                icon="📊"
                title="Document Summary"
                description="Get instant AI-generated summaries with key clauses, parties, dates, and obligations."
                to={featuredDocs[0] ? `/documents/${featuredDocs[0].id}` : null}
              />
            </div>
          </motion.div>

          {/* Recent Completed Docs */}
          {featuredDocs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900"
            >
              <h2 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">
                🏆 Ready to Chat
              </h2>
              <div className="space-y-3">
                {featuredDocs.map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/chat/${doc.id}`}
                    className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <span className="text-xl">{getFileIcon(doc.title)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate dark:text-gray-300">
                        {doc.title}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(doc.uploaded_at)}</p>
                    </div>
                    <span className="text-green-500 text-sm">💬</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick Tip */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-6 text-white shadow-lg"
          >
            <span className="text-2xl">💡</span>
            <h3 className="mt-3 text-lg font-bold">Pro Tip</h3>
            <p className="mt-2 text-sm text-blue-100 leading-relaxed">
              Upload a PDF contract and ask the AI: "What are my obligations under this agreement?" 
              It will cite the exact clauses!
            </p>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}