// AI Workflow Agent with PRIDE Pause Points

class AIWorkflowAgent {
    constructor() {
        this.isRunning = false;
        this.currentPausePoint = null;
        this.pauseResolver = null;
        this.workflowData = {
            zapier: [],
            n8n: [],
            pridePauses: []
        };
        this.init();
    }

    init() {
        this.createUI();
        this.loadWorkflowState();
    }

    createUI() {
        // Create workflow button if not exists
        if (!document.getElementById('aiWorkflowBtn')) {
            const btn = document.createElement('button');
            btn.id = 'aiWorkflowBtn';
            btn.className = 'ai-workflow-btn';
            btn.innerHTML = '<i class="fas fa-robot me-2"></i>🤖 AI Workflow Agent';
            btn.onclick = () => this.showWorkflowPanel();
            document.body.appendChild(btn);
        }

        // Create workflow status indicator
        if (!document.getElementById('workflowStatus')) {
            const status = document.createElement('div');
            status.id = 'workflowStatus';
            status.className = 'workflow-status';
            status.innerHTML = '<div class="status-dot"></div><span id="workflowStatusText">Idle</span>';
            document.body.appendChild(status);
        }

        // Create pause point modal if not exists
        if (!document.getElementById('pridePauseModal')) {
            const modal = document.createElement('div');
            modal.id = 'pridePauseModal';
            modal.className = 'pride-pause-container';
            modal.innerHTML = `
                <div class="pride-pause-card">
                    <div class="pride-pause-header">
                        <span class="pause-point-badge">⏸️ PRIDE PAUSE POINT</span>
                        <h3 id="pauseTitle">Human Review Required</h3>
                    </div>
                    <div class="pride-pause-body">
                        <p id="pauseMessage">This action requires human approval before proceeding.</p>
                        <div id="pauseDataPreview"></div>
                        <div class="mt-3">
                            <label class="form-label">Reviewer Notes:</label>
                            <textarea id="pauseNotes" class="form-control" rows="3" placeholder="Enter your decision rationale..."></textarea>
                        </div>
                    </div>
                    <div class="pride-pause-footer">
                        <button class="btn btn-secondary" onclick="workflowAgent.rejectPause()">
                            <i class="fas fa-times"></i> Reject
                        </button>
                        <button class="btn btn-success" onclick="workflowAgent.approvePause()">
                            <i class="fas fa-check"></i> Approve & Continue
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
    }

    showWorkflowPanel() {
        const panel = document.createElement('div');
        panel.id = 'workflowPanel';
        panel.className = 'ai-agent-window active';
        panel.style.position = 'fixed';
        panel.style.top = '50%';
        panel.style.left = '50%';
        panel.style.transform = 'translate(-50%, -50%)';
        panel.style.width = '600px';
        panel.style.maxWidth = '90vw';
        panel.style.height = 'auto';
        panel.style.maxHeight = '80vh';
        panel.style.zIndex = '2001';
        
        panel.innerHTML = `
            <div class="ai-agent-header">
                <h3><i class="fas fa-robot me-2"></i>AI Workflow Agent - PRIDE Framework</h3>
                <button class="ai-agent-close" onclick="this.closest('#workflowPanel').remove()">&times;</button>
            </div>
            <div class="ai-agent-messages" style="max-height: 400px; overflow-y: auto;">
                <div class="message ai">
                    <div class="avatar"><i class="fas fa-robot"></i></div>
                    <div class="content">
                        <strong>🤖 AI Workflow Agent Ready</strong><br><br>
                        I can help you set up automated workflows between Zapier and n8n with PRIDE pause points.<br><br>
                        <strong>Available Commands:</strong><br>
                        • "Start Zapier workflow" - Begin data transfer simulation<br>
                        • "Start n8n workflow" - Run n8n automation<br>
                        • "Run complete workflow" - Full Zapier → n8n pipeline<br>
                        • "Show status" - Check current workflow state<br>
                        • "Clear history" - Reset all workflow data<br><br>
                        <strong>PRIDE Pause Points:</strong> Human review required before critical actions!
                    </div>
                </div>
            </div>
            <div class="ai-agent-input">
                <input type="text" id="workflowInput" placeholder="Type a command...">
                <button onclick="workflowAgent.processCommand()">Send</button>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        const input = document.getElementById('workflowInput');
        if (input) {
            input.onkeypress = (e) => {
                if (e.key === 'Enter') this.processCommand();
            };
        }
    }

    addMessage(text, sender = 'ai') {
        const container = document.querySelector('#workflowPanel .ai-agent-messages');
        if (!container) return;
        
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

    async processCommand() {
        const input = document.getElementById('workflowInput');
        const command = input.value.trim();
        if (!command) return;
        
        this.addMessage(command, 'user');
        input.value = '';
        
        const lower = command.toLowerCase();
        
        if (lower.includes('zapier')) {
            await this.runZapierWorkflow();
        } else if (lower.includes('n8n')) {
            await this.runN8nWorkflow();
        } else if (lower.includes('complete') || lower.includes('full')) {
            await this.runCompleteWorkflow();
        } else if (lower.includes('status')) {
            this.showStatus();
        } else if (lower.includes('clear')) {
            this.clearHistory();
        } else {
            this.addMessage(`I don't recognize that command. Try:
• "Start Zapier workflow"
• "Start n8n workflow"  
• "Run complete workflow"
• "Show status"
• "Clear history"`);
        }
    }

    async runZapierWorkflow() {
        this.updateStatus('Running Zapier workflow...');
        this.addMessage("📡 Starting Zapier webhook workflow simulation...");
        
        // Mock student data
        const mockStudentData = {
            student_id: `STU_${Date.now()}`,
            name: "Test Student",
            email: "student@example.com",
            learning_style: "visual",
            subjects: ["Mathematics", "Science", "English"],
            study_hours: 2.5,
            performance_score: 78,
            timestamp: new Date().toISOString()
        };
        
        this.addMessage(`📤 Sending data to Zapier webhook:\n\`\`\`json\n${JSON.stringify(mockStudentData, null, 2)}\n\`\`\``);
        
        // Create PAUSE POINT for human review
        const approved = await this.createPausePoint({
            title: "Zapier Webhook Data Review",
            message: "Student data is about to be sent to Zapier. Please review the data before proceeding.",
            data: mockStudentData,
            action: "Zapier Webhook Transfer",
            stakes: "High - Student data being transferred"
        });
        
        if (!approved) {
            this.addMessage("❌ Zapier workflow rejected by human reviewer. Data not sent.");
            this.updateStatus('Rejected');
            return;
        }
        
        // Simulate Zapier webhook call
        await this.sleep(1500);
        
        const zapierResponse = {
            success: true,
            webhook_id: `wh_${Date.now()}`,
            status: 200,
            message: "Data received successfully",
            timestamp: new Date().toISOString()
        };
        
        this.workflowData.zapier.push({
            data: mockStudentData,
            response: zapierResponse,
            timestamp: new Date().toISOString()
        });
        
        this.addMessage(`✅ Zapier webhook response:\n\`\`\`json\n${JSON.stringify(zapierResponse, null, 2)}\n\`\`\``);
        this.updateStatus('Zapier workflow complete');
        this.saveWorkflowState();
    }

    async runN8nWorkflow() {
        this.updateStatus('Running n8n workflow...');
        this.addMessage("🔄 Starting n8n workflow simulation...");
        
        // Get latest Zapier data if available
        const latestZapier = this.workflowData.zapier[this.workflowData.zapier.length - 1];
        const inputData = latestZapier ? latestZapier.data : {
            student_id: `STU_${Date.now()}`,
            name: "Test Student",
            learning_style: "visual",
            subjects: ["Mathematics", "Science"]
        };
        
        // Create PAUSE POINT for n8n workflow
        const approved = await this.createPausePoint({
            title: "n8n Workflow Execution",
            message: "The n8n workflow is about to process student data and generate a study plan. Please review and approve.",
            data: inputData,
            action: "n8n Workflow Processing",
            stakes: "Medium - Study plan generation"
        });
        
        if (!approved) {
            this.addMessage("❌ n8n workflow rejected by human reviewer.");
            this.updateStatus('Rejected');
            return;
        }
        
        await this.sleep(1500);
        
        // Simulate n8n workflow steps
        const workflowSteps = [
            { name: "Webhook Trigger", status: "completed", duration: "100ms" },
            { name: "Data Transformation", status: "completed", duration: "200ms" },
            { name: "AI Analysis", status: "completed", duration: "500ms" },
            { name: "Study Plan Generation", status: "completed", duration: "300ms" }
        ];
        
        // Generate study plan
        const studyPlan = this.generateStudyPlan(inputData);
        
        const n8nResponse = {
            workflow_id: `n8n_${Date.now()}`,
            status: "success",
            steps: workflowSteps,
            total_duration: "1.1s",
            output: studyPlan
        };
        
        this.workflowData.n8n.push({
            input: inputData,
            response: n8nResponse,
            timestamp: new Date().toISOString()
        });
        
        this.addMessage(`✅ n8n workflow complete!\n\n📊 **Generated Study Plan:**\n• Session Duration: ${studyPlan.sessionDuration} minutes\n• Techniques: ${studyPlan.studyTechniques.slice(0, 3).join(', ')}...\n• Weekly Hours: ${studyPlan.weeklyHours}`);
        
        this.updateStatus('n8n workflow complete');
        this.saveWorkflowState();
    }

    async runCompleteWorkflow() {
        this.addMessage("🚀 Starting complete Zapier → n8n workflow pipeline with PRIDE pause points...");
        
        // Step 1: Zapier workflow
        await this.runZapierWorkflow();
        
        // Check if workflow was rejected
        if (this.workflowData.zapier.length === 0) {
            this.addMessage("❌ Workflow stopped at Zapier stage.");
            return;
        }
        
        this.addMessage("➡️ Proceeding to n8n workflow...");
        
        // Step 2: n8n workflow
        await this.runN8nWorkflow();
        
        if (this.workflowData.n8n.length > 0) {
            this.addMessage("🎉 **Complete workflow finished successfully!**\n\nData flowed through:\n1. Zapier Webhook → Received student data\n2. n8n Workflow → Processed and generated study plan\n3. PRIDE Pause Points → Human approval at critical steps");
            
            // Show final summary
            const lastN8n = this.workflowData.n8n[this.workflowData.n8n.length - 1];
            this.addMessage(`📋 **Final Output Summary:**\n\`\`\`\nStudy Plan ID: ${lastN8n.response.workflow_id}\nStudent: ${lastN8n.input.name || 'Test Student'}\nLearning Style: ${lastN8n.input.learning_style}\nStatus: ${lastN8n.response.status}\n\`\`\``);
        }
        
        this.updateStatus('Complete workflow done');
    }

    generateStudyPlan(studentData) {
        const techniques = {
            visual: ["Mind maps", "Diagrams", "Color coding", "Videos"],
            auditory: ["Recordings", "Discussions", "Mnemonics", "Podcasts"],
            reading: ["Summaries", "Outlines", "Flashcards", "Notes"],
            kinesthetic: ["Hands-on", "Movement", "Experiments", "Role-play"]
        };
        
        const style = studentData.learning_style || 'visual';
        const sessionDuration = studentData.study_hours ? Math.floor(studentData.study_hours * 60 / 3) : 45;
        
        return {
            student_id: studentData.student_id,
            generated_at: new Date().toISOString(),
            learning_style: style,
            sessionDuration: Math.min(60, Math.max(25, sessionDuration)),
            studyTechniques: techniques[style] || techniques.visual,
            weeklyHours: studentData.study_hours || 2,
            subjects: studentData.subjects || ["General Studies"],
            recommendations: [
                "Review material within 24 hours",
                "Take regular breaks every 45 minutes",
                "Use active recall for better retention"
            ]
        };
    }

    async createPausePoint(pauseInfo) {
        this.currentPausePoint = pauseInfo;
        
        // Show the pause modal
        const modal = document.getElementById('pridePauseModal');
        const titleEl = document.getElementById('pauseTitle');
        const messageEl = document.getElementById('pauseMessage');
        const dataPreviewEl = document.getElementById('pauseDataPreview');
        
        if (titleEl) titleEl.textContent = pauseInfo.title;
        if (messageEl) messageEl.textContent = pauseInfo.message;
        
        if (dataPreviewEl && pauseInfo.data) {
            dataPreviewEl.innerHTML = `
                <div class="data-preview">
                    <strong>📊 Data to Review:</strong>
                    <pre>${JSON.stringify(pauseInfo.data, null, 2)}</pre>
                </div>
                <div class="workflow-visualization mt-2">
                    🟢 Zapier → 🔄 n8n → 🤖 AI → ⏸️ ${pauseInfo.action}
                </div>
            `;
        }
        
        modal.style.display = 'flex';
        
        // Wait for human decision
        return new Promise((resolve) => {
            this.pauseResolver = resolve;
        });
    }

    approvePause() {
        const notes = document.getElementById('pauseNotes')?.value || 'Approved by reviewer';
        this.workflowData.pridePauses.push({
            pausePoint: this.currentPausePoint,
            decision: 'approved',
            notes: notes,
            timestamp: new Date().toISOString()
        });
        
        document.getElementById('pridePauseModal').style.display = 'none';
        document.getElementById('pauseNotes').value = '';
        
        if (this.pauseResolver) {
            this.pauseResolver(true);
            this.pauseResolver = null;
        }
        
        this.addMessage(`✅ Human approved: ${this.currentPausePoint?.title}\n📝 Notes: ${notes}`);
        this.currentPausePoint = null;
    }

    rejectPause() {
        const notes = document.getElementById('pauseNotes')?.value || 'Rejected by reviewer';
        this.workflowData.pridePauses.push({
            pausePoint: this.currentPausePoint,
            decision: 'rejected',
            notes: notes,
            timestamp: new Date().toISOString()
        });
        
        document.getElementById('pridePauseModal').style.display = 'none';
        document.getElementById('pauseNotes').value = '';
        
        if (this.pauseResolver) {
            this.pauseResolver(false);
            this.pauseResolver = null;
        }
        
        this.addMessage(`❌ Human rejected: ${this.currentPausePoint?.title}\n📝 Reason: ${notes}`);
        this.currentPausePoint = null;
    }

    showStatus() {
        const zapierCount = this.workflowData.zapier.length;
        const n8nCount = this.workflowData.n8n.length;
        const pauseCount = this.workflowData.pridePauses.length;
        
        this.addMessage(`📊 **Workflow Status:**\n\n• Zapier Webhooks: ${zapierCount} transfers\n• n8n Workflows: ${n8nCount} executions\n• PRIDE Pause Points: ${pauseCount} human reviews\n• Status: ${this.isRunning ? 'Running' : 'Idle'}`);
        
        if (this.workflowData.zapier.length > 0) {
            const lastZapier = this.workflowData.zapier[this.workflowData.zapier.length - 1];
            this.addMessage(`📡 Last Zapier Transfer: ${new Date(lastZapier.timestamp).toLocaleTimeString()}`);
        }
        
        if (this.workflowData.n8n.length > 0) {
            const lastN8n = this.workflowData.n8n[this.workflowData.n8n.length - 1];
            this.addMessage(`🔄 Last n8n Execution: ${new Date(lastN8n.timestamp).toLocaleTimeString()}`);
        }
    }

    clearHistory() {
        this.workflowData = { zapier: [], n8n: [], pridePauses: [] };
        localStorage.removeItem('aiWorkflowData');
        this.addMessage("🧹 Workflow history cleared. All data has been reset.");
        this.updateStatus('Idle');
    }

    updateStatus(text) {
        const statusEl = document.getElementById('workflowStatus');
        const textEl = document.getElementById('workflowStatusText');
        if (statusEl && textEl) {
            statusEl.classList.add('active');
            textEl.textContent = text;
            setTimeout(() => {
                if (textEl.textContent === text) {
                    statusEl.classList.remove('active');
                }
            }, 3000);
        }
    }

    saveWorkflowState() {
        localStorage.setItem('aiWorkflowData', JSON.stringify(this.workflowData));
    }

    loadWorkflowState() {
        const saved = localStorage.getItem('aiWorkflowData');
        if (saved) {
            this.workflowData = JSON.parse(saved);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize workflow agent
const workflowAgent = new AIWorkflowAgent();

// Make functions global for HTML buttons
window.workflowAgent = workflowAgent;