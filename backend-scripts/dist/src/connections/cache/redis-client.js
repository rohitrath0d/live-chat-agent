import { createClient } from 'redis';
const HISTORY_MAX = Number(process.env.HISTORY_MAX || 200);
let client = null;
async function getClient() {
    if (!client) {
        // Read env vars at connection time (after dotenv has loaded)
        const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
        const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);
        const REDIS_USERNAME = process.env.REDIS_USERNAME || 'default';
        const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
        console.log('Creating Redis client with config:', {
            host: REDIS_HOST,
            port: REDIS_PORT,
            username: REDIS_USERNAME,
            password: REDIS_PASSWORD ? '****' : '(not set)',
        });
        client = createClient({
            socket: {
                host: REDIS_HOST,
                port: REDIS_PORT,
            },
            username: REDIS_USERNAME,
            ...(REDIS_PASSWORD && { password: REDIS_PASSWORD }),
        });
        client.on('error', (err) => console.error('Redis Client Error:', err));
        client.on('connect', () => console.log('Redis client connecting...'));
        client.on('ready', () => console.log('Redis client ready!'));
        await client.connect();
        console.log('Redis client connected successfully!');
    }
    return client;
}
function keyFor(sessionId) {
    return `session:${sessionId}`;
}
// Append message to Redis
async function appendMessage(sessionId, messageObj) {
    const c = await getClient();
    const key = keyFor(sessionId);
    if (typeof messageObj === 'object') {
        await c.rPush(key, JSON.stringify(messageObj));
        await c.lTrim(key, -HISTORY_MAX, -1);
    }
}
// Get chat history from Redis
async function getHistory(sessionId) {
    const c = await getClient();
    const key = keyFor(sessionId);
    const items = await c.lRange(key, 0, -1);
    const parsed = [];
    for (const item of items) {
        try {
            parsed.push(JSON.parse(item));
        }
        catch (e) {
            console.error('Malformed entry in history:', e);
        }
    }
    return parsed;
}
// Clear session data from Redis
async function clearSession(sessionId) {
    const c = await getClient();
    const key = keyFor(sessionId);
    const res = await c.del(key);
    return res > 0;
}
export { getClient, appendMessage, getHistory, clearSession, };
//# sourceMappingURL=redis-client.js.map