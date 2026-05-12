import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import ChatBubble from '../components/ChatBubble';
import AppLayout from '../components/AppLayout';
import { exportChat } from '../api/chats';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [doc, setDoc] = useState(null);
  const [docError, setDocError] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { messages, loading, loadingHistory, send, clear, fetchHistory } = useChat(id);

  // ── Fetch Document Details ──
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await api.get(`/documents/${id}/`);
        setDoc(data);
        if (data?.status !== 'completed') {
          toast.error('OCR must be completed before chatting');
          navigate(`/documents/${id}`);
        }
      } catch (err) {
        console.error('Failed to load document:', err);
        setDocError(true);
        toast.error('Failed to load document. Redirecting...');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    })();
  }, [id, navigate]);

  // ── Fetch Chat History ──
  useEffect(() => {
    if (id) {
      fetchHistory().catch((err) => {
        console.error('Failed to load history:', err);
        toast.error('Failed to load chat history');
      });
    }
  }, [id]);

  // ── Auto-scroll to Bottom ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Focus Input on Mount ──
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ── Send Message ──
  const handleSend = (e) => {
    e.preventDefault();
    if (!input?.trim() || loading) return;
    send(input);
    setInput('');
    // Re-focus input after sending
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── Handle Keyboard Shortcuts ──
  const handleKeyDown = (e) => {
    // Enter sends, Shift+Enter adds new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // ── Export Chat ──
  const handleExport = async (formatType) => {
    setExporting(true);
    setShowExportMenu(false);
    try {
      const response = await exportChat(id, formatType);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const ext = formatType === 'pdf' ? 'pdf' : 'txt';
      const timestamp = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `legal-saathi-chat-${timestamp}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Chat exported as ${formatType.toUpperCase()}`);
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // ── Handle Suggested Query Click ──
  const handleSuggestedQuery = (query) => {
    send(query);
  };

  // ── Loading State ──
  if (!doc && !docError) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="mt-4 text-base text-gray-500 dark:text-gray-400">Loading document...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ── Error State ──
  if (docError) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <span className="text-6xl">😕</span>
            <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
              Could not load this document
            </h2>
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
              The document may have been deleted or you don't have access.
            </p>
            <Link
              to="/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const messageList = Array.isArray(messages) ? messages : [];
  const hasMessages = messageList.length > 0;

  return (
    <AppLayout>
      {/* ── Header Bar ── */}
      <div className="mb-6">
        {/* Breadcrumb */}
        <Link
          to={`/documents/${id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition group"
        >
          <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Document
        </Link>

        {/* Title Row */}
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {/* Document Icon */}
            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl dark:bg-blue-900/20">
              📄
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white truncate max-w-md">
                {doc?.title || 'Document'}
              </h1>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                AI Legal Advisor • {messageList.length} message{messageList.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={!hasMessages || exporting}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                title={!hasMessages ? 'No messages to export' : 'Export chat'}
              >
                {exporting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
                  </>
                )}
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showExportMenu && (
                  <>
                    {/* Backdrop to close on click outside */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowExportMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-200 bg-white p-2 shadow-xl z-20 dark:bg-gray-900 dark:border-gray-700"
                    >
                      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Export Format
                      </div>
                      <button
                        onClick={() => handleExport('pdf')}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 transition"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-lg dark:bg-red-900/20">
                          📕
                        </span>
                        <div className="text-left">
                          <p className="font-medium">PDF Document</p>
                          <p className="text-xs text-gray-400">Formatted, printable</p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleExport('txt')}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 transition"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-lg dark:bg-gray-800">
                          📄
                        </span>
                        <div className="text-left">
                          <p className="font-medium">Plain Text</p>
                          <p className="text-xs text-gray-400">Simple .txt file</p>
                        </div>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Clear Chat Button */}
            {hasMessages && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all chat messages?')) {
                    clear();
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20 transition"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Chat Container ── */}
      <div
        className="flex flex-col rounded-2xl bg-white shadow-sm dark:bg-gray-900 overflow-hidden border border-gray-100 dark:border-gray-800"
        style={{ height: 'calc(100vh - 260px)', minHeight: '500px' }}
      >
        {/* ── Messages Area ── */}
        <div className="flex-1 overflow-y-auto">
          {loadingHistory ? (
            /* Loading Skeleton */
            <div className="flex items-center justify-center h-full py-20">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                <p className="mt-4 text-sm text-gray-400">Loading messages...</p>
              </div>
            </div>
          ) : !hasMessages ? (
            /* Empty State */
            <div className="flex items-center justify-center h-full px-6 py-16">
              <div className="text-center max-w-lg">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                >
                  <span className="text-8xl">⚖️</span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8 text-2xl font-bold text-gray-800 dark:text-white"
                >
                  Ask Legal Saathi AI
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 text-base text-gray-500 dark:text-gray-400 leading-relaxed"
                >
                  Your AI legal advisor analyzes this document and answers questions with specific clause citations and legal context.
                </motion.p>

                {/* Suggested Queries */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 flex flex-wrap justify-center gap-3"
                >
                  {[
                    {
                      icon: '📋',
                      label: 'Summarize this document',
                      query: 'Please provide a detailed summary of this document.',
                      color: 'hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:border-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400',
                    },
                    {
                      icon: '🔑',
                      label: 'Key points & clauses',
                      query: 'What are the key points and main clauses in this document?',
                      color: 'hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 dark:hover:border-purple-700 dark:hover:bg-purple-900/20 dark:hover:text-purple-400',
                    },
                    {
                      icon: '⚠️',
                      label: 'Identify legal risks',
                      query: 'Are there any legal risks or concerning clauses I should be aware of?',
                      color: 'hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 dark:hover:border-orange-700 dark:hover:bg-orange-900/20 dark:hover:text-orange-400',
                    },
                    {
                      icon: '📖',
                      label: 'Explain simply',
                      query: 'Explain this document in simple, easy-to-understand terms.',
                      color: 'hover:border-green-300 hover:bg-green-50 hover:text-green-700 dark:hover:border-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-400',
                    },
                    {
                      icon: '⚖️',
                      label: 'Obligations & duties',
                      query: 'What are my obligations and duties under this document?',
                      color: 'hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400',
                    },
                    {
                      icon: '📅',
                      label: 'Important dates & deadlines',
                      query: 'Are there any important dates, deadlines, or timelines mentioned?',
                      color: 'hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:hover:border-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400',
                    },
                  ].map((item) => (
                    <motion.button
                      key={item.query}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSuggestedQuery(item.query)}
                      className={`flex items-center gap-2 rounded-full border-2 border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-600 transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 ${item.color}`}
                    >
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            </div>
          ) : (
            /* Message List */
            <div className="max-w-3xl mx-auto px-6 py-6">
              {messageList.map((msg, index) => (
                <ChatBubble
                  key={msg.id || msg.created_at || index}
                  message={msg}
                  isLast={index === messageList.length - 1}
                />
              ))}
            </div>
          )}

          {/* ── AI Typing Indicator ── */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="max-w-3xl mx-auto px-6 pb-4"
              >
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-bl-md border border-gray-200 bg-white px-5 py-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">⚖️</span>
                      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                        Legal Saathi AI is analyzing...
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <motion.span
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="h-3 w-3 rounded-full bg-blue-400"
                      />
                      <motion.span
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                        className="h-3 w-3 rounded-full bg-blue-400"
                      />
                      <motion.span
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                        className="h-3 w-3 rounded-full bg-blue-400"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scroll Anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Area ── */}
        <div className="border-t border-gray-100 bg-gray-50/80 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/80 backdrop-blur-sm">
          <form
            onSubmit={handleSend}
            className="flex items-end gap-3 max-w-3xl mx-auto"
          >
            {/* Text Input */}
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about this document... (Enter to send, Shift+Enter for new line)"
                disabled={loading}
                rows={1}
                className="w-full resize-none rounded-2xl border-2 border-gray-200 bg-white px-5 py-3.5 pr-12 text-base leading-relaxed placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-600 dark:focus:ring-blue-900/30 disabled:opacity-50 transition-all"
                style={{ maxHeight: '120px' }}
                onInput={(e) => {
                  // Auto-resize textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
              />
              {/* Clear Input Button */}
              {input.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setInput('');
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Send Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading || !input?.trim()}
              className="flex-shrink-0 rounded-2xl bg-blue-600 p-3.5 text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
              title="Send message (Enter)"
            >
              {loading ? (
                <span className="flex h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </motion.button>
          </form>

          {/* Disclaimer */}
          <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-600 max-w-3xl mx-auto">
            ⚠️ Legal Saathi AI provides general information, not legal advice. Always consult a qualified lawyer for important legal matters.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}