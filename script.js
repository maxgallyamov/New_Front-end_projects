const socket = new WebSocket('ws://yourserver.com');
const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const mediaButton = document.getElementById('media-button');
const fileButton = document.getElementById('file-button');
const mediaInput = document.getElementById('media-input');
const fileInput = document.getElementById('file-input');
const typingIndicator = document.getElementById('typing-indicator');
const searchInput = document.getElementById('search-input');

sendButton.addEventListener('click', sendMessage);
mediaButton.addEventListener('click', () => mediaInput.click());
fileButton.addEventListener('click', () => fileInput.click());
mediaInput.addEventListener('change', sendMedia);
fileInput.addEventListener('change', sendFile);
chatInput.addEventListener('input', () => {
    socket.send(JSON.stringify({ type: 'typing', user: 'username' }));
});
searchInput.addEventListener('input', searchMessages);

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);

    if (data.type === 'typing') {
        showTypingIndicator(data.user);
    } else if (data.type === 'message') {
        addMessageToChat(data.message, data.user, data.isUser);
    }
};

function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
        addMessageToChat(message, 'username', true);
        socket.send(JSON.stringify({ type: 'message', message, user: 'username', isUser: true }));
        chatInput.value = '';
        saveChatHistory();
    }
}

function sendMedia(event) {
    const file = event.target.files[0];
    if (file) {
        const mediaElement = document.createElement(file.type.startsWith('image') ? 'img' : file.type.startsWith('video') ? 'video' : 'audio');
        mediaElement.src = URL.createObjectURL(file);
        mediaElement.controls = true;
        mediaElement.style.maxWidth = '100%';
        mediaElement.style.marginTop = '10px';
        addMessageToChat(mediaElement.outerHTML, 'username', true);
        socket.send(JSON.stringify({ type: 'message', message: mediaElement.outerHTML, user: 'username', isUser: true }));
        saveChatHistory();
    }
}

function sendFile(event) {
    const file = event.target.files[0];
    if (file) {
        const fileElement = document.createElement('a');
        fileElement.href = URL.createObjectURL(file);
        fileElement.download = file.name;
        fileElement.textContent = `Download ${file.name}`;
        addMessageToChat(fileElement.outerHTML, 'username', true);
        socket.send(JSON.stringify({ type: 'message', message: fileElement.outerHTML, user: 'username', isUser: true }));
        saveChatHistory();
    }
}

function showTypingIndicator(user) {
    typingIndicator.textContent = `${user} is typing...`;
    setTimeout(() => { typingIndicator.textContent = ''; }, 3000);
}

function addMessageToChat(message, user, isUser) {
    const messageElement = document.createElement('div');
    messageElement.innerHTML = message;
    messageElement.classList.add('message', isUser ? 'user-message' : 'contact-message');
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function saveChatHistory() {
    localStorage.setItem('chatHistory', chatBox.innerHTML);
}

function loadChatHistory() {
    const history = localStorage.getItem('chatHistory');
    if (history) {
        chatBox.innerHTML = history;
    }
}

function searchMessages() {
    const query = searchInput.value.toLowerCase();
    const messages = chatBox.querySelectorAll('.message');
    messages.forEach(message => {
        if (message.textContent.toLowerCase().includes(query)) {
            message.style.display = '';
        } else {
            message.style.display = 'none';
        }
    });
}

// Load chat history on page load
loadChatHistory();

// Simulate receiving a message for demonstration
setTimeout(() => socket.onmessage({ data: JSON.stringify({ type: 'message', message: 'Hello! How can I help you?', user: 'contact', isUser: false }) }), 2000);
