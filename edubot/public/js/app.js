document.addEventListener('DOMContentLoaded', () => {
    const subjectSelect = document.getElementById('subject-select');
    const chatHistory = document.getElementById('chat-history');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const currentSubjectTitle = document.getElementById('current-subject-title');
    const initialLoader = document.getElementById('initial-loader');
    const errorMsgContainer = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if(this.value.trim() === '') {
            this.style.height = 'auto';
        }
    });

    // Enter to submit (Shift+Enter for new line)
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (this.value.trim() !== '') {
                chatForm.dispatchEvent(new Event('submit'));
            }
        }
    });

    // Load history when subject changes
    subjectSelect.addEventListener('change', (e) => {
        const subject = e.target.value;
        currentSubjectTitle.textContent = subject;
        loadHistory(subject);
    });

    // Marked options for safe parsing
    marked.setOptions({
        headerIds: false,
        mangle: false,
        breaks: true,
        highlight: function (code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(code, { language: lang }).value;
                } catch (err) {}
            }
            return hljs.highlightAuto(code).value;
        }
    });

    function showError(msg) {
        errorText.textContent = msg;
        errorMsgContainer.classList.remove('hidden');
        
        // Next frame to trigger transition
        requestAnimationFrame(() => {
            errorMsgContainer.classList.remove('opacity-0', 'translate-y-4');
            errorMsgContainer.classList.add('opacity-100', 'translate-y-0');
        });

        setTimeout(() => {
            errorMsgContainer.classList.remove('opacity-100', 'translate-y-0');
            errorMsgContainer.classList.add('opacity-0', 'translate-y-4');
            setTimeout(() => errorMsgContainer.classList.add('hidden'), 300);
        }, 5000);
    }

    function renderMessage(role, content) {
        const div = document.createElement('div');
        div.className = `flex gap-4 w-full message-appear ${role === 'user' ? 'flex-row-reverse' : ''}`;
        
        // Avatar
        const avatarColor = role === 'user' ? 'bg-gray-900 border-gray-700' : 'bg-gradient-to-br from-brand-500 to-blue-600 border-transparent shadow-brand-500/30 shadow-lg';
        const avatarInitial = role === 'user' ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>` : 'E';
        
        // Markdown parsing
        let parsedContent = marked.parse(content);

        // Bubble styles
        const bubbleStyle = role === 'user' 
            ? 'bg-gray-900 text-white rounded-2xl rounded-tr-sm user-message-body shadow-md border border-gray-800' 
            : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm shadow-md border border-gray-100';

        div.innerHTML = `
            <div class="w-9 h-9 shrink-0 flex items-center justify-center text-white ${avatarColor} rounded-xl font-bold text-sm border shadow-sm">
                ${avatarInitial}
            </div>
            <div class="max-w-[85%] sm:max-w-[75%] px-5 py-4 ${bubbleStyle}">
                <div class="markdown-body text-sm font-medium">${parsedContent}</div>
            </div>
        `;
        
        chatHistory.appendChild(div);
        
        // re-apply syntax highlighting to newly added DOM elements
        div.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });

        scrollToBottom();
    }

    function scrollToBottom() {
        const container = document.getElementById('chat-container');
        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
        });
    }

    async function loadHistory(subject) {
        chatHistory.innerHTML = '';
        initialLoader.classList.remove('hidden');
        
        try {
            const res = await fetch(`/api/chat/${encodeURIComponent(subject)}`);
            if (!res.ok) throw new Error('Failed to fetch history');
            
            const data = await res.json();
            
            if (data.length === 0) {
                // Initial greeting from bot
                renderMessage('model', `Hello! I am your **${subject}** tutor. How can I help you learn today?`);
            } else {
                data.forEach(msg => renderMessage(msg.role, msg.content));
            }
            
        } catch (err) {
            showError("Could not load chat history.");
            renderMessage('model', `Hello! I am your **${subject}** tutor. How can I help you learn today?`);
        } finally {
            initialLoader.classList.add('hidden');
            scrollToBottom();
        }
    }

    // Initial load
    currentSubjectTitle.textContent = subjectSelect.value;
    loadHistory(subjectSelect.value);

    function createTypingIndicator() {
        const div = document.createElement('div');
        div.id = 'typing-indicator';
        div.className = `flex gap-4 w-full message-appear mb-4`;
        
        div.innerHTML = `
            <div class="w-9 h-9 shrink-0 flex items-center justify-center text-white bg-gradient-to-br from-brand-500 to-blue-600 border-transparent shadow-brand-500/30 shadow-lg rounded-xl font-bold text-sm border">
                E
            </div>
            <div class="px-5 py-4 bg-white text-gray-800 rounded-2xl rounded-tl-sm shadow-md border border-gray-100 flex items-center gap-1.5 h-[52px]">
                <div class="w-2 h-2 rounded-full bg-brand-400 typing-dot"></div>
                <div class="w-2 h-2 rounded-full bg-brand-400 typing-dot"></div>
                <div class="w-2 h-2 rounded-full bg-brand-400 typing-dot"></div>
            </div>
        `;
        chatHistory.appendChild(div);
        scrollToBottom();
        return div;
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = messageInput.value.trim();
        const subject = subjectSelect.value;

        if (!message) return;

        // Optimistic UI update
        renderMessage('user', message);
        messageInput.value = '';
        messageInput.style.height = 'auto'; // Reset height
        
        sendBtn.disabled = true;
        messageInput.disabled = true;

        const indicator = createTypingIndicator();

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, subject })
            });

            const data = await res.json();
            
            indicator.remove();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to get response');
            }

            renderMessage('model', data.content);

        } catch (err) {
            indicator.remove();
            showError(err.message || 'An error occurred while communicating with EduBot.');
        } finally {
            sendBtn.disabled = false;
            messageInput.disabled = false;
            messageInput.focus();
        }
    });

});
