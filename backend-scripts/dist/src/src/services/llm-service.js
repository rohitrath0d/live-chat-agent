import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
// Environment variables with types
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
// Warning if API key is missing
if (!GEMINI_API_KEY) {
    console.warn('[geminiService] Missing GEMINI_API_KEY. Responses will fail until configured.');
}
// Initialize GoogleGenerativeAI with the API key
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
// Define the function to get the model
function getModel() {
    return genAI.getGenerativeModel({ model: GEMINI_MODEL });
}
// Define the generate function with proper return type
async function generate(prompt) {
    try {
        const model = getModel();
        const result = await model.generateContent(prompt);
        const text = result?.response?.text?.() || '';
        return text;
    }
    catch (err) {
        throw new Error(`Gemini generate failed: ${err?.message || String(err)}`);
    }
}
// Define the streamGenerate function with a generator type
async function* streamGenerate(prompt) {
    try {
        const model = getModel();
        const response = await model.generateContentStream({
            contents: [{
                    role: 'user',
                    parts: [{
                            text: prompt
                        }]
                }]
        });
        // Stream content
        for await (const chunk of response.stream) {
            const text = chunk?.text?.();
            if (text)
                yield text;
        }
    }
    catch (err) {
        // Fallback: non-streaming as single chunk
        const text = await generate(prompt).catch(() => '');
        if (text)
            yield text;
    }
}
// Export functions for external use
export { generate, streamGenerate };
//# sourceMappingURL=llm-service.js.map