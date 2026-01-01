import { GoogleGenAI } from '@google/genai';

// configuration
// Cost control and model settings
const MAX_HISTORY_MESSAGES = 20;
const MAX_OUTPUT_TOKENS = 1024;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// System prompt - Ecommerce customer support agent
const SYSTEM_PROMPT = `You are a friendly and professional customer support agent for Ecommerce Marketplace, a small e-commerce store specializing in electronics, home goods, and lifestyle products, and moreover the products and goods.

## Your Role:
- Assist customers with product inquiries, order status, returns, and general questions
- Provide clear, concise, and helpful responses
- Maintain a warm yet professional tone
- Escalate complex issues appropriately

## Guidelines:
1. **Order Issues**: For order status, tracking, or modifications, ask for the order number
2. **Returns/Refunds**: Explain our 30-day return policy, ask for order details
3. **Product Questions**: Provide accurate information based on available knowledge
4. **Technical Issues**: Help troubleshoot common problems, offer to escalate if needed
5. **Shipping**: Standard shipping is 3-5 business days, express is 1-2 days
6. **Payment**: We accept all major credit cards, PayPal, and Apple Pay

## Response Style:
- Keep responses under 150 words when possible
- Use bullet points for lists
- Be empathetic when customers are frustrated
- Always offer further assistance at the end

## Limitations:
- You cannot process payments or refunds directly
- You cannot access real-time inventory systems
- For complex issues, suggest contacting support@quickshop.com

Remember: Your goal is to help customers quickly and make them feel valued!`;

// INITIALIZATION (lazy loading to ensure dotenv has been configured)
let genAIClient: GoogleGenAI | null = null;

function getGenAIClient(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    console.log('[LLM Service] Initializing with API key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT SET');

    if (!apiKey) {
      console.error('[LLM Service] ⚠️ GEMINI_API_KEY is not configured!');
    }

    genAIClient = new GoogleGenAI({
      apiKey: apiKey
    });

    console.log('<----------- [LLM Service] Client initialized. ------------>');
  }
  return genAIClient!;
}

// // MESSAGE TYPES
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// interface GeminiContent {
//   role: 'user' | 'model';
//   parts: { text: string }[];
// }

// HELPER FUNCTIONS
/**
 * Converts chat history to Gemini's content format
 * - Filters out system messages (handled separately)
 * - Filters out empty messages
 * - Limits history to MAX_HISTORY_MESSAGES
 * - Converts 'assistant' role to 'model'
 */

/**
 * Handles various API errors and returns user-friendly messages
 */
function handleApiError(error: any): string {
  console.error('<--------------- [LLM Service] API Error ------------------>:', error);
  console.error(`- Status: ${error?.status || 'N/A'}`);
  console.error(`- Message: ${error?.message}`);

  const errorMessage = error?.message?.toLowerCase() || '';

  if (errorMessage.includes('404') || errorMessage.includes('not found')) {
    return "The AI model version is currently being updated. Please try again in a few minutes.";
  }

  if (errorMessage.includes('api key') || errorMessage.includes('api_key')) {
    return "I'm sorry, but I'm having trouble connecting to my brain right now. Please try again later or contact support.";
  }

  if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
    return "I'm a bit overwhelmed with requests right now. Please wait a moment and try again.";
  }

  if (errorMessage.includes('safety')) {
    return "I'm not able to respond to that particular request. How else can I help you today?";
  }

  return "I apologize, but I encountered an issue processing your request. Please try again or contact support@quickshop.com for assistance.";
}

// MAIN FUNCTIONS
/**
 * Generate a reply based on conversation history and the new user message
 * This is the main entry point for the LLM service
 * 
 * @param history - Previous conversation messages
 * @param userMessage - The new message from the user
 * @returns AsyncGenerator that yields response chunks
 */
async function* generateReply(history: ChatMessage[], userMessage: string): AsyncGenerator<string> {
  console.log(`[LLM Service] Generating reply for message: "${userMessage.substring(0, 50)}..."`);
  console.log(`[LLM Service] Using Model: ${GEMINI_MODEL}`);
  console.log(`[LLM Service] History length: ${history.length} (limited to ${MAX_HISTORY_MESSAGES})`);

  if (!process.env.GEMINI_API_KEY) {
    yield handleApiError(new Error('API key not configured'));
    return;
  }

  if (!userMessage?.trim()) {
    yield "I didn't receive a message. How can I help you today?";
    return;
  }

  try {
    const ai = getGenAIClient();

    // Build the contents array for Gemini
    // const contents = buildGeminiContents(history, userMessage);
    const contents = history
      .slice(-MAX_HISTORY_MESSAGES)
      .filter(msg => msg.role !== 'system' && msg.content?.trim())
      .map(msg => ({
        role: (msg.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
        parts: [{ text: msg.content }]
      }));


    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    // Prepend system instruction as a user message followed by a model acknowledgment
    // const fullContents: GeminiContent[] = [
    //   { role: 'user', parts: [{ text: `System Instructions: ${SYSTEM_PROMPT}` }] },
    //   { role: 'model', parts: [{ text: 'Understood! I will act as a QuickShop customer support agent and follow all the guidelines you provided.' }] },
    //   ...contents
    // ];

    // console.log(`[LLM Service] Sending ${fullContents.length} messages to Gemini (including system prompt)`);

    // Use generateContentStream for direct API call
    // const result = await ai.models.generateContentStream({ contents: fullContents });
    // Execute Streaming with the modern configuration block
    const result = await ai.models.generateContentStream({
      model: GEMINI_MODEL,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT, // Proper system prompt placement
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.7,
        topP: 0.9,
      }
    });

    let hasContent = false;
    let totalChunks = 0;

    for await (const chunk of result) {
      // const text = chunk.text();
      const text = chunk.text;
      if (text) {
        hasContent = true;
        totalChunks++;
        yield text;
      }
    }

    console.log(`[LLM Service] Stream complete. Chunks: ${totalChunks}`);

    if (!hasContent) {
      console.warn('[LLM Service] No content received from Gemini');
      yield "I'm here to help! Could you please rephrase your question?";
    }

  } catch (error: any) {
    console.error('<------------[LLM Service] Error calling Gemini API:-------------->');
    console.error('[LLM Service] Error name:', error?.name);
    console.error('[LLM Service] Error message:', error?.message);
    console.error('[LLM Service] Full error:', error);
    yield handleApiError(error);
  }
}

/**
 * Non-streaming version for simpler use cases
 */
async function generate(prompt: string): Promise<string> {
  try {
    // const model = getModel();
    const ai = getGenAIClient();
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    // return result?.response?.text?.() || '';
    return result.text || '';     // Property 'text' exists directly on the result object
  } catch (error: any) {
    console.error('[LLM Service] Generate error:', error);
    return handleApiError(error);
  }
}

/**
 * Legacy streaming function - wraps generateReply for backward compatibility
 * @deprecated Use generateReply instead
 */
async function* streamGenerate(prompt: string): AsyncGenerator<string> {
  // Parse the legacy JSON prompt format
  let history: ChatMessage[] = [];
  let userMessage = prompt;

  try {
    const parsed = JSON.parse(prompt);
    if (Array.isArray(parsed)) {
      // Extract messages, the last user message is the current one
      const userMessages = parsed.filter((m: any) => m.role === 'user');
      if (userMessages.length > 0) {
        userMessage = userMessages[userMessages.length - 1].content;
        // History is everything except the last user message  
        history = parsed.slice(0, -1);
      }
    }
  } catch {
    // Not JSON, use as plain text

  }

  yield* generateReply(history, userMessage);
}

export {
  generate,
  streamGenerate,
  generateReply,
  SYSTEM_PROMPT,
  MAX_HISTORY_MESSAGES,
  MAX_OUTPUT_TOKENS
};
