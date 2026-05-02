import { useState, useCallback } from 'react';
import { sendMessage, getChatHistory, clearChat } from '../api/chats';
import toast from 'react-hot-toast';

export function useChat(documentId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Fetch chat history — backend returns { id, messages: [...], ... }
  const fetchHistory = useCallback(async () => {
    if (!documentId) return;
    setLoadingHistory(true);
    try {
      const { data } = await getChatHistory(documentId);
      // Backend returns session object with messages array inside
      const messageList = Array.isArray(data)
        ? data
        : data?.messages || [];
      setMessages(messageList);
    } catch (err) {
      console.error('History fetch error:', err);
      setMessages([]);
      throw err;
    } finally {
      setLoadingHistory(false);
    }
  }, [documentId]);

  // Send message — backend returns { answer, session_id }
  const send = async (message) => {
    if (!message?.trim() || !documentId) return;

    // Optimistic user message
    const userMsg = {
      role: 'user',
      content: message,
      id: Date.now(),
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...(Array.isArray(prev) ? prev : []), userMsg]);
    setLoading(true);

    try {
      const { data } = await sendMessage(documentId, message);
      // Backend returns { answer, session_id } — NOT { assistant_message }
      const aiMsg = {
        role: 'assistant',
        content: data?.answer || data?.response || data?.assistant_message || 'No response received',
        id: Date.now() + 1,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Failed to get AI response';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Clear chat
  const clear = async () => {
    if (!documentId) return;
    try {
      await clearChat(documentId);
      setMessages([]);
      toast.success('Chat cleared');
    } catch (err) {
      toast.error('Failed to clear chat');
    }
  };

  return { messages, loading, loadingHistory, send, clear, fetchHistory };
}