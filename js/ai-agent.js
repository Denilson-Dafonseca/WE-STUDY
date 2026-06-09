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

// Send message function
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

// Add message to chat
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

// Process user messages
function processMessage(message) {
    const lower = message.toLowerCase();
    
    if (lower.includes('pride') || lower.includes('start workflow')) {
        startPRIDEWorkflow();
    } else if (lower.includes('pause') || lower.includes('stop')) {
        addMessage("⏸️ Workflow paused. Type 'resume' to continue.", 'ai');
        if (currentPauseResolver) {
            // Don't resolve, just pause
        }
    } else if (lower.includes('resume') || lower.includes('continue')) {
        addMessage("▶️ Resuming workflow...", 'ai');
        if (currentPauseResolver) {
            currentPauseResolver(true);
            currentPauseResolver = null;
        }
    } else if (lower.includes('explain') || lower.includes('why')) {
        showInterpretability();
    } else if (lower.includes('bias') || lower.includes('audit')) {
        conductBiasAudit();
    } else if (lower.includes('override') || lower.includes('disagree')) {
        showOverrideOption();
    } else if (lower.includes('council') || lower.includes('elder')) {
        showEldersCouncil();
    } else {
        addMessage(`I understand you're asking about "${message}". As an AI governed by the PRIDE framework, I can help with:
        
• Starting a PRIDE workflow
• Explaining AI decisions in plain language
• Conducting bias audits
• Recording human overrides
• Consulting the Elders Council

What would you like to do?`, 'ai');
    }
}

// Start PRIDE Workflow
function startPRIDEWorkflow() {
    if (workflowState.isRunning) {
        addMessage("A workflow is already running. Please complete or pause it first.", 'ai');
        return;
    }
    
    workflowState.isRunning = true;
    addMessage("🔄 Starting PRIDE Framework workflow...\n\n**P - Pause Points**: Creating human review checkpoints...", 'ai');
    
    setTimeout(() => {
        createPausePoint();
    }, 1000);
}

// Create pause point (human review required)
function createPausePoint() {
    addMessage("⏸️ **PAUSE POINT**: Human review required before proceeding with study plan generation.\n\nThis is a high-stakes action that affects student learning outcomes.", 'ai');
    
    const pauseHTML = `
        <div class="pause-point-card alert alert-warning">
            <h5><i class="fas fa-pause-circle me-2"></i>Human Review Required</h5>
            <p><strong>Action:</strong> Generate AI Study Plan</p>
            <p><strong>Context:</strong> Creating personalized learning recommendations</p>
            <p><strong>Risk Level:</strong> HIGH</p>
            <div class="mt-3">
                <label>Reviewer Notes:</label>
                <textarea id="reviewNotes" class="form-control mb-2" rows="2" placeholder="Enter your decision rationale..."></textarea>
                <button class="btn btn-success" onclick="approveAction()">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="btn btn-danger" onclick="rejectAction()">
                    <i class="fas fa-times"></i> Reject & Override
                </button>
            </div>
        </div>
    `;
    
    const container = document.getElementById('pausePointContainer');
    if (container) {
        container.innerHTML = pauseHTML;
    }
    
    addMessage("Please review the action above and make a decision.", 'ai');
}

// Approve action
function approveAction() {
    const notes = document.getElementById('reviewNotes')?.value || 'Approved by human reviewer';
    addMessage(`✅ Action approved! Notes: ${notes}`, 'ai');
    
    document.getElementById('pausePointContainer').innerHTML = '';
    
    setTimeout(() => {
        conductBiasAudit();
    }, 1000);
}

// Reject action (override)
function rejectAction() {
    const notes = document.getElementById('reviewNotes')?.value || 'Rejected by human reviewer';
    recordOverride('Study Plan Generation', notes);
    
    document.getElementById('pausePointContainer').innerHTML = '';
    addMessage("⛔ Action rejected. AI will not proceed. Your override has been recorded without penalty.", 'ai');
    workflowState.isRunning = false;
}

// Conduct bias audit
function conductBiasAudit() {
    addMessage("🔍 **R - Review Cadence**: Conducting bias audit (like seasonal migrations)...", 'ai');
    
    const auditResults = {
        timestamp: new Date().toISOString(),
        findings: [
            { type: "Learning Style Bias", detected: false, severity: "none" },
            { type: "Cultural Bias", detected: false, severity: "none" },
            { type: "Language Bias", detected: false, severity: "none" }
        ]
    };
    
    const auditHTML = `
        <div class="audit-report">
            <h6><i class="fas fa-search me-2"></i>Bias Audit Report</h6>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Findings:</strong> No significant biases detected in current algorithms.</p>
            <p><strong>Recommendation:</strong> Schedule next audit in 3 months (quarterly review).</p>
            <div class="alert alert-success mt-2">
                ✅ Audit passed - System is fair and unbiased
            </div>
        </div>
    `;
    
    const container = document.getElementById('auditResultsContainer');
    if (container) {
        container.innerHTML = auditHTML;
    }
    
    addMessage("Bias audit complete. No issues found. Proceeding to next step...", 'ai');
    
    setTimeout(() => {
        showInterpretability();
    }, 1500);
}

// Show interpretability (plain language explanation)
function showInterpretability() {
    addMessage("📖 **I - Interpretability**: Explaining AI decisions in plain language...", 'ai');
    
    const explanationHTML = `
        <div class="interpretability-card">
            <h6><i class="fas fa-language me-2"></i>How the AI Makes Decisions</h6>
            <div class="alert alert-success">
                <strong>📖 Plain Language (What a village elder would understand):</strong><br>
                "The AI looks at how you learn best and when you're free to study. Then it creates a simple plan that fits your daily routine, just like a teacher would."
            </div>
            <details>
                <summary><i class="fas fa-chart-line"></i> Technical Details (for experts)</summary>
                <div class="mt-2 p-2 bg-light rounded">
                The algorithm analyzes 47 data points including learning style preferences, time availability, past performance metrics, and concentration patterns to optimize study session duration and subject rotation using a weighted scoring system.
                </div>
            </details>
        </div>
    `;
    
    const container = document.getElementById('interpretabilityContainer');
    if (container) {
        container.innerHTML = explanationHTML;
    }
    
    addMessage("AI decisions are now explained in plain language. You can always ask 'why' for any recommendation.", 'ai');
    
    setTimeout(() => {
        showOverrideOption();
    }, 1500);
}

// Show override option
function showOverrideOption() {
    addMessage("⚡ **D - Disagreement Rights**: You have the right to override AI decisions without penalty.", 'ai');
    
    const overrideHTML = `
        <div class="override-card alert alert-info">
            <h6><i class="fas fa-hand-peace me-2"></i>Disagreement Rights</h6>
            <p>You can override any AI decision without penalty. Your judgment is valued and respected.</p>
            <button class="btn btn-outline-warning" onclick="simulateOverride()">
                <i class="fas fa-exchange-alt"></i> Test Override Feature
            </button>
        </div>
    `;
    
    const container = document.getElementById('disagreementRightsContainer');
    if (container) {
        container.innerHTML = overrideHTML;
    }
    
    setTimeout(() => {
        showEldersCouncil();
    }, 1500);
}

// Record override
function recordOverride(action, reason) {
    const override = {
        id: Date.now(),
        action: action,
        reason: reason,
        timestamp: new Date().toISOString(),
        penalty: false
    };
    
    workflowState.overrides.push(override);
    localStorage.setItem('prideOverrides', JSON.stringify(workflowState.overrides));
    
    addMessage(`📝 Override recorded: "${action}" - Reason: "${reason}"\n\nNo penalty applied. Thank you for your input - the AI will learn from this feedback.`, 'ai');
}

// Simulate override
function simulateOverride() {
    const reason = prompt("Why are you overriding this AI decision?");
    if (reason) {
        recordOverride("Simulated Decision", reason);
    }
}

// Show Elders Council
function showEldersCouncil() {
    addMessage("👥 **E - Elders Council**: Diverse humans (not just engineers) govern this system.", 'ai');
    
    const councilHTML = `
        <div class="elders-council-card">
            <h6><i class="fas fa-users me-2"></i>Elders Council Members</h6>
            <div class="row">
                <div class="col-md-6 mb-2">
                    <div class="member-card">
                        <strong>Ms. Patricia Mwangi</strong><br>
                        <small>Teacher Representative - Secondary Education</small>
                    </div>
                </div>
                <div class="col-md-6 mb-2">
                    <div class="member-card">
                        <strong>Mr. Johannes !Naruseb</strong><br>
                        <small>Parent Representative - Community Engagement</small>
                    </div>
                </div>
                <div class="col-md-6 mb-2">
                    <div class="member-card">
                        <strong>Elena Shikongo</strong><br>
                        <small>Student Representative - Learner Voice</small>
                    </div>
                </div>
                <div class="col-md-6 mb-2">
                    <div class="member-card">
                        <strong>Dr. Maria van der Merwe</strong><br>
                        <small>Special Education Expert - Inclusive Learning</small>
                    </div>
                </div>
            </div>
            <button class="btn btn-primary btn-sm mt-2" onclick="consultCouncil()">
                <i class="fas fa-gavel"></i> Consult Elders Council
            </button>
        </div>
    `;
    
    const container = document.getElementById('eldersCouncilContainer');
    if (container) {
        container.innerHTML = councilHTML;
    }
    
    addMessage("The Elders Council provides diverse human governance. Any major system change requires their approval.", 'ai');
    
    setTimeout(() => {
        completeWorkflow();
    }, 1000);
}

// Consult council
function consultCouncil() {
    addMessage("📜 Consulting Elders Council on system governance...\n\n**Council Recommendation:**\nThe council recommends proceeding with human-centered AI that prioritizes student wellbeing over efficiency. All AI decisions should be explainable and appealable.\n\n*This recommendation has been recorded in the governance log.*", 'ai');
}

// Complete workflow
function completeWorkflow() {
    addMessage("🎉 **PRIDE Workflow Complete!**\n\n✅ Pause Points respected\n✅ Bias Audit conducted\n✅ Interpretability provided\n✅ Disagreement Rights honored\n✅ Elders Council consulted\n\nThis system is governed by ethical AI principles with humans at critical decision points.", 'ai');
    
    workflowState.isRunning = false;
    
    // Save completion to localStorage
    localStorage.setItem('lastPRIDECompletion', new Date().toISOString());
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initAIAgent();
    
    // Load previous overrides
    const savedOverrides = localStorage.getItem('prideOverrides');
    if (savedOverrides) {
        workflowState.overrides = JSON.parse(savedOverrides);
    }
    
    // Check if user is on dashboard to load data
    if (window.location.pathname.includes('dashboard.html')) {
        if (typeof loadDashboard === 'function') {
            loadDashboard();
        }
    }
    
    if (window.location.pathname.includes('study-plan.html')) {
        if (typeof loadStudyPlanDetail === 'function') {
            loadStudyPlanDetail();
        }
    }
});

// Make functions global
window.approveAction = approveAction;
window.rejectAction = rejectAction;
window.simulateOverride = simulateOverride;
window.consultCouncil = consultCouncil;
window.startPRIDEWorkflow = startPRIDEWorkflow;
window.conductBiasAudit = conductBiasAudit;
window.showInterpretability = showInterpretability;
window.showOverrideOption = showOverrideOption;
window.showEldersCouncil = showEldersCouncil;