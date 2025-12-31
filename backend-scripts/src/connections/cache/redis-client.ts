import 'dotenv/config'
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const HISTORY_MAX = Number(process.env.HISTORY_MAX || 200);

let client: RedisClientType | null = null; // RedisClientType is the type for the Redis client

async function getClient(): Promise<RedisClientType> {
  if (!client) {
    client = createClient({ url: REDIS_URL });
    client.on('error', (err: string) => console.error('Redis Client Error', err));
    await client.connect();
  }
  return client;
}

function keyFor(sessionId: string): string {
  return `session:${sessionId}`;
}

// Append message to Redis
async function appendMessage(sessionId: string, messageObj: Record<string, any>): Promise<void> {
  const c = await getClient();
  const key = keyFor(sessionId);

  // Ensure the message is an object
  if (typeof messageObj === 'object') {
    await c.rPush(key, JSON.stringify(messageObj));

    // Trim to max length to avoid unbounded growth
    await c.lTrim(key, Math.max(-HISTORY_MAX, -HISTORY_MAX), -1);

  }
}

async function getHistory(sessionId: string): Promise<unknown[]> {
  const c = await getClient();
  const key = keyFor(sessionId);
  const items = await c.lRange(key, 0, -1);
  const parsed: unknown[] = [];

  for (const it of items) {
    try {
      parsed.push(JSON.parse(it));
    } catch (e) {
      // ignore malformed entries
      console.error('<------------ Malformed entry in history: ----------->', e);
    }
  }
  return parsed;
}

// Clear session data from Redis
async function clearSession(sessionId: string): Promise<boolean> {
  const c = await getClient();
  const key = keyFor(sessionId);
  const res = await c.del(key);
  return res > 0;
}

export {
  getClient,
  appendMessage,
  getHistory,
  clearSession
};
