# EduBot - System Design Document

## 1. Introduction
**EduBot** is a web-based, AI-powered educational chatbot designed to act as a personalized tutor for students. It allows users to interact with an AI expert in various academic subjects (e.g., Computer Science, Mathematics, Biology). The system retains context by saving chat history locally and dynamically injects subject-specific personas into the AI model. 

This document outlines the architecture, data models, and detailed workflows of the application.

---

## 2. Technology Stack
* **Frontend:** HTML, EJS (Embedded JavaScript templating), Tailwind CSS (for styling), Vanilla JavaScript (for interactivity).
* **Backend:** Node.js, Express.js.
* **Database:** SQLite (Relational, file-based database for zero-config persistence).
* **AI Integration:** `@google/genai` (Google Gemini 2.5 Flash API).
* **Security & Auth:** `bcrypt` (password hashing), `express-session` (session management).

---

## 3. High-Level Architecture
The application follows a monolithic client-server architecture. The frontend sends HTTP requests to the Node.js Server, which acts as the orchestrator connecting the SQLite database (for state persistence) and the Google Gemini API (for AI generation).

```mermaid
graph TD
    Client[Client / Web Browser]
    Server[Node.js / Express Server]
    DB[(SQLite Database)]
    Gemini[Google Gemini API]

    Client <-->|HTTP/REST| Server
    Server <-->|SQL Queries| DB
    Server <-->|HTTPS / REST| Gemini
    
    classDef client fill:#dbeafe,stroke:#3b82f6,stroke-width:2px,color:#1e3a8a;
    classDef server fill:#dcfce7,stroke:#22c55e,stroke-width:2px,color:#14532d;
    classDef db fill:#fef08a,stroke:#eab308,stroke-width:2px,color:#713f12;
    classDef external fill:#f3e8ff,stroke:#a855f7,stroke-width:2px,color:#581c87;

    class Client client;
    class Server server;
    class DB db;
    class Gemini external;
```

---

## 4. Database Schema
EduBot employs a simple relational schema to manage users and their conversational histories. 

```mermaid
erDiagram
    USERS ||--o{ CHATS : "owns"
    
    USERS {
        INTEGER id PK "Auto-incremented"
        TEXT username "Unique identifier"
        TEXT password_hash "Bcrypt hashed password"
    }
    
    CHATS {
        INTEGER id PK "Auto-incremented"
        INTEGER user_id FK "References Users.id"
        TEXT subject "The academic subject (e.g., Biology)"
        TEXT role "Either 'user' or 'model'"
        TEXT content "The textual content of the message"
        DATETIME timestamp "Default CURRENT_TIMESTAMP"
    }
```

* **USERS Table:** Handles authentication. Passwords are never stored in plaintext.
* **CHATS Table:** Acts as the persistent memory state. By filtering by `user_id` and `subject`, the system can retrieve isolated, domain-specific conversation histories.

---

## 5. System Components & Workflows

### 5.1 Authentication Flow
1. User provides `username` and `password`.
2. Server hashes the password using `bcrypt` (for registration) or compares hashes (for login).
3. On success, an `express-session` is instantiated, and a session cookie is returned to the client.

### 5.2 Core Interaction: The Chat Flow
The most critical workflow is how the application handles user prompts, injects context, and returns AI responses.

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant Browser
    participant Express Server
    participant SQLite
    participant Gemini API

    User->>Browser: Types message & selects Subject
    Browser->>Express Server: POST /api/chat {message, subject, apiKey}
    
    activate Express Server
    Express Server->>SQLite: INSERT user message into CHATS
    SQLite-->>Express Server: Message saved
    
    Express Server->>SQLite: SELECT last N messages WHERE user_id AND subject
    SQLite-->>Express Server: Returns History Array
    
    Express Server->>Express Server: Format history for Gemini SDK & Inject systemInstruction
    
    Express Server->>Gemini API: generateContent(history + message)
    activate Gemini API
    Gemini API-->>Express Server: AI Text Response
    deactivate Gemini API
    
    Express Server->>SQLite: INSERT AI response into CHATS
    SQLite-->>Express Server: Response saved
    
    Express Server-->>Browser: JSON {role: "model", content}
    deactivate Express Server
    
    Browser->>Browser: Parse Markdown to HTML
    Browser->>User: Displays message bubble
```

---

## 6. Key Design Decisions

1. **Client-Side API Key Storage:** 
   To maintain privacy and reduce server costs/liabilities, the Gemini API key is required from the user. It is stored in the browser's `localStorage` and sent with every chat request. The backend does **not** persist API keys.
   
2. **Dynamic Context Windows:** 
   To prevent the AI from losing track of the conversation, the server limits context retrieval to the last 20 messages. This ensures high relevance while preventing token overload.

3. **System Instructions (Personas):** 
   By dynamically modifying the `systemInstruction` in the Gemini configuration (`"You are an expert <subject> tutor..."`), the AI's behavior, tone, and knowledge boundaries are strictly scoped to the user's current academic focus.

4. **Server-Side Rendering (SSR) via EJS:**
   Instead of an SPA (Single Page Application) framework like React, EduBot uses EJS. This reduces the client-side bundle size, eliminates the need for complex API routing for initial page loads, and provides a highly performant initial paint.

---

## 7. Future Enhancements
* **WebSockets/Server-Sent Events:** Implementing streaming responses so the user sees the AI typing character-by-character.
* **Vector Database Retrieval (RAG):** Allowing users to upload PDF textbooks and giving the AI access to specific chapters using semantic search.
* **Authentication OAuth:** Adding options to "Login with Google/GitHub".
