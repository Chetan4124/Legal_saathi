import api from './axios';

// Send a message to the AI for a specific document
export const sendMessage = (documentId, message) =>
  api.post('/chats/send/', { document_id: documentId, message });

// Get chat history for a document
export const getChatHistory = (documentId) =>
  api.get(`/chats/history/${documentId}/`);

// Clear chat history (backend expects POST)
export const clearChat = (documentId) =>
  api.post(`/chats/clear/${documentId}/`);

// Get AI-generated summary for a document
export const getDocumentSummary = (documentId) =>
  api.get(`/chats/summary/${documentId}/`);