import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AppLayout from '../components/AppLayout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Premium Stat Card ───
function StatCard({ icon, label, value, trend, color, delay }) {
  const gradients = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-600',
    violet: 'from-violet-500 to-purple-600',
    rose: 'from-rose-500 to-pink-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-lg shadow-gray-200/50 dark:bg-gray-900 dark:shadow-gray-900/80 transition-all duration-300 hover:shadow-xl"
    >
      {/* Subtle top gradient line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradients[color]} bg-opacity-10 text-white shadow-lg`}>
            <span className="text-xl">{icon}</span>
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</p>
            <p className="mt-1 text-4xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
            {trend && (
              <p className="mt-1 text-xs font-medium text-emerald-500 flex items-center gap-1">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                {trend}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Quick Action Card ───
function QuickAction({ icon, label, desc, to, color, delay }) {
  const navigate = useNavigate();
  const colors = {
    blue: 'from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-100 dark:border-blue-800/30',
    emerald: 'from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border-emerald-100 dark:border-emerald-800/30',
    violet: 'from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 border-violet-100 dark:border-violet-800/30',
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => to && navigate(to)}
      className={`w-full text-left rounded-2xl bg-gradient-to-br ${colors[color]} border p-5 transition-all duration-300 hover:shadow-md`}
    >
      <div className="flex items-center gap-4">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="font-semibold text-gray-800 dark:text-white text-base">{label}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
        </div>
        <svg className="h-5 w-5 text-gray-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </motion.button>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [greeting, setGreeting] = useState('');

  const fetchDocs = useCallback(async () => {
    try {
      const { data } = await api.get('/documents/');
      setDocs(data);
    } catch (err) {
      console.error('Fetch docs error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
    // Set time-based greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
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
      toast.success('Document uploaded! AI is analyzing...');
      await fetchDocs();
    } catch (err) {
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

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => { setDragging(false); };

  const handleRetryOCR = async (e, docId) => {
    e.stopPropagation();
    try {
      await api.post(`/ocr/retry/${docId}/`);
      toast.success('OCR retry started');
      fetchDocs();
    } catch { toast.error('Retry failed'); }
  };

  // Stats
  const totalDocs = docs.length;
  const completedDocs = docs.filter((d) => d.status === 'completed').length;
  const processingDocs = docs.filter((d) => d.status === 'processing').length;
  const failedDocs = docs.filter((d) => d.status === 'failed').length;

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
      processing: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
      completed: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
      failed: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800',
    };
    const icons = { pending: '⏳', processing: '⚙️', completed: '✓', failed: '✗' };
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${styles[status]}`}>
        {icons[status]} {status}
      </span>
    );
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getFileIcon = (title) => {
    const ext = title?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📑';
    if (['png', 'jpg', 'jpeg'].includes(ext)) return '🖼️';
    return '📄';
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ─── Welcome Section ─── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-8 md:p-10"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <p className="text-blue-200/80 text-sm font-medium uppercase tracking-widest">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {greeting}, <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">{user?.username || 'Counselor'}</span>
              </h1>
              <p className="text-blue-100/70 text-lg max-w-xl">
                Your legal intelligence dashboard is ready. Upload documents, analyze contracts, and get AI-powered insights.
              </p>
            </div>
            
            {/* Upload Button in Hero */}
            <motion.label
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex cursor-pointer items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-4 text-white font-semibold transition-all hover:bg-white/30 ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Document
                </>
              )}
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
            </motion.label>
          </div>
        </motion.div>

        {/* ─── Stats Grid ─── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon="📊" label="Total Documents" value={totalDocs} trend="All time" color="blue" delay={0.1} />
          <StatCard icon="✅" label="Completed" value={completedDocs} trend={completedDocs > 0 ? `${Math.round((completedDocs/totalDocs)*100)}% success` : null} color="emerald" delay={0.2} />
          <StatCard icon="⚙️" label="Processing" value={processingDocs} color="amber" delay={0.3} />
          <StatCard icon="⚠️" label="Need Attention" value={failedDocs} color="rose" delay={0.4} />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ─── Main Content ─── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Drag & Drop Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
                dragging
                  ? 'border-blue-400 bg-blue-50/50 scale-[1.01] dark:bg-blue-900/10'
                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900'
              }`}
            >
              <motion.div
                animate={dragging ? { scale: 1.1 } : { scale: 1 }}
                className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
              >
                <span className="text-4xl">📁</span>
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                {dragging ? 'Drop it here!' : 'Drag & drop your legal document'}
              </h3>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                PDF, PNG, or JPEG • Max 10MB
              </p>
              <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200">
                Browse Files
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileSelect} disabled={uploading} className="hidden" />
              </label>
            </motion.div>

            {/* Document List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Recent Documents</h2>
                {docs.length > 0 && (
                  <span className="text-sm text-gray-400">{docs.length} document{docs.length !== 1 ? 's' : ''}</span>
                )}
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse rounded-2xl bg-white p-5 dark:bg-gray-900">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700" />
                          <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : docs.length === 0 ? (
                <div className="rounded-3xl bg-white p-12 text-center dark:bg-gray-900">
                  <span className="text-6xl">📭</span>
                  <h3 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">Your vault is empty</h3>
                  <p className="mt-1 text-gray-400">Upload a document to unlock AI-powered legal analysis.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {docs.slice(0, 8).map((doc, idx) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ x: 4, backgroundColor: 'rgba(59,130,246,0.02)' }}
                        onClick={() => navigate(`/documents/${doc.id}`)}
                        className="group flex cursor-pointer items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-900"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-2xl dark:from-gray-800 dark:to-gray-700">
                          {getFileIcon(doc.title)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate group-hover:text-blue-600 dark:text-gray-200 dark:group-hover:text-blue-400 transition">
                            {doc.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">{formatTime(doc.uploaded_at)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.status === 'failed' && (
                            <button
                              onClick={(e) => handleRetryOCR(e, doc.id)}
                              className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 transition"
                            >
                              Retry
                            </button>
                          )}
                          {getStatusBadge(doc.status)}
                          <svg className="h-5 w-5 text-gray-300 group-hover:text-gray-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* ─── Sidebar ─── */}
          <div className="space-y-5">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl bg-white p-6 shadow-lg shadow-gray-100/50 dark:bg-gray-900 dark:shadow-none"
            >
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <QuickAction
                  icon="🔍"
                  label="Smart OCR"
                  desc="Extract text from documents"
                  color="blue"
                  delay={0.4}
                />
                <QuickAction
                  icon="🤖"
                  label="AI Chat"
                  desc="Ask about your documents"
                  to={docs.find(d => d.status === 'completed') ? `/chat/${docs.find(d => d.status === 'completed').id}` : null}
                  color="violet"
                  delay={0.5}
                />
                <QuickAction
                  icon="📊"
                  label="Summaries"
                  desc="Get AI-generated insights"
                  color="emerald"
                  delay={0.6}
                />
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-3xl bg-white p-6 shadow-lg shadow-gray-100/50 dark:bg-gray-900 dark:shadow-none"
            >
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Activity Feed</h3>
              {docs.slice(0, 4).map((doc, i) => (
                <div key={doc.id} className="flex items-start gap-3 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-xs">
                    {getFileIcon(doc.title)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{doc.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {doc.status === 'completed' ? '✓ Analysis complete' : doc.status === 'processing' ? '⚙️ Processing...' : 'Uploaded'}
                      {' · '}{formatTime(doc.uploaded_at)}
                    </p>
                  </div>
                </div>
              ))}
              {docs.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No activity yet. Start by uploading a document!</p>
              )}
            </motion.div>

            {/* Pro Tip */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 p-6 text-white shadow-xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">💡</span>
                <h3 className="font-bold text-lg">Pro Tip</h3>
              </div>
              <p className="text-sm text-white/90 leading-relaxed">
                Upload a contract and ask: <span className="font-semibold text-white">"What are the termination conditions?"</span> — the AI will cite the exact clauses!
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}