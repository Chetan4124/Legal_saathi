import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AppLayout from '../components/AppLayout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Logout is handled in sidebar now, but keep reference
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
    } catch (err) {
      toast.error('Retry failed');
    }
  };

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
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
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
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getFileIcon = (title) => {
    const ext = title?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📕';
    if (['png', 'jpg', 'jpeg'].includes(ext)) return '🖼️';
    return '📄';
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Documents</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload legal documents and get AI-powered analysis
          </p>
        </div>

        <label
          className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition ${
            uploading
              ? 'cursor-not-allowed bg-blue-400'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
          }`}
        >
          {uploading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Uploading...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
        </label>
      </div>

      {/* Drag & Drop Zone */}
      <motion.div
        whileHover={{ scale: 1.005 }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`mb-8 rounded-2xl border-2 border-dashed p-8 text-center transition ${
          dragging
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10'
            : 'border-gray-300 bg-white hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900'
        }`}
      >
        <span className="text-4xl">📁</span>
        <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">
          Drag & drop your document here
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Supports PDF, PNG, JPG (Max 10MB)
        </p>
      </motion.div>

      {/* Document List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl bg-white p-5 shadow-sm dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
                </div>
                <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      ) : docs.length === 0 ? (
        <div className="rounded-2xl bg-white py-16 text-center shadow-sm dark:bg-gray-900">
          <span className="text-6xl">📭</span>
          <h3 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">No documents yet</h3>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Upload your first legal document to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <motion.div
              key={doc.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => navigate(`/documents/${doc.id}`)}
              className="group flex cursor-pointer items-center justify-between rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md hover:ring-1 hover:ring-blue-200 dark:bg-gray-900 dark:hover:ring-blue-800"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{getFileIcon(doc.title)}</span>
                <div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 dark:text-gray-200 dark:group-hover:text-blue-400 transition">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(doc.uploaded_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {doc.status === 'failed' && (
                  <button
                    onClick={(e) => handleRetryOCR(e, doc.id)}
                    className="rounded-lg bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 transition"
                  >
                    Retry OCR
                  </button>
                )}
                {getStatusBadge(doc.status)}
                <svg className="h-5 w-5 text-gray-300 group-hover:text-gray-500 dark:text-gray-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}