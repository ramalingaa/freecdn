let showChat = false;
let socket = null;
let messages = [];
let isChatOpenedFirstTime = true;
let isAdvisorResponseLoading = false;
let advisorTitle = '';
let websocketUrl = '';
let advisorConversationStarters = []
let advisorWelcomeMessage = '';
let advisorLogo = `<svg width="25" height="32" viewBox="0 0 25 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_268_1751)">
<path d="M22.9602 24.71C23.9432 24.71 24.7402 23.9131 24.7402 22.93C24.7402 21.947 23.9432 21.15 22.9602 21.15C21.9771 21.15 21.1802 21.947 21.1802 22.93C21.1802 23.9131 21.9771 24.71 22.9602 24.71Z" fill="#D4007E"/>
<path d="M14.4898 31.37C13.7898 30.67 13.7898 29.53 14.4898 28.83L17.8598 25.47C18.5598 24.77 19.6998 24.77 20.3998 25.47C21.0998 26.17 21.0998 27.31 20.3998 28.01L17.0298 31.37C16.3298 32.07 15.1898 32.07 14.4898 31.37Z" fill="#D4007E"/>
<path d="M13.85 26.95C12.81 27.99 11.11 27.99 10.07 26.95C9.02999 25.9 9.02999 24.21 10.07 23.17L16.65 16.6C18.13 15.1 18.8 12.96 18.46 10.89C17.87 7.29999 14.46 4.85999 10.87 5.44999C7.27999 6.03999 4.83999 9.44999 5.42999 13.04C5.54999 13.79 5.95999 15.24 7.27999 16.56C7.55999 16.84 8.85999 18.16 8.85999 18.16C9.87999 19.21 9.86999 20.89 8.83999 21.92C7.80999 22.95 6.09999 22.96 5.05999 21.92C5.02999 21.89 3.72999 20.57 3.49999 20.34C1.73999 18.57 0.549989 16.29 0.159989 13.91C-0.910011 7.39999 3.49999 1.22999 10.01 0.159989C16.51 -0.910011 22.68 3.49999 23.75 10.01C24.37 13.77 23.14 17.64 20.46 20.36L20.44 20.38L13.85 26.95Z" fill="#D4007E"/>
</g>
<defs>
<clipPath id="clip0_268_1751">
<rect width="24.75" height="31.9" fill="white"/>
</clipPath>
</defs>
</svg>`;
console.log("advisorLogo", advisorLogo)
const chatMainContainer = document.getElementById("circuitry-advisor");
const chatContainer = document.getElementById("chat-container");
const chatButton = document.getElementById("chat-button");

document.addEventListener('DOMContentLoaded', function () {
    var advisorElement = document.getElementById('circuitry-advisor');
    if (advisorElement) {
        advisorTitle = advisorElement.getAttribute('data-advisor-title');
        websocketUrl = advisorElement.getAttribute('data-websocket-url');
        advisorWelcomeMessage = advisorElement.getAttribute('data-advisor-welcomeMessage');
        advisorConversationStarters = advisorElement.getAttribute('conversation_starters');
        advisorLogo = advisorElement.getAttribute('data-image');
        try {
            advisorConversationStarters = JSON.parse(advisorConversationStarters.replace(/'/g, '"'));
        } catch (e) {
            console.error('Error parsing conversation starters:', e);
            advisorConversationStarters = [];
        }
    }
    createChatContainerAndButton();
    injectCSS()
    loadSocketCDN()
});
function loadSocketCDN() {
    const script = document.createElement('script');
    script.src = 'https://cdn.socket.io/4.0.1/socket.io.min.js';
    script.onload = () => {
        console.log('Socket.io CDN loaded');
    };
    script.onerror = () => {
        console.error('Error loading Socket.io CDN');
    };
    document.head.appendChild(script);
}
function injectCSS() {
    
    const style = document.createElement('style');
    style.textContent = `
        body,p,h1,h2,h3,h4,h5,h6, #circuitry-advisor {
            margin: 0;
            padding: 0;
            font-family: "Poppins", sans-serif;
            box-sizing: border-box;
            font-weight: 400;
            font-style: normal;
        }
        button {
            cursor: pointer;
            border: 0;
            outline: 0;
            background-color: transparent;

        }
        #chat-container {
            background-color: white;
        }
        #circuitry-advisor {
            position: fixed;
            bottom: 50px;
            right: 20px;
        }
        .display-none {
            display: none !important;
        }
        #chat-button {
            position: absolute;
            bottom: -20px;
            right: 0;
            display: flex;
            align-items: center;
            gap: 1rem
        }
        #chat-container {
            width: 380px;
            height: 75vh;
            margin-bottom: 3rem;
        }
        .chat-header {
            display: flex;
            flex-direction: column;
            background-color: white;
        }
        .chat-header h3 {
            line-height: 1.5rem;
            text-transform: capitalize;

        }
        .chat-header p {
            line-height: 1.5rem;
        }
        .chat-header-text {
            font-weight: bold;
        }
        .chat-header-container {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem;
            border: 1px solid #e5e7eb;
            align-items: center;
            border-radius: 8px 8px 0 0;
            border-bottom: 2px solid #e5e7eb;
        }
        .today-msg {
            text-align: center;
            margin-top: 1rem;
            border: 1px solid #e5e7eb;
            padding: 5px 22px;
            border-radius: 20px
        }
        .welcome-message {
            margin-top: 1rem;
            padding-left: 10px;
            position: relative;
            white-space: normal !important;
        }
        .close-chat {
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
            height: 100%;
            border: 1px solid #e5e7eb;
            border-radius: 0 0 8px 8px;
            display: flex;
            flex-direction: column;


        }
        .chat-input-container {
            position: sticky;
            bottom: 0;
            height: max-content;
            display: flex;
            border-top: 1px solid #e5e7eb;
            padding: 1rem;
            justify-content: space-between;
        }
        .chat-input-container > input {
            border: 1px solid #e5e7eb;
            width: 15rem;
            height: 2.5rem;
            padding: 0 0.5rem;
            background-color: rgb(237 240 245);
            border-radius: 0.375rem;
        }
        .send-button {
            background-color: transparent;
            border: 0;
            outline: 0;
            background-color: rgb(221 51 153);
            border-radius: 9999px;
            display: flex;
            align-items: center;
        }
        .chat-message {
            padding: 0.75rem;
            border-radius: 12px;
            max-width: 80%;
            white-space: pre-line;
            margin: 0.5rem;
            position: relative;
        }

.user-message {
    background-color: rgb(12 74 110); /* Light green, typical for outgoing messages */
    align-self: flex-end;
    text-align: right;
}
.user-message {
    color: white;
}

.advisor-message {
    background-color: rgb(243 244 246); /* White, typical for incoming messages */
    align-self: flex-start;
    text-align: left;
    position: relative;
    color: black;
}

.chat-messages {
    display: flex;
    flex-direction: column;
    height: calc(100% - 76px);
    overflow-y: auto;
}
.message-container {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding-bottom: 1rem;
}
.chat-messages:last-child {
    margin-bottom: 10px;
}
.chat-messaage {
    margin-bottom: 10px;
}
.loader {
   
    margin: 0 auto;

}
.chat-btn-title {
    color: rgb(212 0 127);
    border: 1px solid rgb(212 0 127);
    border-radius: 50px;
    padding: 10px;
    width: max-content;
    background-color: white;

}
.active-now {
    background-color: rgb(34 197 94);
    border-radius: 9999px;
    width: 0.5rem;
    height: 0.5rem;
    display: inline-flex;
    margin-right: 0.25rem;
}
.flex {
    display: flex;
}
.file-upload {
    background-color: rgb(0 58 121);
    border: 0;
    border-radius: 9999px;
    display: flex;
    align-items: center;

}
.minmize-chat {
    font-size: 2rem;
}
.right-hr, .left-hr {
    width: 33.5%;
    position: absolute;
    top: 0;
    border-color: #e5e7eb;
    
}
.right-hr {
    right: 1rem;
}

.left-hr {
    left: 1rem;
}
.today-msg-container {
    text-align: center;
    margin: 1rem 0;
    position: relative;
}
hr {
    border: 0; 
    height: 1px; 
    background-color: #e5e7eb; 
}
::-webkit-scrollbar-track {
    /* box-shadow: 0 0 6px rgba(0, 0, 0, 0.3); */
    width: 4px;
    /* border: inset; */
    border-radius: 4px;
    background-color: #F4F4F8;
  }
  
  ::-webkit-scrollbar {
    width: 4px;
    height: 2px;
    background-color: rgba(245, 245, 245, 0.1);
  }
  
  ::-webkit-scrollbar-thumb {
    width: 4px;
    border-radius: 4px;
    /* box-shadow: 0 0 6px rgba(0, 0, 0, .3); */
    background-color: gray;
  }
  .welcome-message-single {
    padding: 0.5rem 0.75rem;
    background-color: hsl(240 6% 90% / 1);
    min-width: 300px;
    border-radius: 12px;
    color: #11181C;
    min-height: 50px;
    font-size: 1rem;
    line-height: 1.55rem;
}
.welcome-message-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 1rem;
    justify-content: center;


}
.btn-disabled {
    cursor: not-allowed;
    background-color: rgb(0 58 121);
    opacity: 0.5;

}
.user-chat-logo {
    width: 30px;
    height: 30px;
    position: absolute;
    top: -15px;
    right: 0;
}
.advisor-chat-logo {
    position: absolute;
    top: -20px;
    left: 0;
}

.loader {
    position: relative;
    margin: 1rem 0;
}
.loading{
    position:absolute; 
    margin: auto;
    top: 0;
    bottom: 0;
    left: 0;
    right:0;
    background: rgb(221 51 153);
    border-radius: 50%;
    /*box-shadow: 0 0 2px black;*/
    animation: loading 3s infinite;
  }
  
  .loading:nth-child(1) {
       animation-delay: 0.3s;  
      width: 4px;
      height: 4px;
      left:-22px;
        background: rgb(221 51 153);
  }
  
  .loading:nth-child(2) {
     animation-delay: 0.5s; 
      width: 4px;
      height: 4px;
  }
  
  .loading:nth-child(3) {
      animation-delay: 0.8s;
      width: 4px;
      height: 4px;
      right:-22px;
  }
  
  .loading { 
   animation-iteration-count:infinite; 
   animation-timing-function: ease-in;
  }
  
  @keyframes loading {
    0%{
    transform: translateY(0px);
    }
    20%{
    transform: translateY(0px);
    }
    30%{
    transform: translateY(-8px);
    }
    40%{
    transform: translateY(5px);
    }
    50%{
    transform: translateY(-2px);
    }
    60%{
    transform: translateY(2px);
    }
    80%{
    transform: translateY(0px);
    }
    100%{
    transform: translateY(0px);
    }
  }
`;

// Attach the created style element to the document head

document.head.appendChild(style);

}
function logError(message) {
    console.error(`Error: ${message}`);
}
function handleSendButtonClick(input) {
    if (!input.value.trim()) {
        return;
    }
    if(isAdvisorResponseLoading) {
        return;
    }
    sendMessage(input.value);
    input.value = '';
}
// Adding event listeners to the chat button and chat container
function setupEventListeners() {
    const closeIcon = document.getElementById('close-chat');
    const sendButton = document.getElementById('send-button');
    const input = document.getElementById('chat-input');
    if (!closeIcon) {
        logError('Close chat button not found');
        return;
    }
    if (!sendButton || !input) {
        logError('Send button or input field not found');
        return;
    }
    closeIcon.addEventListener('click', closeChat);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendButtonClick(input);
        }
    });
    sendButton.addEventListener('click', () => {
        handleSendButtonClick(input);
    });
}

// creates chat button and chat container
function createChatContainerAndButton() {
    const chatButton = document.createElement("button");
    chatButton.id = "chat-button";
    chatButton.classList.add('chat-button');
    chatButton.innerHTML = `<span class="chat-btn-title">${advisorTitle} AIdvisor</span>${getChatToggleSvg()}`;
    chatButton.onclick = toggleChat;

    const chatContainer = document.createElement("div");
    chatContainer.id = "chat-container";
    chatContainer.classList.add('display-none')
    chatMainContainer.appendChild(chatButton);
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
    const isMessageContainerExists = document.getElementById("message-container");
    if (!isMessageContainerExists) {
        const chatContainer = document.getElementById("chat-messages");
        const chatMessageContainer = document.createElement("div");
        chatMessageContainer.id = "message-container";
        chatMessageContainer.classList.add('message-container');
        chatMessageContainer.innerHTML = `
                        
                        <div class="today-msg-container">
                            <hr class="left-hr">
                            <span class="today-msg">Today</span>
                            <hr class="right-hr">
                        </div>
                        
        `;
        chatContainer.appendChild(chatMessageContainer);
    }
    socket = io(websocketUrl, {
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
            msg = JSON.parse(msg.text);
            botResponse = msg.predictions[0].answer.trim();
        } catch (e) {
            console.error('Error parsing bot message:', e);
            botResponse = msg.text.trim();
        }
        const botMessage = { text: botResponse, sender: 'bot' };  // Assuming the message object has a 'text' field
        messages.push(botMessage);
        isAdvisorResponseLoading = false;
        displayLoader(false);
        updateChatUI(botMessage);
    });
    const isWelcomeMessageExists = document.getElementById("welcome-message");
    if (isWelcomeMessageExists) {
        isWelcomeMessageExists.remove();
    }
    createWelcomeMessage();
    hideChatButton();
}
function closeChat() {
    const chatMessageContainer = document.getElementById("message-container");
    const chatContainer = document.getElementById("chat-container");
    chatContainer && chatContainer.classList.add('display-none');
    
    chatMessageContainer && chatMessageContainer.remove();
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
            <h3><b>AIdvisor: </b>${advisorTitle}</h3>
            <p class="chat-header-subtext"><span class="active-now"></span>Active now</p>
        </div>
        <div class="flex">
            <button id="minmize-chat" class="close-chat minmize-chat" onclick="closeChat()" title="Minimize Chat">-</button>
            <button id="close-chat" class="close-chat" onclick="closeChat()" title="Close Chat">X</button>
        </div>

    `;
    chatContainer.appendChild(chatHeader);
}
function createChatMessageInterface() {
    const chatContainer = document.getElementById("chat-container");

    const chatInterface = document.createElement("div");
    chatInterface.classList.add("chat-message-container");
    chatInterface.innerHTML = `
            <div id="chat-messages" class="chat-messages">
                    
                    <div id="message-container" class="message-container">
                        
                        <div class="today-msg-container">
                            <hr class="left-hr">
                            <span class="today-msg">Today</span>
                            <hr class="right-hr">
                        </div>
                    </div>
            </div>
            <div class="chat-input-container">
                <button id="file-upload" class="file-upload btn-disabled" disabled title="Coming Soon">
                    <svg stroke="white" fill="white" stroke-width="0" viewBox="0 0 24 24" class="text-white" height="18" width="18" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0V0z"></path><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"></path></svg>
                </button>
                <input id="chat-input" class="chat-input" type="text" placeholder="Start typing a question..." />
                <button id="send-button" class="send-button" title="Send">
                    <svg stroke="white" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="text-white" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="m3 3 3 9-3 9 19-9Z"></path><path d="M6 12h16"></path></svg>
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
        isAdvisorResponseLoading = true;
    } else {
        console.log("Socket is not connected.");
        
    }
}
function displayLoader(isLoading) {
    if(isLoading) {
        const chatMessages = document.getElementById("message-container");
        const loader = document.createElement("div");
        loader.classList.add("loader");
        loader.innerHTML = `<div id="darkblue">
        <span class="loading"></span>
        <span class="loading"></span>
        <span class="loading"></span>
      </div>`
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
    const messagesContainer = document.getElementById("message-container");
    const messageElement = document.createElement("div");
    const chatLogo = document.createElement("img");
    
    messageElement.classList.add("chat-message");
    if (msg.sender === 'user') {
        const messageTextEle = document.createElement("p");
        messageTextEle.textContent = msg.text;
        chatLogo.classList.add("user-chat-logo");
        chatLogo.src = "https://circuitry-public-assets.s3.amazonaws.com/human_image.png";
        messageElement.classList.add("user-message");
        messageElement.appendChild(messageTextEle);
        messageElement.appendChild(chatLogo);
        
    } else {
        const advisorChatLogoEle = document.createElement("div");
        advisorChatLogoEle.innerHTML = `<svg width="25" height="32" viewBox="0 0 25 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_268_1751)">
        <path d="M22.9602 24.71C23.9432 24.71 24.7402 23.9131 24.7402 22.93C24.7402 21.947 23.9432 21.15 22.9602 21.15C21.9771 21.15 21.1802 21.947 21.1802 22.93C21.1802 23.9131 21.9771 24.71 22.9602 24.71Z" fill="#D4007E"/>
        <path d="M14.4898 31.37C13.7898 30.67 13.7898 29.53 14.4898 28.83L17.8598 25.47C18.5598 24.77 19.6998 24.77 20.3998 25.47C21.0998 26.17 21.0998 27.31 20.3998 28.01L17.0298 31.37C16.3298 32.07 15.1898 32.07 14.4898 31.37Z" fill="#D4007E"/>
        <path d="M13.85 26.95C12.81 27.99 11.11 27.99 10.07 26.95C9.02999 25.9 9.02999 24.21 10.07 23.17L16.65 16.6C18.13 15.1 18.8 12.96 18.46 10.89C17.87 7.29999 14.46 4.85999 10.87 5.44999C7.27999 6.03999 4.83999 9.44999 5.42999 13.04C5.54999 13.79 5.95999 15.24 7.27999 16.56C7.55999 16.84 8.85999 18.16 8.85999 18.16C9.87999 19.21 9.86999 20.89 8.83999 21.92C7.80999 22.95 6.09999 22.96 5.05999 21.92C5.02999 21.89 3.72999 20.57 3.49999 20.34C1.73999 18.57 0.549989 16.29 0.159989 13.91C-0.910011 7.39999 3.49999 1.22999 10.01 0.159989C16.51 -0.910011 22.68 3.49999 23.75 10.01C24.37 13.77 23.14 17.64 20.46 20.36L20.44 20.38L13.85 26.95Z" fill="#D4007E"/>
        </g>
        <defs>
        <clipPath id="clip0_268_1751">
        <rect width="24.75" height="31.9" fill="white"/>
        </clipPath>
        </defs>
        </svg>`;
        advisorChatLogoEle.classList.add("advisor-chat-logo");
        const messageTextEle = document.createElement("p");
        messageTextEle.textContent = msg.text;
        messageElement.classList.add("advisor-message");
        messageElement.appendChild(messageTextEle);
        messageElement.appendChild(advisorChatLogoEle);
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

function createWelcomeMessage() {
    const chatContainer = document.getElementById("message-container");
    const welcomeFragment = document.createDocumentFragment();
    
    // Initialize a container for the welcome messages
    const welcomeContainer = document.createElement("div");
    welcomeContainer.classList.add("welcome-message-container");
    welcomeContainer.id = "welcome-message";
    // Loop through conversation starters and add them to the welcome container
    advisorConversationStarters.forEach((conversationStarter) => {
        const welcomeMessageSingleElement = document.createElement("button");
        welcomeMessageSingleElement.className = "welcome-message-single";
        welcomeMessageSingleElement.innerHTML = conversationStarter;
        welcomeMessageSingleElement.title = 'Click to send message';
        welcomeContainer.appendChild(welcomeMessageSingleElement);

        welcomeMessageSingleElement.addEventListener('click', () => {
            if(isAdvisorResponseLoading) return;
            sendMessage(conversationStarter);
        });
    });
    const welcomeMessageText = document.createElement("div");
    
    welcomeMessageText.innerHTML = `
        <div class="welcome-message chat-message advisor-message">
            <p>${advisorWelcomeMessage ? advisorWelcomeMessage : 'Hello! 👋 How can I assist you today?'}</p>
            <div class="advisor-chat-logo">
                <svg width="25" height="32" viewBox="0 0 25 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_268_1751)">
                <path d="M22.9602 24.71C23.9432 24.71 24.7402 23.9131 24.7402 22.93C24.7402 21.947 23.9432 21.15 22.9602 21.15C21.9771 21.15 21.1802 21.947 21.1802 22.93C21.1802 23.9131 21.9771 24.71 22.9602 24.71Z" fill="#D4007E"/>
                <path d="M14.4898 31.37C13.7898 30.67 13.7898 29.53 14.4898 28.83L17.8598 25.47C18.5598 24.77 19.6998 24.77 20.3998 25.47C21.0998 26.17 21.0998 27.31 20.3998 28.01L17.0298 31.37C16.3298 32.07 15.1898 32.07 14.4898 31.37Z" fill="#D4007E"/>
                <path d="M13.85 26.95C12.81 27.99 11.11 27.99 10.07 26.95C9.02999 25.9 9.02999 24.21 10.07 23.17L16.65 16.6C18.13 15.1 18.8 12.96 18.46 10.89C17.87 7.29999 14.46 4.85999 10.87 5.44999C7.27999 6.03999 4.83999 9.44999 5.42999 13.04C5.54999 13.79 5.95999 15.24 7.27999 16.56C7.55999 16.84 8.85999 18.16 8.85999 18.16C9.87999 19.21 9.86999 20.89 8.83999 21.92C7.80999 22.95 6.09999 22.96 5.05999 21.92C5.02999 21.89 3.72999 20.57 3.49999 20.34C1.73999 18.57 0.549989 16.29 0.159989 13.91C-0.910011 7.39999 3.49999 1.22999 10.01 0.159989C16.51 -0.910011 22.68 3.49999 23.75 10.01C24.37 13.77 23.14 17.64 20.46 20.36L20.44 20.38L13.85 26.95Z" fill="#D4007E"/>
                </g>
                <defs>
                <clipPath id="clip0_268_1751">
                <rect width="24.75" height="31.9" fill="white"/>
                </clipPath>
                </defs>
                </svg>
            </div>
        </div>
        
    `;
    // Append the welcome container to the document fragment
    welcomeFragment.appendChild(welcomeContainer);
    welcomeFragment.appendChild(welcomeMessageText);

    // Append the fragment to the chat container
    chatContainer.appendChild(welcomeFragment);
}


function getChatToggleSvg() {
    return `
    <svg width="42" height="43" viewBox="0 0 42 43" fill="none" xmlns="http://www.w3.org/2000/svg">
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
}
