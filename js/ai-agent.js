// js/ai-agent.js - PRIDE Framework Integration

class WeStudyAIAgent {
    constructor() {
        this.isRunning = false;
        this.currentPausePoint = null;
        this.humanOverrides = [];
        this.biasAuditSchedule = [];
        this.workflowData = {
            zapier: {},
            n8n: {},
            prideLoop: {
                pausePoints: [],
                reviewCadence: {},
                interpretability: {},
                disagreementRights: [],
                eldersCouncil: {}
            }
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadWorkflowState();
        this.scheduleBiasAudits();
    }

    setupEventListeners() {
        const toggleBtn = document.getElementById('aiAgentToggle');
        const closeBtn = document.getElementById('aiAgentClose');
        const agentWindow = document.getElementById('aiAgentWindow');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                agentWindow.classList.toggle('active');
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                agentWindow.classList.remove('active');
            });
        }
    }

    // P - Pause Points: Mandatory human review before high-stakes actions
    async createPausePoint(action, context, stakes) {
        const pausePoint = {
            id: `pause_${Date.now()}`,
            action: action,
            context: context,
            stakes: stakes, // 'high', 'medium', 'low'
            timestamp: new Date().toISOString(),
            requiresHumanReview: true,
            humanDecision: null,
            humanNotes: null
        };

        this.workflowData.prideLoop.pausePoints.push(pausePoint);
        this.currentPausePoint = pausePoint;
        
        // Display pause point for human review
        this.displayPausePoint(pausePoint);
        
        // Wait for human decision
        const decision = await this.waitForHumanReview(pausePoint);
        
        if (decision.approved) {
            this.addMessage(`✅ Human approved: ${action}. Proceeding with ${decision.notes || 'standard workflow'}`, 'ai');
            return true;
        } else {
            this.addMessage(`⛔ Human rejected: ${action}. ${decision.notes || 'Action cancelled by human reviewer'}`, 'ai');
            this.recordHumanOverride(action, decision);
            return false;
        }
    }

    displayPausePoint(pausePoint) {
        const pauseContainer = document.getElementById('pausePointContainer');
        if (pauseContainer) {
            const stakesColor = pausePoint.stakes === 'high' ? 'danger' : 
                               pausePoint.stakes === 'medium' ? 'warning' : 'info';
            
            pauseContainer.innerHTML = `
                <div class="pause-point-card alert alert-${stakesColor}">
                    <h5><i class="fas fa-pause-circle me-2"></i>Human Review Required</h5>
                    <p><strong>Action:</strong> ${pausePoint.action}</p>
                    <p><strong>Context:</strong> ${pausePoint.context}</p>
                    <p><strong>Risk Level:</strong> ${pausePoint.stakes.toUpperCase()}</p>
                    <div class="mt-3">
                        <label>Reviewer Notes:</label>
                        <textarea id="humanReviewNotes" class="form-control mb-2" rows="2" 
                                  placeholder="Please provide your decision rationale..."></textarea>
                        <div class="btn-group">
                            <button class="btn btn-success" onclick="approvePausePoint('${pausePoint.id}')">
                                <i class="fas fa-check"></i> Approve & Continue
                            </button>
                            <button class="btn btn-danger" onclick="rejectPausePoint('${pausePoint.id}')">
                                <i class="fas fa-times"></i> Reject & Override
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    waitForHumanReview(pausePoint) {
        return new Promise((resolve) => {
            window.approvePausePoint = (id) => {
                const notes = document.getElementById('humanReviewNotes')?.value || 'Approved without notes';
                pausePoint.humanDecision = 'approved';
                pausePoint.humanNotes = notes;
                pausePoint.resolvedAt = new Date().toISOString();
                this.saveWorkflowState();
                resolve({ approved: true, notes: notes });
            };
            
            window.rejectPausePoint = (id) => {
                const notes = document.getElementById('humanReviewNotes')?.value || 'Rejected without notes';
                pausePoint.humanDecision = 'rejected';
                pausePoint.humanNotes = notes;
                pausePoint.resolvedAt = new Date().toISOString();
                this.saveWorkflowState();
                resolve({ approved: false, notes: notes });
            };
        });
    }

    // R - Review Cadence: Schedule bias audits like seasonal migrations
    scheduleBiasAudits() {
        const auditSchedule = [
            { season: 'Quarter 1', month: 'January', focus: 'Learning style bias', completed: false },
            { season: 'Quarter 2', month: 'April', focus: 'Subject matter bias', completed: false },
            { season: 'Quarter 3', month: 'July', focus: 'Performance metric bias', completed: false },
            { season: 'Quarter 4', month: 'October', focus: 'Demographic bias', completed: false }
        ];
        
        this.workflowData.prideLoop.reviewCadence = {
            schedule: auditSchedule,
            lastAudit: null,
            nextAudit: auditSchedule[0],
            auditFrequency: 'quarterly'
        };
        
        this.displayAuditSchedule();
    }

    displayAuditSchedule() {
        const auditContainer = document.getElementById('auditScheduleContainer');
        if (auditContainer) {
            const schedule = this.workflowData.prideLoop.reviewCadence.schedule;
            auditContainer.innerHTML = `
                <h5><i class="fas fa-calendar-check me-2"></i>Bias Audit Schedule (Seasonal Migrations)</h5>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr><th>Season</th><th>Month</th><th>Focus Area</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            ${schedule.map(audit => `
                                <tr class="${audit.completed ? 'table-success' : ''}">
                                    <td>${audit.season}</td>
                                    <td>${audit.month}</td>
                                    <td>${audit.focus}</td>
                                    <td>${audit.completed ? '✅ Completed' : '⏳ Pending'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <button class="btn btn-sm btn-outline-primary mt-2" onclick="triggerBiasAudit()">
                    <i class="fas fa-search"></i> Conduct Emergency Bias Audit
                </button>
            `;
        }
    }

    async conductBiasAudit(focusArea) {
        this.addMessage(`🔍 Conducting bias audit on: ${focusArea}`, 'ai');
        
        const auditResults = {
            focusArea: focusArea,
            timestamp: new Date().toISOString(),
            findings: [],
            recommendations: [],
            humanReviewRequired: true
        };
        
        // Simulate bias detection
        const potentialBiases = [
            { type: 'Cultural Bias', detected: Math.random() > 0.7, severity: 'medium' },
            { type: 'Language Bias', detected: Math.random() > 0.8, severity: 'low' },
            { type: 'Accessibility Bias', detected: Math.random() > 0.6, severity: 'high' },
            { type: 'Learning Style Bias', detected: Math.random() > 0.5, severity: 'medium' }
        ];
        
        auditResults.findings = potentialBiases.filter(b => b.detected);
        
        if (auditResults.findings.length > 0) {
            auditResults.recommendations = auditResults.findings.map(f => 
                `Review and adjust ${f.type} in algorithm parameters`
            );
            
            // Create pause point for bias review
            await this.createPausePoint(
                'Bias Mitigation Review',
                `Found ${auditResults.findings.length} potential biases in ${focusArea}`,
                'high'
            );
        }
        
        this.displayAuditResults(auditResults);
        return auditResults;
    }

    displayAuditResults(results) {
        const container = document.getElementById('auditResultsContainer');
        if (container) {
            container.innerHTML = `
                <div class="audit-report">
                    <h6>Audit Report: ${results.focusArea}</h6>
                    <p><strong>Date:</strong> ${new Date(results.timestamp).toLocaleString()}</p>
                    ${results.findings.length > 0 ? `
                        <div class="alert alert-warning">
                            <strong>⚠️ Findings (${results.findings.length}):</strong>
                            <ul>
                                ${results.findings.map(f => `<li>${f.type} (${f.severity} severity)</li>`).join('')}
                            </ul>
                        </div>
                        <div class="alert alert-info">
                            <strong>📋 Recommendations:</strong>
                            <ul>
                                ${results.recommendations.map(r => `<li>${r}</li>`).join('')}
                            </ul>
                        </div>
                    ` : '<div class="alert alert-success">✅ No biases detected in this audit</div>'}
                </div>
            `;
        }
    }

    // I - Interpretability: Demand explanations a village elder could understand
    getInterpretableExplanation(aiDecision, complexity) {
        const explanations = {
            studyPlan: {
                complex: "Based on 47 data points including learning style, time availability, and past performance, we've calculated optimal study intervals...",
                simple: "We looked at how you learn best and when you're free to study, then made a plan that fits your life."
            },
            subjectRecommendation: {
                complex: "Correlation analysis of your performance metrics across subjects indicates optimal resource allocation...",
                simple: "You're doing great in Math, but Science needs a little extra love this week."
            },
            scheduleOptimization: {
                complex: "Temporal pattern analysis suggests peak cognitive performance windows between 09:00-11:00 and 19:00-21:00...",
                simple: "Your brain works best in the morning and evening, so we put hard subjects then."
            }
        };
        
        const selected = explanations[aiDecision] || {
            complex: "Advanced algorithmic processing determined this outcome.",
            simple: "The computer thinks this is the best way to help you learn."
        };
        
        return complexity === 'simple' ? selected.simple : selected.complex;
    }

    explainAIDecision(decision, context) {
        const simpleExplanation = this.getInterpretableExplanation(decision, 'simple');
        const complexExplanation = this.getInterpretableExplanation(decision, 'complex');
        
        const explanationHTML = `
            <div class="interpretability-card">
                <h6><i class="fas fa-language me-2"></i>AI Decision Explanation</h6>
                <div class="explanation-simple alert alert-success">
                    <strong>📖 Plain Language:</strong><br>
                    ${simpleExplanation}
                </div>
                <details class="explanation-complex">
                    <summary><i class="fas fa-chart-line"></i> Technical Details (for experts)</summary>
                    <div class="mt-2">
                        ${complexExplanation}
                    </div>
                </details>
                <div class="mt-2">
                    <small class="text-muted">
                        <i class="fas fa-question-circle"></i> 
                        Need more explanation? Ask a human mentor or the Elders Council
                    </small>
                </div>
            </div>
        `;
        
        const container = document.getElementById('interpretabilityContainer');
        if (container) {
            container.innerHTML = explanationHTML;
        }
        
        return explanationHTML;
    }

    // D - Disagreement Rights: Users must override AI without penalty
    recordHumanOverride(aiAction, userDecision) {
        const override = {
            id: `override_${Date.now()}`,
            aiAction: aiAction,
            userDecision: userDecision,
            timestamp: new Date().toISOString(),
            penalty: false, // No penalty for overriding
            reason: userDecision.notes || 'User exercised disagreement right',
            respected: true
        };
        
        this.workflowData.prideLoop.disagreementRights.push(override);
        this.saveWorkflowState();
        
        this.displayOverrideConfirmation(override);
        return override;
    }

    displayOverrideConfirmation(override) {
        const container = document.getElementById('disagreementRightsContainer');
        if (container) {
            const card = document.createElement('div');
            card.className = 'override-card alert alert-info';
            card.innerHTML = `
                <i class="fas fa-hand-peace me-2"></i>
                <strong>Human Override Recorded - No Penalty Applied</strong><br>
                <small>You chose to override AI on: ${override.aiAction}</small><br>
                <small>Reason: ${override.reason}</small><br>
                <small class="text-muted">Your judgment is valued and respected. The AI will learn from this feedback.</small>
            `;
            container.prepend(card);
            
            // Auto-remove after 10 seconds
            setTimeout(() => card.remove(), 10000);
        }
    }

    // E - Elders Council: Diverse humans, not just engineers, govern the system
    initializeEldersCouncil() {
        this.workflowData.prideLoop.eldersCouncil = {
            members: [
                { role: 'Teacher Representative', name: 'Ms. Patricia Mwangi', expertise: 'Secondary Education', region: 'Namibia' },
                { role: 'Parent Representative', name: 'Mr. Johannes !Naruseb', expertise: 'Community Engagement', region: 'Rural Namibia' },
                { role: 'Student Representative', name: 'Elena Shikongo', expertise: 'Student Voice', region: 'Urban Namibia' },
                { role: 'Special Education Expert', name: 'Dr. Maria van der Merwe', expertise: 'Inclusive Learning', region: 'Windhoek' },
                { role: 'Technology Ethicist', name: 'Prof. Tendai Moyo', expertise: 'AI Ethics', region: 'Sub-Saharan Africa' }
            ],
            governanceMeetings: [],
            pendingDecisions: [],
            decisions: []
        };
        
        this.displayEldersCouncil();
    }

    displayEldersCouncil() {
        const container = document.getElementById('eldersCouncilContainer');
        if (container && this.workflowData.prideLoop.eldersCouncil) {
            const council = this.workflowData.prideLoop.eldersCouncil;
            container.innerHTML = `
                <div class="elders-council-card">
                    <h5><i class="fas fa-users me-2"></i>Elders Council - System Governors</h5>
                    <p class="text-muted small">Diverse human governance, not just engineers</p>
                    <div class="row">
                        ${council.members.map(member => `
                            <div class="col-md-6 mb-2">
                                <div class="member-card">
                                    <strong>${member.name}</strong><br>
                                    <small>${member.role}</small><br>
                                    <small class="text-muted">Expertise: ${member.expertise}</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="mt-3">
                        <button class="btn btn-sm btn-outline-primary" onclick="consultEldersCouncil()">
                            <i class="fas fa-gavel"></i> Consult Elders Council
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="viewCouncilDecisions()">
                            <i class="fas fa-history"></i> View Past Decisions
                        </button>
                    </div>
                </div>
            `;
        }
    }

    async consultEldersCouncil(topic) {
        this.addMessage(`📜 Consulting Elders Council on: ${topic || 'pending decision'}...`, 'ai');
        
        const consultation = {
            id: `council_${Date.now()}`,
            topic: topic || 'General system governance',
            timestamp: new Date().toISOString(),
            councilMembers: this.workflowData.prideLoop.eldersCouncil.members,
            discussion: [],
            recommendation: null,
            humanDecision: null
        };
        
        // Simulate council deliberation
        await this.createPausePoint(
            'Elders Council Deliberation',
            `The Elders Council is reviewing: ${consultation.topic}. Please provide your input as a community representative.`,
            'high'
        );
        
        consultation.recommendation = "The council recommends proceeding with human-centered approach, ensuring no student is disadvantaged by AI decisions.";
        consultation.humanDecision = 'approved';
        
        this.workflowData.prideLoop.eldersCouncil.decisions.push(consultation);
        this.saveWorkflowState();
        
        this.displayCouncilRecommendation(consultation);
        return consultation;
    }

    displayCouncilRecommendation(consultation) {
        const container = document.getElementById('councilRecommendationContainer');
        if (container) {
            container.innerHTML = `
                <div class="recommendation-card alert alert-success">
                    <i class="fas fa-gavel me-2"></i>
                    <strong>Elders Council Recommendation:</strong><br>
                    ${consultation.recommendation}<br>
                    <small class="text-muted">Decision recorded on: ${new Date(consultation.timestamp).toLocaleString()}</small>
                </div>
            `;
        }
    }

    // Complete PRIDE Workflow Integration
    async executePRIDEWorkflow(task) {
        this.addMessage("🔄 Starting PRIDE Framework workflow...", 'ai');
        
        // P - Pause Point before high-stakes action
        const canProceed = await this.createPausePoint(
            task.action,
            `About to ${task.description}. This requires human review.`,
            task.stakes
        );
        
        if (!canProceed) {
            this.addMessage("Workflow halted by human reviewer.", 'ai');
            return;
        }
        
        // R - Review Cadence (Bias Audit)
        if (task.requiresBiasAudit) {
            await this.conductBiasAudit(task.focusArea);
        }
        
        // I - Interpretability (Explain decision)
        this.explainAIDecision(task.type, task.context);
        
        // Execute the task
        const result = await this.executeTask(task);
        
        // D - Disagreement Rights (Allow override)
        const overrideChoice = await this.offerOverrideOption(result);
        if (overrideChoice.overridden) {
            this.recordHumanOverride(task.action, overrideChoice);
            return overrideChoice.customResult;
        }
        
        // E - Elders Council (Governance for major decisions)
        if (task.governanceRequired) {
            await this.consultEldersCouncil(task.governanceTopic);
        }
        
        this.addMessage("✅ PRIDE workflow completed successfully with human oversight at all critical points.", 'ai');
        return result;
    }

    async executeTask(task) {
        // Simulate task execution
        await this.sleep(1000);
        return {
            success: true,
            result: `Executed: ${task.action}`,
            timestamp: new Date().toISOString()
        };
    }

    async offerOverrideOption(result) {
        // Simple implementation - in real system, would have UI for override
        return { overridden: false, customResult: null };
    }

    recordHumanOverride(action, decision) {
        const override = {
            action: action,
            timestamp: new Date().toISOString(),
            reason: decision.notes,
            penaltyFree: true
        };
        this.workflowData.prideLoop.disagreementRights.push(override);
        this.saveWorkflowState();
    }

    saveWorkflowState() {
        localStorage.setItem('weStudyPRIDEWorkflow', JSON.stringify(this.workflowData.prideLoop));
    }

    loadWorkflowState() {
        const saved = localStorage.getItem('weStudyPRIDEWorkflow');
        if (saved) {
            this.workflowData.prideLoop = JSON.parse(saved);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('aiAgentMessages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        if (sender === 'ai') {
            messageDiv.innerHTML = `
                <div class="avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="content">${text}</div>
            `;
        } else {
            messageDiv.innerHTML = `<div class="content">${text}</div>`;
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Initialize AI Agent with PRIDE Framework
const aiAgent = new WeStudyAIAgent();

// Global functions for HTML interaction
window.approvePausePoint = (id) => {
    if (window.approvePausePointCallback) {
        window.approvePausePointCallback(id);
    }
};

window.rejectPausePoint = (id) => {
    if (window.rejectPausePointCallback) {
        window.rejectPausePointCallback(id);
    }
};

window.triggerBiasAudit = () => {
    const focusArea = prompt("Enter focus area for bias audit:", "Learning algorithm fairness");
    if (focusArea) {
        aiAgent.conductBiasAudit(focusArea);
    }
};

window.consultEldersCouncil = () => {
    const topic = prompt("What would you like the Elders Council to review?", "System governance decision");
    aiAgent.consultEldersCouncil(topic);
};

window.viewCouncilDecisions = () => {
    const decisions = aiAgent.workflowData.prideLoop.eldersCouncil?.decisions || [];
    if (decisions.length === 0) {
        alert("No council decisions recorded yet.");
    } else {
        alert(decisions.map(d => `${new Date(d.timestamp).toLocaleDateString()}: ${d.topic}\n${d.recommendation}`).join('\n\n'));
    }
};

window.startPRIDEWorkflow = () => {
    const task = {
        action: "Generate Personalized Study Plan",
        description: "AI will analyze learning profile and generate study recommendations",
        stakes: "high",
        type: "studyPlan",
        context: { user: "current student" },
        requiresBiasAudit: true,
        focusArea: "Learning style and accessibility bias",
        governanceRequired: true,
        governanceTopic: "New study plan generation algorithm approval"
    };
    aiAgent.executePRIDEWorkflow(task);
};

// Initialize Elders Council on load
document.addEventListener('DOMContentLoaded', () => {
    aiAgent.initializeEldersCouncil();
    aiAgent.scheduleBiasAudits();
});