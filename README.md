# ChitChat-with-AI 🚀

ChitChat-with-AI is a real-time collaborative coding and chat platform designed to simulate a professional pair-programming environment. It enables multiple users to join a shared workspace, write code together, execute it in a secure isolated environment, and communicate in real-time. 

It also features a built-in **AI Programming Mentor** (powered by Google Gemini) that guides users, explains concepts, and provides step-by-step assistance directly within the chat interface.

---

## ✨ Key Features

- **Real-Time Collaboration**: Instant chat and synchronized room state powered by Socket.IO and Redis.
- **Interactive Code Execution**: Securely compile and run code (C++, Python, Java, JS, etc.) on the backend using Docker containers. Interactive standard input/output is streamed in real-time to a web-based terminal.
- **AI Programming Mentor**: Integrated Google Gemini AI that responds to `@ai` tags in chat. It acts as a dedicated tutor, providing properly formatted markdown, line-by-line code explanations, and complexity analysis.
- **Role-Based Access Control**: Strict room ownership. Owners have exclusive rights to start/stop coding sessions, invite users, or kick members.
- **Robust Editor Experience**: Powered by the Monaco Editor, featuring syntax highlighting, code formatting, and a professional dark theme.
- **Scalable Architecture**: Clean separation of concerns with dedicated backend services for Room Management, Code Execution, AI, and Caching.

---

## 🏗️ High-Level Architecture & Workflow

The platform is composed of a React frontend and a Node.js/Express backend, heavily relying on WebSockets for real-time bidirectional communication.

```mermaid
graph TD
    Client1[User A - Frontend] <-->|Socket.IO| Backend[Node.js Server]
    Client2[User B - Frontend] <-->|Socket.IO| Backend
    Backend <-->|CRUD/Auth| MongoDB[(MongoDB Atlas)]
    Backend <-->|State/PubSub| Redis[(Redis)]
    
    subgraph Execution Pipeline
        Backend -->|dockerode| Docker[Docker Daemon]
        Docker -->|Spawns| Containers[Isolated Execution Containers]
    end
    
    subgraph AI Pipeline
        Backend -->|@google/genai| Gemini[Google Gemini API]
    end
```

### Core Workflows

1. **Chat & AI Mentorship**: 
   When a user sends a chat message, it goes to the Chat System via Socket.IO. If the message begins with the `@ai` tag, the backend seamlessly forwards the prompt to the isolated `AIService`. The AI's response is safely parsed, saved to Redis, and broadcasted back to all clients in the room as a beautifully formatted markdown chat bubble.
2. **Interactive Code Execution**:
   When the room owner initiates a coding session, the `ExecutionService` prepares a temporary workspace. A Docker container tailored to the selected language is spawned. The user's frontend terminal (xterm.js) continuously sends keystrokes via Socket.IO to the container's standard input, and the container streams the execution output back in real-time.

---

## 📂 Project Structure

```text
ChitChat-with-AI/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── config/           # Socket.IO & Axios configurations
│   │   ├── context/          # React Context (Auth/User)
│   │   ├── Pages/            # Main views (Room, Dashboard, Login)
│   │   └── index.css         # Global styles (Tailwind + Custom Markdown CSS)
│   └── package.json
│
└── backend/                  # Node.js + Express backend
    ├── Controllers/          # API route handlers
    ├── Middleware/           # JWT Auth & Validation
    ├── models/               # MongoDB Mongoose schemas
    ├── Routes/               # Express API definitions
    ├── Services/             
    │   ├── AIService.js      # AI business logic & validation
    │   ├── GeminiProvider.js # Gemini SDK infrastructure
    │   ├── RoomService.js    # Room management logic
    │   ├── RedisService.js   # Caching & Session state
    │   └── Execution/        # Code execution & Docker management
    ├── server.js             # Socket.IO initialization & events
    └── app.js                # Express app setup
```

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), TailwindCSS, Monaco Editor, xterm.js, react-markdown
- **Backend**: Node.js, Express, Socket.IO, Dockerode
- **Databases**: MongoDB (Persistent Data), Redis (Ephemeral Chat/Session State)
- **AI Integration**: Google GenAI SDK (`gemini-2.5-flash`)
- **Execution Environment**: Docker (Containerized sandboxes for isolated code execution)

---

## 🚀 Development Phases

- **Phase 1**: Core chat infrastructure, MongoDB schemas, basic room management, and stateless code execution.
- **Phase 2**: Full AI integration, interactive streaming terminal execution, role-based ownership controls, and Markdown styling.
- **Phase 3 (Future)**: Real-time multi-cursor collaborative editing (CRDTs/Yjs), advanced analytics, and permanent code snippet repositories.
