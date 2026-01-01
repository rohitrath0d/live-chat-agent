import { io } from 'socket.io-client';

// Base API URL from environment variables
export const API_BASE = import.meta.env.VITE_API_URL;
export const SOCKET_IO_URL = import.meta.env.VITE_SOCKET_IO_URL;

console.log('API Configuration:', { API_BASE, SOCKET_IO_URL });

// API endpoints
export const CHAT_ENDPOINT = `${API_BASE}/api/chat`;
export const SESSION_ENDPOINT = `${API_BASE}/api/chat/session`;

// Socket connection URL, fallback to API_BASE if not set

// Create socket connection
const socket = io(SOCKET_IO_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
});

// Debug socket connection status
socket.on('connect', () => {
  console.log('Socket connected! Socket ID:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected. Reason:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error.message);
});

// Utility function to get session history URL
export const getSessionHistoryUrl = (sessionId) => `${SESSION_ENDPOINT}/${sessionId}`;

// Utility function to clear session history URL
export const clearSessionHistoryUrl = (sessionId) => `${SESSION_ENDPOINT}/${sessionId}`;

// Subscribe to socket messages - returns unsubscribe function
export const onSocketMessage = (callback) => {
  socket.on('message', callback);
  return () => socket.off('message', callback);
};

// Subscribe to socket stream chunks - returns unsubscribe function
export const onSocketStream = (callback) => {
  socket.on('stream', callback);
  return () => socket.off('stream', callback);
};

// Subscribe to socket errors - returns unsubscribe function
export const onSocketError = (callback) => {
  socket.on('error', callback);
  return () => socket.off('error', callback);
};

// Send a message to the server
export const sendMessage = (sessionId, message) => {
  console.log('sendMessage called:', { sessionId, message });
  console.log('Socket connected:', socket.connected);
  console.log('Socket ID:', socket.id);

  if (!socket.connected) {
    console.error('Socket is not connected! Attempting to connect...');
    socket.connect();
  }

  socket.emit('message', { sessionId, message });
  console.log('Message emitted to socket');
};

// Fetch chat history from the backend
export const fetchChatHistory = async (sessionId) => {
  try {
    if (!sessionId) {
      console.warn('Session ID is not provided');
      return [];
    }

    const response = await fetch(getSessionHistoryUrl(sessionId));

    // Handle 404 - session doesn't exist yet (new user)
    if (response.status === 404) {
      console.log('No existing chat history for this session');
      return [];
    }

    if (!response.ok) {
      throw new Error('Failed to fetch chat history');
    }

    const data = await response.json();
    console.log('Fetched chat history:', data);

    // Backend returns { sessionId, history } - extract the history array
    const history = data.history || data || [];

    // Ensure it's an array
    if (!Array.isArray(history)) {
      console.warn('History is not an array:', history);
      return [];
    }

    // Transform backend format {role, content} to frontend format {id, content, isUser, timestamp}
    return history.map((msg, index) => ({
      id: `history_${index}_${Date.now()}`,
      content: msg.content,
      isUser: msg.role === 'user',
      timestamp: msg.timestamp || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return []; // Return empty array on error to prevent UI crash
  }
};

// Example of clearing chat history (if needed)
export const clearChatHistory = async (sessionId) => {
  try {
    const response = await fetch(clearSessionHistoryUrl(sessionId), {
      method: 'DELETE', // or 'POST' based on your backend implementation
    });
    if (!response.ok) {
      throw new Error('Failed to clear chat history');
    }
    return true;
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return false;
  }
};
