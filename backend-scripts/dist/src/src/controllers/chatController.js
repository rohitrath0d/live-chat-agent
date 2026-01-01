import { 
// generate, 
streamGenerate } from '../services/llm-service.js'; // LLM Service
import { appendMessage, getHistory, clearSession } from '../connections/cache/redis-client.js'; // Redis Client
// POST /api/chat - non-streaming chat
export const chat = async (req, res) => {
    try {
        const { sessionId, message } = req.body;
        // Validate input
        if (!sessionId || !message) {
            return res.status(400).json({ error: 'sessionId and message are required' });
        }
        // Save user message in Redis (Append to session history)
        const userMessage = { role: 'user', content: String(message) };
        await appendMessage(sessionId, userMessage);
        // Retrieve the conversation history from Redis
        const history = await getHistory(sessionId);
        // Build the prompt using the conversation history
        const prompt = await buildPrompt(history, message);
        console.log("<------------ Prompt being sent to Gemini------------->: \n", prompt);
        // Generate a response using the LLM (e.g., Gemini)
        // const answer = await generate(prompt);
        const answer = await streamGenerate(prompt);
        // Save assistant's reply in Redis
        const assistantMessage = { role: 'assistant', content: answer };
        await appendMessage(sessionId, assistantMessage);
        // Return the assistant's reply to the client
        return res.json({ message: answer });
    }
    catch (err) {
        console.error("<------- Chat error: ------>", err);
        return res.status(500).json({ error: err?.message || 'Unknown error' });
    }
};
// GET /api/session/:sessionId - fetch chat history
export const getSessionHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;
        // Validate input
        if (!sessionId)
            return res.status(400).json({ error: 'sessionId is required' });
        // Fetch chat history from Redis
        const history = await getHistory(sessionId);
        return res.json({ sessionId, history });
    }
    catch (err) {
        console.error("<------- Error fetching history: ---------->", err);
        return res.status(500).json({ error: err?.message || 'Unknown error' });
    }
};
// DELETE /api/session/:sessionId - clear chat history
export const clearChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;
        // Validate input
        if (!sessionId)
            return res.status(400).json({ error: 'sessionId is required' });
        // Clear session data from Redis
        const cleared = await clearSession(sessionId);
        return res.json({ sessionId, cleared });
    }
    catch (err) {
        console.error("<------------ Error clearing session: ------------->", err);
        return res.status(500).json({ error: err?.message || 'Unknown error' });
    }
};
// Helper function to build the LLM prompt from the history and new message
async function buildPrompt(history, userMessage) {
    const historyMessages = history.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
    }));
    // Append the new user message
    const prompt = [
        { role: 'system', content: 'You are a helpful support agent.' },
        ...historyMessages,
        { role: 'user', content: userMessage },
    ];
    return JSON.stringify(prompt);
}
//# sourceMappingURL=chatController.js.map