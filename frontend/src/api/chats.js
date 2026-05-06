import api from './axios';

export const sendMessage = (documentId, message) =>
  api.post('/chats/send/', { document_id: documentId, message });

export const getChatHistory = (documentId) =>
  api.get(`/chats/history/${documentId}/`);

export const clearChat = (documentId) =>
  api.post(`/chats/clear/${documentId}/`);

export const getDocumentSummary = (documentId) =>
  api.get(`/chats/summary/${documentId}/`);

export const exportChat = (documentId, formatType = 'pdf') =>
  api.get(`/chats/export/${documentId}/${formatType}/`, {
    responseType: 'blob',
  });