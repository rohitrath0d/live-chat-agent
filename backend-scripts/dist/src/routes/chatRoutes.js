import express, { Router } from 'express';
import { chat, getSessionHistory, clearChatHistory } from '../controllers/chatController.js';
const router = express.Router();
// POST /api/chat - Send a message to the AI and get a response
router.post('/chat', chat);
// GET /api/session/:sessionId - Fetch the conversation history for a session
router.get('/session/:sessionId', getSessionHistory);
// DELETE /api/session/:sessionId - Clear the chat history for a session
router.delete('/session/:sessionId', clearChatHistory);
export default router;
//# sourceMappingURL=chatRoutes.js.map