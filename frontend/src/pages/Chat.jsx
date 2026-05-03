import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import ChatBubble from '../components/ChatBubble';
import AppLayout from '../components/AppLayout';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [doc, setDoc] = useState(null);
  const [docError, setDocError] = useState(false);
  const messagesEndRef = useRef(null);
  const { messages, loading, loadingHistory, send, clear, fetchHistory } = useChat(id);

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

  useEffect(() => {
    if (id) {
      fetchHistory().catch((err) => {
        console.error('Failed to load history:', err);
        toast.error('Failed to load chat history');
      });
    }
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input?.trim() || loading) return;
    send(input);
    setInput('');
  };

  if (!doc && !docError) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (docError) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <span className="text-5xl">😕</span>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Could not load this document</p>
          <Link to="/dashboard" className="mt-2 inline-block text-blue-600 hover:underline">← Back to Dashboard</Link>
        </div>
      </AppLayout>
    );
  }

  const messageList = Array.isArray(messages) ? messages : [];

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to={`/documents/${id}`} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            ← Back to Document
          </Link>
          <h1 className="mt-1 text-xl font-bold text-gray-800 dark:text-white">{doc?.title || 'Document'}</h1>
        </div>
        <button
          onClick={clear}
          className="rounded-xl px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
        >
          🗑 Clear Chat
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex flex-col rounded-2xl bg-white shadow-sm dark:bg-gray-900" style={{ height: 'calc(100vh - 250px)' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loadingHistory ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : messageList.length === 0 ? (
            <div className="py-20 text-center">
              <span className="text-6xl">⚖️</span>
              <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-200">Ask Legal Saathi AI</h2>
              <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                Ask questions about this document. The AI will analyze it and provide legal insights.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[
                  'Summarize this document',
                  'What are the key points?',
                  'Are there any legal risks?',
                  'Explain in simple terms',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-full border px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:border-blue-300 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messageList.map((msg, index) => (
              <ChatBubble key={msg.id || msg.created_at || index} message={msg} />
            ))
          )}
          {loading && (
            <div className="mb-4 flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-md border bg-white px-5 py-3 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚖️</span>
                  <span className="text-xs font-semibold text-gray-400">Legal Saathi AI</span>
                </div>
                <div className="mt-2 flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t px-6 py-4 dark:border-gray-800">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this document..."
              disabled={loading}
              className="flex-1 rounded-xl border px-5 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input?.trim()}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}