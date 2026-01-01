import type { Request, Response } from 'express';
interface ChatRequestBody {
    sessionId: string;
    message: string;
}
export declare const chat: (req: Request<{}, {}, ChatRequestBody>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getSessionHistory: (req: Request<{
    sessionId: string;
}, {}, {}>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const clearChatHistory: (req: Request<{
    sessionId: string;
}, {}, {}>, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=chatController.d.ts.map