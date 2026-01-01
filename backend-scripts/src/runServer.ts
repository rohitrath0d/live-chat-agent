import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { appendMessage, getHistory } from './connections/cache/redis-client.js';
import { generateReply } from './services/llm-service.js';
import chatRoutes from './routes/chatRoutes.js';

const app = express();
const allowedOrigins = [
  process.env.VITE_FRONTEND_URL
];

app.use(express.json());
// app.use(cors());

// cors config
app.use(cors({
  origin: function (origin, callback) {
    // Allow same-origin, curl, server-to-server
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // IMPORTANT: do NOT throw
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

// // Preflight
// app.options('*', cors());

const httpServer = http.createServer(app);
// const socketConnection= socketIO(httpServer)
const socketConnection = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  }
});

const port = process.env.SERVER_PORT || 4000;

app.get('/', (_req, res) => {
  res.send('quick comm backend up and running: /home-route')
});

app.get('/health', (_req, res) => res.send({
  status: 'health check successful',
  service: 'live-chat-agent-backend',
  uptime: process.uptime(),
  time: new Date().toISOString()
}));

// API health check (used by Nginx / infra)
app.get('/api/health', (_req, res) => {
  res.send({
    status: 'healthy',
    service: 'live-chat-agent-backend',
  });
});

// error handler 
// app.use(errorHandler);

app.use("/api/chat", chatRoutes);



// init socket connection
socketConnection.on('connection', (socket) => {
  console.log(`A user connected with ID: ${socket.id}`);     // Logging socket ID (helps debugging)

  // Listen for 'message' event from the client
  socket.on('message', async (data: { sessionId: string, message: string }) => {
    console.log('<--- Received message from client --->', data);

    try {
      const { sessionId, message } = data;

      if (!sessionId || !message) {
        console.log('Missing sessionId or message');
        socket.emit('error', { error: 'sessionId and message are required' });
        return;
      }

      console.log('Saving user message to Redis...');
      // Save user message to Redis
      const userMessage = { role: 'user', content: String(message) };
      await appendMessage(sessionId, userMessage);
      console.log('User message saved to Redis');

      // Get conversation history from Redis
      console.log('Getting history from Redis...');
      const rawHistory = await getHistory(sessionId);
      // Cast to the expected format
      const history = rawHistory as Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
      console.log('History retrieved, length:', history?.length || 0);

      // Generate AI response using LLM service with proper history and message
      let fullAnswer = '';
      let chunkCount = 0;

      console.log('Calling generateReply with history and message...');
      // Use the new generateReply function that handles everything properly
      for await (const chunk of generateReply(history, message)) {
        chunkCount++;
        fullAnswer += chunk;
        console.log(`Emitting chunk ${chunkCount}:`, chunk.substring(0, 50) + (chunk.length > 50 ? '...' : ''));
        // Emit each chunk to the client for real-time streaming
        socket.emit('stream', { sessionId, chunk });
      }
      console.log('Stream complete, total chunks:', chunkCount);

      // Save assistant's full message in Redis
      console.log('Saving assistant message to Redis...');
      const assistantMessage = { role: 'assistant', content: fullAnswer };
      await appendMessage(sessionId, assistantMessage);
      console.log('Assistant message saved');

      // Emit the complete AI response back to the client
      console.log('Emitting complete message to client...');
      socket.emit('message', { sessionId, message: fullAnswer });
      console.log('<--- Message handling complete --->');
    } catch (error) {
      console.error('<----------Error in WebSocket message:---------->', error);
      socket.emit('error', { error: 'Something went wrong!' });
    }
  });

  socket.on('disconnect', () => console.log('user disconnected', socket.id));

});

// attach io so routes/controllers can emit
app.set('io', socketConnection);

// // app.listen(port, ()=> {      // app -> server (for socket connection)
httpServer.listen(port, () => {
  console.log(`Server is running on port: http://localhost:${port}`)
});
