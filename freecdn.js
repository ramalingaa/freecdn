let showChat = false;
let socket = null;
let messages = [];
let isChatOpenedFirstTime = true;
let isLoaded = false;

const chatMainContainer = document.getElementById("circuitry-advisor");
const chatContainer = document.getElementById("chat-container");
const chatButton = document.getElementById("chat-button");

document.addEventListener('DOMContentLoaded', function () {
    createChatContainerAndButton();
    injectCSS()
});
function injectCSS() {
    
    const style = document.createElement('style');
    style.textContent = `
        body,p,h1,h2,h3,h4,h5,h6 {
            margin: 0;
            padding: 0;
            font-family: "Poppins", sans-serif;
            box-sizing: border-box;
        }
        #circuitry-advisor {
            position: fixed;
            bottom: 20px;
            right: 20px;
        }
        .display-none {
            display: none;
        }
        #chat-button {
            position: absolute;
            bottom: -20px;
            right: 0;
            background-color: transparent;
            border: 0;
            outline: 0;
            cursor: pointer;
        }
        #chat-container {
            width: 500px;
            height: 550px;
            /* border: 1px solid rgb(217, 209, 209); */
        }
        .chat-header {
            background-color: white;
        }
        .chat-header {
            display: flex;
            flex-direction: column;
            padding: 5px 10px;
            gap: 10px;

        }
        .chat-header-text {
            font-weight: bold;
        }
        .chat-header-container {
            display: flex;
            justify-content: space-between;
            padding: 5px;
            border: 1px solid rgb(217, 209, 209);
            align-items: center;

        }
        .today-msg {
            text-align: center;
            margin-top: 1rem;
        }
        .welcome-message {
            margin-top: 1rem;
            padding-left: 10px;
        }
        #close-chat {
            background-color: rgb(0 58 121);
            outline: 0;
            border:0;
            margin-right: 10px;
            font-size: 0.875rem;
            line-height: 1.25rem;
            height: 1.5rem;
            width: 1.5rem;
            color: white;
            border-radius: 9999px;
            cursor: pointer;
        }
        .chat-message-container {
            position: relative;
            height: 472px;
            border: 1px solid rgb(217, 209, 209);
            overflow-y: auto;


        }
        .chat-input-container {
            position: sticky;
            bottom: 0;
            height: max-content;
            width: 100%;
            display: flex;

        }
        .chat-input-container > input {
            flex:1;
            padding: 10px;
            border: 1px solid rgb(217, 209, 209);
        }
        .send-button {
            background-color: transparent;
            border: 0;
            outline: 0;
            background-color: rgb(221 51 153);
            opacity: 0.8;
        }
        .chat-message {
            padding: 8px;
            margin: 4px;
            border-radius: 8px;
            max-width: 80%;
            white-space: pre-line;
        }

.user-message {
    background-color: rgb(12 74 110); /* Light green, typical for outgoing messages */
    align-self: flex-end;
    text-align: right;
}
.user-message, .bot-message {
    color: white;
}

.bot-message {
    background-color: rgb(12 74 110); /* White, typical for incoming messages */
    align-self: flex-start;
    text-align: left;
}

.chat-messages {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    height: calc(100% - 37px);
}
.chat-messages:last-child {
    margin-bottom: 50px;
}
.chat-messaage {
    margin-bottom: 10px;
}
.loader {
   
    margin: 0 auto;

}
    `;
    document.head.appendChild(style);

    const chatHtml = `
        <!-- Your chat HTML structure here -->
        <button id="chat-button">Chat</button>
        <div id="chat-container" class="display-none">
            <!-- Chat UI components -->
        </div>
    `;
    // hostContainer.innerHTML = chatHtml;

    // setupSocketConnection();
    // setupEventListeners();
}

function setupEventListeners() {
    const closeIcon = document.getElementById('close-chat');
    const sendButton = document.getElementById('send-button');
    const input = document.getElementById('chat-input');

    if (closeIcon) {
        closeIcon.addEventListener('click', () => {
            closeChat();
        });
    } else {
        console.error('Close chat button not found');
    }

    if (sendButton) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendButton.click();
            }
        });
        sendButton.addEventListener('click', () => {
            const input = document.getElementById('chat-input');
            console.log('Message sent:', input.value);
            sendMessage(input.value);
            input.value = '';
        });
    } else {
        console.error('Send button not found');
    }
}


function createChatContainerAndButton() {
    const chatButton = document.createElement("button");
    chatButton.id = "chat-button";
    chatButton.classList.add('chat-button');
    chatButton.innerHTML = `<svg width="42" height="43" viewBox="0 0 42 43" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="42" height="42.7331" rx="10" fill="url(#paint0_linear_764_24569)"/>
    <path d="M26.3344 20.6726C26.39 20.3121 26.4189 19.9428 26.4189 19.5667C26.4189 15.5902 23.1911 12.3667 19.2094 12.3667C15.2278 12.3667 12 15.5902 12 19.5667C12 20.465 12.1647 21.3248 12.4656 22.1178C12.5281 22.2824 12.5594 22.3648 12.5735 22.4291C12.5876 22.4928 12.593 22.5376 12.5946 22.6028C12.5961 22.6686 12.5872 22.7412 12.5695 22.8862L12.209 25.8294C12.17 26.148 12.1505 26.3073 12.2032 26.4231C12.2494 26.5246 12.3315 26.6052 12.4334 26.6493C12.5498 26.6996 12.7078 26.6763 13.0238 26.6297L15.8755 26.2095C16.0244 26.1876 16.0989 26.1766 16.1667 26.177C16.2337 26.1774 16.2802 26.1824 16.3458 26.1962C16.4122 26.2103 16.4969 26.2422 16.6665 26.306C17.4573 26.6038 18.3143 26.7667 19.2094 26.7667C19.5838 26.7667 19.9516 26.7382 20.3106 26.6832M24.9581 30.3667C22.3037 30.3667 20.1518 28.1505 20.1518 25.4167C20.1518 22.6829 22.3037 20.4667 24.9581 20.4667C27.6125 20.4667 29.7644 22.6829 29.7644 25.4167C29.7644 25.9662 29.6774 26.4948 29.5169 26.9888C29.4491 27.1975 29.4152 27.3019 29.404 27.3732C29.3924 27.4477 29.3904 27.4895 29.3947 27.5647C29.3989 27.6368 29.4168 27.7183 29.4527 27.8812L30 30.3667L27.3188 29.9986C27.1724 29.9785 27.0993 29.9685 27.0354 29.9689C26.9681 29.9694 26.9324 29.973 26.8664 29.9862C26.8037 29.9988 26.7106 30.0319 26.5242 30.098C26.0333 30.2721 25.5064 30.3667 24.9581 30.3667Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
    <defs>
    <linearGradient id="paint0_linear_764_24569" x1="0" y1="21.3666" x2="42" y2="21.3666" gradientUnits="userSpaceOnUse">
    <stop stop-color="#D4007E"/>
    <stop offset="1" stop-color="#003A79"/>
    </linearGradient>
    </defs>
    </svg>
    `;
    chatButton.onclick = toggleChat;
    chatMainContainer.appendChild(chatButton);

    const chatContainer = document.createElement("div");
    chatContainer.id = "chat-container";
    chatContainer.classList.add('display-none')
    chatMainContainer.appendChild(chatContainer);
}

function openChat() {
    const chatContainer = document.getElementById("chat-container");
    chatContainer.classList.remove('display-none')
    if (isChatOpenedFirstTime) {
        createChatUIHeader()
        createChatMessageInterface();
        isChatOpenedFirstTime = false;
        setupEventListeners();
    }
    socket = io('https://mfwsdev.circuitry.ai', {
        path: '/socket.io/',
        query: {
            EIO: 4,
            transport: 'polling',
            t: 'OyAeEEk'
        }
    });

    // Handle incoming messages
    socket.on('bot_uttered', (msg) => {
        let botResponse;
        try {
            console.log('in try',msg.text.replace(/\n/g, '\\\\n'))

            msg = JSON.parse(msg.text);
            botResponse = msg.predictions[0].answer
        } catch (e) {
            console.error('Error parsing bot message:', e);
            botResponse = msg.text;
        }
        const botMessage = { text: botResponse, sender: 'bot' };  // Assuming the message object has a 'text' field
        messages.push(botMessage);
        displayLoader(false);
        updateChatUI(botMessage);
    });

    hideChatButton();
}

function closeChat() {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
        chatContainer.classList.add('display-none');
    }
    showChat = false;
    if (socket) {
        socket.close();
        socket = null;
        console.log("Chat and socket connection closed.");  // Optional: console feedback
    } else {
        console.log("No active socket connection to close.");  // Optional: console feedback
    }
    showChatButton();
}

function toggleChat() {
    if (!showChat) {
        openChat();

    } else {
        closeChat();
    }
}

function createChatUIHeader() {
    const chatContainer = document.getElementById("chat-container");

    const chatHeader = document.createElement("div");
    chatHeader.classList.add("chat-header-container");
    chatHeader.innerHTML = `
        <div id="chat-header" class='chat-header'>
            <span class="chat-header-text">Circuitry Advisor</span>
            <span class="chat-header-subtext">Active now</span>
        </div>
        <button id="close-chat" onclick="closeChat()">X</button>
    `;
    chatContainer.appendChild(chatHeader);
}
function createChatMessageInterface() {
    const chatContainer = document.getElementById("chat-container");

    const chatInterface = document.createElement("div");
    chatInterface.classList.add("chat-message-container");
    chatInterface.innerHTML = `
            <div id="chat-messages" class="chat-messages">
                    <p class="today-msg">Today</p>
                    <p class="welcome-message">Hello! 👋 How can I assist you today?</p>
            </div>
            <div class="chat-input-container">
                <input id="chat-input" class="chat-input" type="text" placeholder="Type your message here..." />
                <button id="send-button" class="send-button">
                <svg stroke="white" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="text-white" height="18" width="18" xmlns="http://www.w3.org/2000/svg"><path d="m3 3 3 9-3 9 19-9Z"></path><path d="M6 12h16"></path></svg>
                </button>
            </div>
    `;
    chatContainer.appendChild(chatInterface);
}
// send message to the bot
function sendMessage(message) {
    
    if (socket && socket.connected) {
        const userMessage = { text: message, sender: 'user' };  // Structured message object
        socket.emit('user_uttered', {
            message: message,
            session_id: socket.id
        });
        messages.push(userMessage);
        updateChatUI(userMessage); 
        displayLoader(true);
    } else {
        console.log("Socket is not connected.");
        
    }
}

function displayLoader(isLoading) {
    if(isLoading) {
        const chatMessages = document.getElementById("chat-messages");
        const loader = document.createElement("div");
        loader.classList.add("loader");
        loader.innerHTML = "Loading...."
        chatMessages.appendChild(loader);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to latest message
    } else {
        const loader = document.querySelector(".loader");
        if (loader) {
            loader.remove();
        }
    }
}
function updateChatUI(msg) {
    const messagesContainer = document.getElementById("chat-messages");
    const messageElement = document.createElement("pre");
    messageElement.classList.add("chat-message");
    if (msg.sender === 'user') {
        messageElement.classList.add("user-message");
        messageElement.textContent = msg.text;
    } else {
        messageElement.classList.add("bot-message");
        messageElement.textContent = msg.text;
    }
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto-scroll to latest message
}
function hideChatButton() {
    const chatButton = document.getElementById("chat-button");
    if (chatButton) {
        chatButton.classList.add('display-none');
    }
}
function showChatButton() {
    const chatButton = document.getElementById("chat-button");
    if (chatButton) {
        chatButton.classList.remove('display-none');
    }
}

