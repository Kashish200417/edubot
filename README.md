# EduBot - AI-Powered Educational Chatbot

A web-based intelligent tutoring system powered by Google Gemini AI. EduBot provides personalized educational support across multiple subjects with secure user authentication and conversation persistence.

## ✨ Features

- **AI-Powered Tutoring**: Leverages Google Gemini 2.5 Flash for intelligent, context-aware responses
- **Multi-Subject Support**: Engage with AI tutors across different academic domains
- **User Authentication**: Secure login/registration with bcrypt password hashing
- **Conversation Persistence**: Chat history stored locally in SQLite database
- **Subject-Specific Context**: AI responses tailored to selected subject matter
- **Session Management**: Secure session handling with express-session
- **Responsive UI**: Modern, clean interface with Tailwind CSS styling

## 🛠️ Tech Stack

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **SQLite** - Lightweight relational database
- **@google/genai** - Google Gemini API client

### Frontend

- **EJS** - Embedded JavaScript templating engine
- **Tailwind CSS** - Utility-first CSS framework
- **Vanilla JavaScript** - Client-side interactivity

### Security & Authentication

- **bcrypt** - Password hashing
- **express-session** - Session management
- **dotenv** - Environment variable management

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Google Gemini API key (get it from [Google AI Studio](https://aistudio.google.com/))

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ai-chatbot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment variables**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:

   ```
   GOOGLE_API_KEY=your_gemini_api_key_here
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the application**

   ```bash
   # Development mode (with hot reload)
   npm run dev

   # Production mode
   npm start
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## 📖 Usage

### Register & Login

1. Visit the home page and click "Register"
2. Create an account with a username and password
3. Login with your credentials

### Start Chatting

1. After login, select your desired subject (e.g., Computer Science, Mathematics, Biology)
2. Type your question or topic
3. Get AI-powered responses from your personalized tutor
4. Your conversation history is automatically saved

### Chat Features

- View previous conversations grouped by subject
- Continue learning with context from past messages
- Switch between subjects freely
- Real-time AI responses

## 📁 Project Structure

```
ai-chatbot/
├── server.js              # Main Express.js server
├── db.js                  # SQLite database setup
├── package.json           # Project dependencies
├── .env.example           # Environment variable template
├── .gitignore             # Git ignore patterns
├── README.md              # This file
├── SYSTEM_DESIGN.md       # Detailed system architecture
├── public/                # Static assets
│   ├── css/
│   │   └── style.css      # Custom styling
│   └── js/
│       └── app.js         # Client-side JavaScript
└── views/                 # EJS template files
    ├── index.ejs          # Home page
    ├── login.ejs          # Login page
    ├── register.ejs       # Registration page
    ├── chat.ejs           # Main chat interface
    └── partials/
        ├── header.ejs     # Header component
        └── footer.ejs     # Footer component
```

## 🔧 API Endpoints

| Method | Endpoint    | Description                      |
| ------ | ----------- | -------------------------------- |
| GET    | `/`         | Home page                        |
| GET    | `/login`    | Login page                       |
| POST   | `/login`    | User login                       |
| GET    | `/register` | Registration page                |
| POST   | `/register` | Create new user account          |
| GET    | `/chat`     | Main chat interface (protected)  |
| POST   | `/api/chat` | Send message and get AI response |
| GET    | `/logout`   | User logout                      |

## 🔐 Security Considerations

- Passwords are hashed using bcrypt before storage
- Session cookies are used for authenticated requests
- API keys should never be committed to version control (use `.env` file)
- In production, enable `secure: true` in session cookie configuration for HTTPS
- Keep dependencies updated with `npm audit` and `npm update`

## 📝 Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Google Gemini API
GOOGLE_API_KEY=your_gemini_api_key

# Server Configuration
PORT=3000
NODE_ENV=development

# Session Configuration (optional)
SESSION_SECRET=your-secret-key-here
```

## 🐛 Troubleshooting

### Database Issues

- Delete `database.sqlite` to reset the database
- Database will be recreated on next server start

### API Key Errors

- Verify your Google Gemini API key is valid
- Check that the API key is correctly set in `.env`
- Ensure the key has access to the Gemini API

### Port Already in Use

- Change the PORT in `.env` file
- Or kill the process using the current port

## 📚 Development

### Running in Development Mode

```bash
npm run dev
```

This uses `nodemon` for automatic server restart on file changes.

### Project Composition

- Check `SYSTEM_DESIGN.md` for detailed architecture documentation
- Refer to code comments for implementation details

## 📦 Dependencies

Run `npm list` to see all installed packages or check `package.json` for the complete list.

Key dependencies:

- `express`: Web framework
- `sqlite3`: Database
- `@google/genai`: AI API
- `bcrypt`: Password hashing
- `express-session`: Session management
- `ejs`: Template engine

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [Google Gemini API Docs](https://ai.google.dev/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)

## 📧 Support

For issues, questions, or suggestions, please open an issue in the repository.

---

**Happy learning! 🚀**
