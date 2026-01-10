let currentAgent = 'general';
let chatHistory = [];
let conversationId = null;

const agentConfigs = {
    general: {
        title: 'General AI Agent',
        description: 'Versatile assistant for all your tasks',
        emoji: '🤖',
        systemPrompt: 'You are a helpful AI assistant that can help with various tasks including research, coding, writing, and analysis. Be concise and helpful.'
    },
    research: {
        title: 'Research Agent',
        description: 'Deep research and comprehensive reports',
        emoji: '💼',
        systemPrompt: 'You are a research specialist. Provide detailed, well-researched information with sources when possible. Structure your responses clearly.'
    },
    code: {
        title: 'Code Agent',
        description: 'Expert in code generation and debugging',
        emoji: '👨‍💻',
        systemPrompt: 'You are an expert programmer. Provide clean, efficient code with explanations. Include best practices and error handling.'
    },
    data: {
        title: 'Data Analysis Agent',
        description: 'Data analysis and visualization expert',
        emoji: '📊',
        systemPrompt: 'You are a data analysis expert. Help with data processing, statistical analysis, and creating insights. Provide clear explanations of findings.'
    },
    writing: {
        title: 'Writing Agent',
        description: 'Professional content creation',
        emoji: '✍️',
        systemPrompt: 'You are a professional writer. Create clear, engaging content. Maintain proper structure and tone appropriate to the context.'
    }
};

function showApp(e) {
    e.preventDefault();
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('app-interface').style.display = 'block';
    initializeApp();
}

function backToLanding() {
    document.getElementById('landing-page').style.display = 'block';
    document.getElementById('app-interface').style.display = 'none';
}

function initializeApp() {
    conversationId = generateId();
    updateAgentInfo();
    autoResizeTextarea();
}

function selectAgent() {
    const select = document.getElementById('agent-select');
    currentAgent = select.value;
    updateAgentInfo();
    
    const config = agentConfigs[currentAgent];
    addSystemMessage(`Switched to ${config.title}. ${config.description}`);
}

function updateAgentInfo() {
    const config = agentConfigs[currentAgent];
    document.getElementById('agent-title').textContent = config.title;
    document.getElementById('agent-description').textContent = config.description;
}

function newChat() {
    chatHistory = [];
    conversationId = generateId();
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="32" fill="url(#welcomeGradient)"/>
                    <path d="M32 16L44 24V40L32 48L20 40V24L32 16Z" fill="white" opacity="0.9"/>
                    <defs>
                        <linearGradient id="welcomeGradient" x1="0" y1="0" x2="64" y2="64">
                            <stop offset="0%" stop-color="#6366f1"/>
                            <stop offset="100%" stop-color="#8b5cf6"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <h2>New Conversation Started</h2>
            <p>How can I assist you today?</p>
        </div>
    `;
    document.getElementById('user-input').value = '';
}

function sendSuggestion(text) {
    document.getElementById('user-input').value = text;
    sendMessage();
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    input.value = '';
    autoResizeTextarea();
    
    addUserMessage(message);
    
    chatHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
    });
    
    saveToHistory(message);
    
    showThinkingIndicator();
    
    try {
        const response = await getAIResponse(message);
        removeThinkingIndicator();
        addAgentMessage(response);
        
        chatHistory.push({
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        removeThinkingIndicator();
        addAgentMessage('I apologize, but I encountered an error. Please try again or check your API configuration.', true);
    }
}

function addUserMessage(text) {
    const messagesContainer = document.getElementById('chat-messages');
    
    const suggestions = messagesContainer.querySelector('.suggestions');
    if (suggestions) {
        suggestions.remove();
    }
    
    const welcome = messagesContainer.querySelector('.welcome-message');
    if (welcome) {
        welcome.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
        <div class="message-avatar user-avatar">👤</div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-role">You</span>
                <span class="message-time">${formatTime(new Date())}</span>
            </div>
            <div class="message-text">${escapeHtml(text)}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function addAgentMessage(text, isError = false) {
    const messagesContainer = document.getElementById('chat-messages');
    const config = agentConfigs[currentAgent];
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message agent';
    messageDiv.innerHTML = `
        <div class="message-avatar agent-avatar">${config.emoji}</div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-role">${config.title}</span>
                <span class="message-time">${formatTime(new Date())}</span>
            </div>
            <div class="message-text">${formatMarkdown(text)}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function addSystemMessage(text) {
    const messagesContainer = document.getElementById('chat-messages');
    const welcome = messagesContainer.querySelector('.welcome-message');
    if (welcome) {
        welcome.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.innerHTML = `
        <div class="message-avatar" style="background: linear-gradient(135deg, #10b981, #059669);">ℹ️</div>
        <div class="message-content">
            <div class="message-text" style="background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3);">
                ${escapeHtml(text)}
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function showThinkingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    const config = agentConfigs[currentAgent];
    
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'message agent thinking';
    thinkingDiv.id = 'thinking-indicator';
    thinkingDiv.innerHTML = `
        <div class="message-avatar agent-avatar">${config.emoji}</div>
        <div class="message-content">
            <div class="thinking-indicator">
                <div class="thinking-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
                <span style="color: var(--text-secondary); font-size: 0.875rem;">Thinking...</span>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(thinkingDiv);
    scrollToBottom();
}

function removeThinkingIndicator() {
    const thinking = document.getElementById('thinking-indicator');
    if (thinking) {
        thinking.remove();
    }
}

async function getAIResponse(message) {
    const apiKey = localStorage.getItem('openai_api_key');
    
    if (!apiKey) {
        return `**Welcome to AI Agent Pro!** 

I'm ready to help you with various tasks, but I need an API key to function.

To get started:
1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Click the Settings button (⚙️) to configure your API key
3. Start chatting!

**What I can help with:**
- 💻 Code generation and debugging
- 🔍 Research and information gathering
- 📊 Data analysis and insights
- ✍️ Content writing and editing
- 🎯 Task planning and execution

**Demo Mode:** For now, I'm running in demo mode. Your actual implementation would connect to AI services for real task execution.

Try asking: "Write a Python function to sort a list" or "Explain machine learning concepts"`;
    }
    
    const config = agentConfigs[currentAgent];
    
    const messages = [
        { role: 'system', content: config.systemPrompt },
        ...chatHistory.slice(-10).map(m => ({ role: m.role, content: m.content }))
    ];
    
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages,
                temperature: 0.7,
                max_tokens: 2000
            })
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        return simulateAIResponse(message);
    }
}

function simulateAIResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('code') || lowerMessage.includes('python') || lowerMessage.includes('javascript')) {
        return `I can help you with code! Here's an example:

\`\`\`python
def example_function(data):
    """
    Process data and return results
    """
    processed = [item * 2 for item in data]
    return processed

# Usage
data = [1, 2, 3, 4, 5]
result = example_function(data)
print(result)  # Output: [2, 4, 6, 8, 10]
\`\`\`

This is a **demo response**. To get real AI-powered responses:
1. Add your OpenAI API key in Settings
2. Or deploy with your preferred AI backend

Would you like me to help with a specific coding task?`;
    }
    
    if (lowerMessage.includes('research') || lowerMessage.includes('information') || lowerMessage.includes('what is')) {
        return `I'd be happy to research that for you!

**Research Capabilities:**
- 📚 In-depth topic exploration
- 🔍 Web search integration
- 📊 Data gathering and synthesis
- 📝 Comprehensive reports

**Demo Mode Active:** This is a demonstration response. With a proper API connection, I would:
1. Search relevant sources
2. Analyze information
3. Provide detailed, sourced answers
4. Generate formatted reports

Please configure your API key to unlock full research capabilities.`;
    }
    
    if (lowerMessage.includes('data') || lowerMessage.includes('analysis') || lowerMessage.includes('analyze')) {
        return `**Data Analysis Capabilities:**

I can help you with:
- 📊 Statistical analysis
- 📈 Data visualization
- 🔢 Data cleaning and preprocessing
- 💡 Insight generation
- 📉 Trend analysis

**Example Analysis:**
\`\`\`python
import pandas as pd
import matplotlib.pyplot as plt

# Load data
df = pd.read_csv('data.csv')

# Basic statistics
print(df.describe())

# Create visualization
df.plot(kind='bar')
plt.title('Data Analysis Results')
plt.show()
\`\`\`

Would you like to analyze specific data? Please share your dataset or requirements!`;
    }
    
    return `Thank you for your message! 

**I'm running in demo mode.** Here's what I can do with proper configuration:

🎯 **Task Execution**
- Break down complex tasks into steps
- Execute multi-step workflows
- Track progress and results

💻 **Code Generation**
- Write code in 20+ languages
- Debug and optimize existing code
- Explain code functionality

🔍 **Research & Analysis**
- Web research and synthesis
- Data analysis and visualization
- Report generation

✨ **Creative Tasks**
- Content writing
- Document creation
- Idea generation

**To unlock full capabilities:**
Configure your AI API key in the settings panel.

What specific task would you like help with?`;
}

function formatMarkdown(text) {
    text = escapeHtml(text);
    
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code class="language-${lang || 'plain'}">${code.trim()}</code></pre>`;
    });
    
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    text = text.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    text = text.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    text = text.replace(/^# (.+)$/gm, '<h2>$1</h2>');
    
    text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    text = text.replace(/\n\n/g, '<br><br>');
    
    return text;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('chat-messages');
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function autoResizeTextarea() {
    const textarea = document.getElementById('user-input');
    
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 200) + 'px';
    });
}

function saveToHistory(message) {
    const historyContainer = document.getElementById('chat-history');
    const historySection = historyContainer.querySelector('.history-section');
    
    if (!historySection) return;
    
    const existingItems = historySection.querySelectorAll('.history-item');
    if (existingItems.length >= 10) {
        existingItems[existingItems.length - 1].remove();
    }
    
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.textContent = message.substring(0, 50) + (message.length > 50 ? '...' : '');
    historyItem.onclick = () => {
        document.getElementById('user-input').value = message;
    };
    
    const label = historySection.querySelector('.history-label');
    if (label.nextSibling) {
        historySection.insertBefore(historyItem, label.nextSibling);
    } else {
        historySection.appendChild(historyItem);
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function openSettings() {
    const apiKey = prompt('Enter your OpenAI API Key (or leave blank for demo mode):');
    if (apiKey !== null) {
        localStorage.setItem('openai_api_key', apiKey);
        alert(apiKey ? 'API key saved!' : 'Running in demo mode');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.querySelector('.icon-btn');
    if (settingsBtn) {
        settingsBtn.onclick = openSettings;
    }
    
    const hasVisited = localStorage.getItem('has_visited');
    if (!hasVisited) {
        localStorage.setItem('has_visited', 'true');
    }
});

window.addEventListener('load', () => {
    const hash = window.location.hash;
    if (hash === '#app') {
        const fakeEvent = { preventDefault: () => {} };
        showApp(fakeEvent);
    }
});
