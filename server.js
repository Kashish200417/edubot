const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'edubot-super-secret-key-123',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // in prod use true for https
}));

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
};

// Routes
app.get('/', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/chat');
    }
    res.render('index');
});

app.get('/login', (req, res) => {
    if (req.session.userId) return res.redirect('/chat');
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) return res.status(500).send('Database error');
        if (!user) return res.render('login', { error: 'Invalid username or password' });

        const match = await bcrypt.compare(password, user.password_hash);
        if (match) {
            req.session.userId = user.id;
            req.session.username = user.username;
            res.redirect('/chat');
        } else {
            res.render('login', { error: 'Invalid username or password' });
        }
    });
});

app.get('/register', (req, res) => {
    if (req.session.userId) return res.redirect('/chat');
    res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash], function(err) {
            if (err) {
                return res.render('register', { error: 'Username already exists' });
            }
            req.session.userId = this.lastID;
            req.session.username = username;
            res.redirect('/chat');
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/chat', isAuthenticated, (req, res) => {
    res.render('chat', { username: req.session.username });
});

// API Routes for Chat
app.get('/api/chat/:subject', isAuthenticated, (req, res) => {
    const subject = req.params.subject;
    db.all('SELECT role, content FROM chats WHERE user_id = ? AND subject = ? ORDER BY timestamp ASC', [req.session.userId, subject], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.post('/api/chat', isAuthenticated, async (req, res) => {
    const { message, subject } = req.body;
    const userId = req.session.userId;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(500).json({ error: 'API Key is not configured on the server' });
    if (!message) return res.status(400).json({ error: 'Message is required' });

    // Save user message
    db.run('INSERT INTO chats (user_id, subject, role, content) VALUES (?, ?, ?, ?)', [userId, subject, 'user', message]);

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });

        // Retrieve history context
        db.all('SELECT role, content FROM chats WHERE user_id = ? AND subject = ? ORDER BY timestamp ASC LIMIT 20', [userId, subject], async (err, rows) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            const historyContents = rows.map(r => ({
                role: r.role === 'model' ? 'model' : 'user',
                parts: [{ text: r.content }]
            }));

            // Exclude the current user message that we just saved from the history we fetched
            const previousMessages = historyContents.slice(0, historyContents.length - 1);

            // Add the new message to the contents array
            previousMessages.push({
                role: 'user',
                parts: [{ text: message }]
            });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: previousMessages,
                config: {
                    systemInstruction: `You are an expert ${subject} tutor. Your goal is to educate, explain concepts clearly, and guide the student. Use markdown for formatting.`
                }
            });

            const responseText = response.text;

            // Save AI response
            db.run('INSERT INTO chats (user_id, subject, role, content) VALUES (?, ?, ?, ?)', [userId, subject, 'model', responseText]);

            res.json({ role: 'model', content: responseText });
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to communicate with AI', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
