// AI Agent with PRIDE Framework - Complete Working Version

let currentPauseResolver = null;
let workflowState = {
    isRunning: false,
    currentStep: null,
    pausePoints: [],
    overrides: []
};

// Initialize AI Agent
function initAIAgent() {
    const toggleBtn = document.getElementById('aiAgentToggle');
    const closeBtn = document.getElementById('aiAgentClose');
    const agentWindow = document.getElementById('aiAgentWindow');
    const sendBtn = document.getElementById('sendMessage');
    const messageInput = document.getElementById('aiMessageInput');
    
    if (toggleBtn) {
        toggleBtn.onclick = () => {
            agentWindow.classList.toggle('active');
        };
    }
    
    if (closeBtn) {
        closeBtn.onclick = () => {
            agentWindow.classList.remove('active');
        };
    }
    
    if (sendBtn && messageInput) {
        sendBtn.onclick = () => sendMessage();
        messageInput.onkeypress = (e) => {
            if (e.key === 'Enter') sendMessage();
        };
    }
}

function sendMessage() {
    const input = document.getElementById('aiMessageInput');
    const message = input.value.trim();
    if (!message) return;
    
    addMessage(message, 'user');
    input.value = '';
    
    setTimeout(() => {
        processMessage(message);
    }, 500);
}

function addMessage(text, sender) {
    const container = document.getElementById('aiAgentMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    if (sender === 'ai') {
        messageDiv.innerHTML = `
            <div class="avatar"><i class="fas fa-robot"></i></div>
            <div class="content">${text}</div>
        `;
    } else {
        messageDiv.innerHTML = `<div class="content">${text}</div>`;
    }
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function processMessage(message) {
    const lower = message.toLowerCase();
    
    if (lower.includes('start') || lower.includes('workflow') || lower.includes('pride')) {
        startPRIDEWorkflow();
    } else if (lower.includes('pause')) {
        addMessage("⏸️ Workflow paused. Type 'resume' to continue.", 'ai');
    } else if (lower.includes('resume')) {
        addMessage("▶️ Resuming workflow...", 'ai');
        if (currentPauseResolver) {
            currentPauseResolver(true);
            currentPauseResolver = null;
        }
    } else if (lower.includes('explain')) {
        showInterpretability();
    } else if (lower.includes('audit') || lower.includes('bias')) {
        conductBiasAudit();
    } else if (lower.includes('override')) {
        showOverrideOption();
    } else if (lower.includes('council') || lower.includes('elder')) {
        showEldersCouncil();
    } else {
        addMessage(`I'm your PRIDE-governed AI assistant. Try these commands:
• "start workflow" - Begin the PRIDE process
• "explain" - See how AI makes decisions
• "audit" - Run a bias check
• "override" - Learn about disagreement rights
• "council" - Meet the Elders Council`, 'ai');
    }
}

function startPRIDEWorkflow() {
    if (workflowState.isRunning) {
        addMessage("A workflow is already running. Complete or pause it first.", 'ai');
        return;
    }
    
    workflowState.isRunning = true;
    addMessage("🔄 **PRIDE Framework Workflow Started**\n\n**P - Pause Points**: Creating human review checkpoint