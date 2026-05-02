import api from './axios';

export const sendMessage = (documentId, message) =>
  api.post('/chats/send/', { document_id: documentId, message });

export const getChatHistory = (documentId) =>
  api.get(`/chats/history/${documentId}/`);

// Backend expects POST, not DELETE — fixed
export const clearChat = (documentId) =>
  api.post(`/chats/clear/${documentId}/`);