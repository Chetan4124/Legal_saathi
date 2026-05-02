import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import ChatBubble from '../components/ChatBubble';
import api from '../api/axios';
import toast from 'react-hot-toast';
import AppLayout from '../components/AppLayout';

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [doc, setDoc] = useState(null);
  const [docError, setDocError] = useState(false);
  const messagesEndRef = useRef(null);
  const { messages, loading, loadingHistory, send, clear, fetchHistory } = useChat(id);

  // Fetch document details
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

  // Fetch chat history
  useEffect(() => {
    if (id) {
      fetchHistory().catch((err) => {
        console.error('Failed to load history:', err);
        toast.error('Failed to load chat history');
      });
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input?.trim() || loading) return;
    send(input);
    setInput('');
  };

  // Loading state
  if (!doc && !docError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-sm text-gray-500">Loading document...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (docError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <span className="text-5xl">😕</span>
          <p className="mt-4 text-gray-600">Could not load this document</p>
          <Link to="/dashboard" className="mt-2 inline-block text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Ensure messages is always an array
  const messageList = Array.isArray(messages) ? messages : [];

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to={`/documents/${id}`} className="text-gray-500 hover:text-gray-700 transition">
              ← Back
            </Link>
            <div>
              <h1 className="font-semibold text-gray-800">{doc?.title || 'Document'}</h1>
              <p className="text-xs text-gray-400">AI Legal Advisor</p>
            </div>
          </div>
          <button
            onClick={clear}
            className="rounded-lg px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
          >
            🗑 Clear Chat
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl">
          {loadingHistory ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : messageList.length === 0 ? (
            <div className="py-20 text-center">
              <span className="text-6xl">⚖️</span>
              <h2 className="mt-4 text-xl font-semibold text-gray-700">Ask Legal Saathi AI</h2>
              <p className="mt-2 text-sm text-gray-400">
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
                    className="rounded-full border px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:border-blue-300 transition"
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

          {/* Typing Indicator */}
          {loading && (
            <div className="mb-4 flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-md border bg-white px-5 py-3 shadow-sm">
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
      </div>

      {/* Input Area */}
      <div className="border-t bg-white">
        <form onSubmit={handleSend} className="mx-auto flex max-w-3xl gap-3 px-4 py-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this document..."
            disabled={loading}
            className="flex-1 rounded-xl border px-5 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={loading || !input?.trim()}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}