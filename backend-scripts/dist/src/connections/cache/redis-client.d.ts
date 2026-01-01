import type { RedisClientType } from 'redis';
declare function getClient(): Promise<RedisClientType>;
declare function appendMessage(sessionId: string, messageObj: Record<string, any>): Promise<void>;
declare function getHistory(sessionId: string): Promise<unknown[]>;
declare function clearSession(sessionId: string): Promise<boolean>;
export { getClient, appendMessage, getHistory, clearSession, };
//# sourceMappingURL=redis-client.d.ts.map