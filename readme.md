# Live Chat Agent - Customer Support

A real-time AI-powered customer support chat application built with React, Node.js, Socket.IO, and Google Gemini AI.

![Live Chat Demo](https://img.shields.io/badge/Status-Production%20Ready-green)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [LLM Configuration](#llm-configuration)
- [Trade-offs & Future Improvements](#trade-offs--future-improvements)

---

## Features

- **Real-time Chat**: Bidirectional communication using Socket.IO
- **AI-Powered Responses**: Integrated with Google Gemini AI for intelligent customer support
- **Streaming Responses**: AI responses stream in real-time for better UX
- **Session Persistence**: Chat history stored in Redis for session continuity
- **Responsive UI**: Modern React frontend with beautiful design
- **Error Handling**: Graceful error handling with user-friendly messages

---

## 🛠 Tech Stack

| Layer               |             Technology                 |
|---------------------|----------------------------------------|
| **Frontend**        | React 18, Vite, TailwindCSS, Shadcn/UI |
| **Backend**         | Node.js, Express, TypeScript           |
| **Real-time**       | Socket.IO                              |
| **Database**        | PgSQL (Neon Serverless), Prisma ORM    |
| **Cache**           | Redis Cloud (session/chat history)     |
| **AI/LLM**          | Google Gemini API (`gemini-2.5-flash`) |
| **Package Manager** | pnpm                                   |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  IndexPage  │──│  ChatPanel  │──│  ChatInput / Message    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                           │                                     │
│                    Socket.IO Client                             │
└───────────────────────────┼─────────────────────────────────────┘
                            │ WebSocket
┌───────────────────────────┼─────────────────────────────────────┐
│                     Backend (Node.js)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ runServer   │──│  Socket.IO  │──│  Chat Controller        │  │
│  │ (Express)   │  │  Handler    │  │  (REST API)             │  │
│  └─────────────┘  └──────┬──────┘  └─────────────────────────┘  │
│                          │                                      │
│  ┌───────────────────────┴───────────────────────────────────┐  │
│  │                    Services Layer                         │  │
│  │  ┌─────────────────┐      ┌─────────────────────────────┐ │  │
│  │  │  LLM Service    │      │  Redis Client               │ │  │
│  │  │  (Gemini AI)    │      │  (Session/History)          │ │  │
│  │  └─────────────────┘      └─────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Backend Structure

```
backend-scripts/
├── src/
│   ├── runServer.ts        # Express & Socket.IO server entry
│   ├── controllers/
│   │   └── chatController.ts   # REST API handlers
│   ├── routes/
│   │   └── chatRoutes.ts       # API route definitions
│   ├── services/
│   │   └── llm-service.ts      # Gemini AI integration
│   └── connections/
│       ├── cache/
│       │   └── redis-client.ts # Redis connection & operations
│       └── db-orm/
│           └── prisma/         # Prisma schema & migrations
```

### Design Decisions

1. **Socket.IO for Real-time**: Chosen over WebSockets for automatic reconnection and room support
2. **Redis Cloud for Sessions**: Fast read/write for chat history with TTL support
3. **PostgreSQL + Neon**: Serverless PostgreSQL for persistent data with automatic scaling
4. **Prisma ORM**: Type-safe database access with auto-generated migrations
5. **Streaming Responses**: AI chunks streamed individually for responsive UX
6. **Lazy Initialization**: LLM client initialized on first use to ensure env vars are loaded
7. **System Prompt Approach**: Embedded as first message pair for compatibility across Gemini versions

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Redis instance (local or Redis Cloud)
- PostgreSQL database (local or Neon Cloud)
- Google AI Studio API Key

### 1. Clone the Repository

```bash
git clone <repository-url>
cd live-chat-agent
```

### 2. Install Dependencies

```bash
# Backend
cd backend-scripts
pnpm install

# Frontend
cd ../web
pnpm install
```

### 3. Configure Environment Variables

```bash
# Backend
cd backend-scripts
cp .env.example .env
# Edit .env with your values (see Environment Variables section)

# Frontend
cd ../web
cp .env.example .env
# Edit .env with your values
```

### 4. Setup Database

**PostgreSQL (Neon Cloud - Recommended)**
- Sign up at [Neon](https://neon.tech/)
- Create a project and copy the connection string
- Add to `.env` as `DATABASE_URL`

**Run Prisma Migrations**
```bash
cd backend-scripts
pnpm prisma migrate dev
pnpm prisma generate
```

### 5. Start Redis

**Option A: Local Redis**
```bash
redis-server
```

**Option B: Redis Cloud**
- Sign up at [Redis Cloud](https://redis.com/try-free/)
- Create a database and copy connection details

### 6. Run the Application

```bash
# Terminal 1: Backend
cd backend-scripts
pnpm dev

# Terminal 2: Frontend
cd web
pnpm dev
```

### 7. Open the App

Navigate to `http://localhost:5173` in your browser.

---

## Environment Variables

### Backend (`backend-scripts/.env`)

```env
# Server
PORT=4000

# PostgreSQL Database (Neon Cloud)
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require

# Redis Configuration
REDIS_HOST=localhost                    # Or your Redis Cloud host
REDIS_PORT=6379                         # Or your Redis Cloud port
REDIS_USERNAME=default
REDIS_PASSWORD=your_redis_password      # Leave empty for local

# Google Gemini AI
GEMINI_API_KEY=AIzaSy...                # Get from Google AI Studio
GEMINI_MODEL=gemini-2.5-flash           # Or gemini-1.5-pro-002

# Optional
HISTORY_MAX=200                         # Max messages per session
```

### Frontend (`web/.env`)

```env
VITE_API_URL=http://localhost:4000
VITE_SOCKET_IO_URL=http://localhost:4000
```

### Getting API Keys

| Service              | How to Get |
|---------|------------|
| **Gemini API**       | [Google AI Studio](https://aistudio.google.com/apikey) → Create API Key |
| **Neon DB**          | [Neon Cloud](https://neon.tech/) → Create Project → Copy Connection String |
| **Redis Cloud**      | [Redis Cloud](https://redis.com/try-free/) → Create Free Database |

---

## Database Setup

This project uses **two databases**:
- **PostgreSQL (Neon Cloud)**: Persistent storage via Prisma ORM
- **Redis Cloud**: Session-based chat history cache

### PostgreSQL with Prisma

**1. Prisma Schema** (`prisma/schema.prisma`)
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Example model
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
}
```

**2. Run Migrations**
```bash
# Create and apply migrations
pnpm prisma migrate dev --name init

# Generate Prisma Client
pnpm prisma generate

# View database in browser
pnpm prisma studio
```

### Redis (Chat History Cache)

**Schema Pattern**
```
Key Pattern: session:{sessionId}
Type: List
Data: JSON-serialized messages [{role, content}, ...]
```

Redis is schema-less - sessions are created automatically on first message.

**Data Management**
```bash
# Clear all sessions (via Redis CLI)
redis-cli FLUSHDB

# Clear specific session
redis-cli DEL session:{sessionId}
```

---

## LLM Configuration

### Provider: Google Gemini

We use **Google Gemini AI** (`gemini-2.5-flash`) for generating responses.

### System Prompt

The AI is configured as an e-commerce customer support agent:

```
You are a friendly and professional customer support agent for 
Ecommerce Marketplace, a small e-commerce store specializing in 
electronics, home goods, and lifestyle products.

Guidelines:
- Order Issues: Ask for order number
- Returns/Refunds: 30-day return policy
- Shipping: Standard 3-5 days, Express 1-2 days
- Response Style: Under 150 words, use bullet points
```

### Prompting Strategy

1. **System Instruction**: Passed via Gemini's `systemInstruction` config
2. **Conversation History**: Last 20 messages included for context
3. **Cost Control**: Max 1024 output tokens per response

### API Call Flow

```typescript
ai.models.generateContentStream({
  model: 'gemini-2.5-flash',
  contents: conversationHistory,
  config: {
    systemInstruction: SYSTEM_PROMPT,
    maxOutputTokens: 1024,
    temperature: 0.7,
  }
});
```

### Error Handling

- **Rate Limits**: Friendly message asking user to wait
- **API Key Issues**: Generic error without exposing details
- **Safety Filters**: Polite refusal message
- **Model Not Found**: Suggestion to try again later

---

## Trade-offs & Future Improvements

### Current Trade-offs

| Decision | Trade-off |
|----------|-----------|
| Redis for storage | Fast but no complex queries; data loss if not persisted |
| Single model | No fallback if Gemini is unavailable |
| Client-side session ID | User can lose history if localStorage cleared |
| No authentication | Suitable for demo; production needs auth |

### If I Had More Time...

**Feature Enhancements:**
- [ ] User authentication with JWT
- [ ] Admin dashboard for viewing all conversations
- [ ] Multiple AI provider fallback (OpenAI, Anthropic)
- [ ] Message reactions and feedback
- [ ] File/image upload support
- [ ] Typing indicators for AI

**Technical Improvements:**
- [ ] Rate limiting per session
- [ ] Redis cluster for high availability
- [ ] Kubernetes deployment configs
- [ ] Comprehensive test suite (Jest, Cypress)
- [ ] OpenTelemetry observability
- [ ] Webhook integrations (Slack, Discord)

**Performance:**
- [ ] Response caching for common questions
- [ ] Connection pooling for Redis
- [ ] Load balancing for Socket.IO

**Documents & Articles used for references:**
- [v7 Instantiating Prisma Client doc](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/instantiate-prisma-client)  
- [v7 Prisma Client API reference](https://www.prisma.io/docs/orm/reference/prisma-client-reference#datasourceurl)  
- [upgrade to orm7 doc](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)   
- [redis in-house free-cloud instance link](https://cloud.redis.io/#/databases)  
- [Github issue raised for prisma - for PrismaClient fails to instantiate in ESM environment - and solving it with using adapters for particular dbs and connectionStrings required](https://github.com/prisma/prisma/issues/28670)  
- [Redis Error github discussion](https://github.com/redis/node-redis/issues/1865)
- [Google GenAI Legacy model error discussion](https://github.com/cline/cline/issues/918)
---

## License

MIT License - Feel free to use this project for learning or production.

---

## Acknowledgments

- [Google Gemini AI](https://ai.google.dev/)
- [Socket.IO](https://socket.io/)
- [Shadcn/UI](https://ui.shadcn.com/)
- [Redis](https://redis.io/)
- [Neon](https://neon.tech/)
- [Prisma](https://prisma.io/)
- [pnpm](https://pnpm.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
