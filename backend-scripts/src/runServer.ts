import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

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
  service: 'quick-comm-backend',
  uptime: process.uptime(),
  time: new Date().toISOString()
}));

// API health check (used by Nginx / infra)
app.get('/api/health', (_req, res) => {
  res.send({
    status: 'healthy',
    service: 'quick-comm-backend',
  });
});



// error handler 
app.use(errorHandler);


// init socket connection
socketConnection.on('connection', (socket) => {
  // console.log('New user connected');
  console.log(`New user connected: ${socket.id}`);     // Logging socket ID (helps debugging)

  socket.on('join_room', room => socket.join(room));

  socket.on('disconnect', () => console.log('socket disconnected', socket.id));

});

// attach io so routes/controllers can emit
app.set('io', socketConnection);

// // app.listen(port, ()=> {      // app -> server (for socket connection)
httpServer.listen(port, () => {
  console.log(`Server is running on port: http://localhost:${port}`)
});
