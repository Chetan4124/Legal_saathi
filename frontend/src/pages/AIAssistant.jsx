import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import api from '../api/axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AIAssistant() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch completed documents
  useState(() => {
    (async () => {
      try {
        const { data } = await api.get('/documents/');
        setDocs(data.filter((d) => d.status === 'completed'));
      } catch {
        toast.error('Failed to load documents');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const features = [
    {
      icon: '📋',
      title: 'Document Summarization',
      desc: 'Get instant AI summaries with key clauses, parties, dates, and obligations extracted automatically.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '💬',
      title: 'Legal Q&A',
      desc: 'Ask questions about your documents in plain English. The AI cites specific clauses and sections.',
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: '⚠️',
      title: 'Risk Analysis',
      desc: 'Identify potential legal risks, loopholes, and concerning clauses before signing any document.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: '📖',
      title: 'Plain Language Translation',
      desc: 'Complex legal jargon translated into simple, easy-to-understand language instantly.',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: '⚖️',
      title: 'Constitutional References',
      desc: 'Get relevant constitutional articles, IPC sections, and legal precedents cited automatically.',
      color: 'from-rose-500 to-pink-500',
    },
    {
      icon: '🔄',
      title: 'Document Comparison',
      desc: 'Upload multiple documents and ask the AI to compare clauses, terms, and conditions across them.',
      color: 'from-indigo-500 to-blue-500',
    },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-10"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-400/10 rounded-full blur-3xl" />
          
          <div className="relative">
            <span className="text-sm font-semibold uppercase tracking-widest text-violet-200">
              AI-Powered Intelligence
            </span>
            <h1 className="mt-3 text-4xl font-bold text-white font-display">
              Your AI Legal Assistant
            </h1>
            <p className="mt-3 text-lg text-violet-100/80 max-w-2xl">
              Leverage cutting-edge AI to analyze documents, extract insights, identify risks, and get plain-language explanations of complex legal text.
            </p>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-7 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} text-2xl shadow-lg mb-5`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Ready to Chat Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 text-center"
        >
          <span className="text-5xl">🤖</span>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white font-display">
            Ready to Chat with AI?
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            Open any completed document and click "Chat with AI" to start asking questions.
          </p>
          
          {loading ? (
            <div className="mt-6 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            </div>
          ) : docs.length > 0 ? (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {docs.slice(0, 4).map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => navigate(`/chat/${doc.id}`)}
                  className="rounded-xl bg-gray-900 dark:bg-white px-5 py-3 text-sm font-semibold text-white dark:text-gray-900 hover:opacity-90 transition"
                >
                  💬 Chat about: {doc.title.substring(0, 30)}...
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 rounded-xl bg-gray-900 dark:bg-white px-6 py-3 text-sm font-semibold text-white dark:text-gray-900 hover:opacity-90 transition"
            >
              Upload Your First Document
            </button>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}