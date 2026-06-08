// User data storage
let currentUser = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    updateUserCount();
});

// Register new user
function register(userData) {
    // Get existing users from localStorage
    let users = JSON.parse(localStorage.getItem('weStudyUsers')) || [];
    
    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
        alert('Email already registered! Please login instead.');
        return false;
    }
    
    // Create new user object
    const newUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        password: userData.password,
        learningProfile: null,
        studyPlans: [],
        createdAt: new Date().toISOString()
    };
    
    // Save user
    users.push(newUser);
    localStorage.setItem('weStudyUsers', JSON.stringify(users));
    
    // Auto login after registration
    login(userData.email, userData.password);
    return true;
}

// Login user
function login(email, password) {
    const users = JSON.parse(localStorage.getItem('weStudyUsers')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Store current user in session
        currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        alert('Login successful!');
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid email or password!');
    }
}

// Logout user
function logout() {
    sessionStorage.removeItem('currentUser');
    currentUser = null;
    window.location.href = 'index.html';
}

// Check if user is authenticated
function checkAuth() {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        
        // Hide login buttons, show user menu
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const dashboardLink = document.getElementById('dashboardLink');
        const assessmentLink = document.getElementById('assessmentLink');
        const userName = document.getElementById('userName');
        
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        if (dashboardLink) dashboardLink.style.display = 'block';
        if (assessmentLink) assessmentLink.style.display = 'block';
        if (userName && currentUser) userName.textContent = currentUser.name.split(' ')[0];
        
        // Also update get started button on homepage
        const getStartedBtn = document.getElementById('getStartedBtn');
        if (getStartedBtn) {
            getStartedBtn.href = 'dashboard.html';
            getStartedBtn.innerHTML = '<i class="fas fa-chart-line me-2"></i>Go to Dashboard';
        }
    } else {
        // Hide user menu, show login buttons
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const dashboardLink = document.getElementById('dashboardLink');
        const assessmentLink = document.getElementById('assessmentLink');
        
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        if (dashboardLink) dashboardLink.style.display = 'none';
        if (assessmentLink) assessmentLink.style.display = 'none';
        
        // If on protected page, redirect to login
        const protectedPages = ['dashboard.html', 'assessment.html', 'study-plan.html'];
        const currentPage = window.location.pathname.split('/').pop();
        if (protectedPages.includes(currentPage) && currentPage !== 'index.html') {
            window.location.href = 'login.html';
        }
    }
}

// Save learning assessment
function saveAssessment(assessmentData) {
    if (!currentUser) {
        alert('Please login first!');
        window.location.href = 'login.html';
        return false;
    }
    
    // Update current user's learning profile
    currentUser.learningProfile = assessmentData;
    
    // Generate AI study plan based on assessment
    const studyPlan = generateStudyPlan(assessmentData);
    currentUser.studyPlans.push(studyPlan);
    
    // Update users in localStorage
    let users = JSON.parse(localStorage.getItem('weStudyUsers')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('weStudyUsers', JSON.stringify(users));
    }
    
    // Update session storage
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Store current plan for dashboard
    localStorage.setItem('currentStudyPlan', JSON.stringify(studyPlan));
    
    return true;
}

// Generate AI-powered study plan
function generateStudyPlan(assessment) {
    const learningStyle = assessment.learningStyle;
    const difficultyLevel = assessment.difficultyLevel;
    const concentrationLevel = assessment.concentrationLevel;
    const subjects = assessment.subjects.split(',').map(s => s.trim());
    const hoursPerDay = parseFloat(assessment.studyHours);
    
    // Determine session duration based on concentration
    let sessionDuration = 45;
    if (concentrationLevel === 'low') sessionDuration = 25;
    else if (concentrationLevel === 'high') sessionDuration = 60;
    
    // Calculate number of sessions per day
    const sessionsPerDay = Math.floor(hoursPerDay * 60 / sessionDuration);
    
    // Get learning style specific techniques
    const techniques = getStudyTechniques(learningStyle, difficultyLevel);
    
    // Generate weekly schedule
    const weeklySchedule = generateWeeklySchedule(subjects, sessionsPerDay, sessionDuration);
    
    // Generate revision plan
    const revisionPlan = getRevisionPlan();
    
    // Generate memory techniques
    const memoryTechniques = getMemoryTechniques(learningStyle);
    
    return {
        id: Date.now(),
        generatedAt: new Date().toISOString(),
        learningStyle: learningStyle,
        difficultyLevel: difficultyLevel,
        concentrationLevel: concentrationLevel,
        subjects: subjects,
        sessionDuration: sessionDuration,
        sessionsPerDay: sessionsPerDay,
        dailyHours: hoursPerDay,
        studyTechniques: techniques,
        weeklySchedule: weeklySchedule,
        revisionPlan: revisionPlan,
        memoryTechniques: memoryTechniques,
        summary: `Based on your ${learningStyle} learning style and ${concentrationLevel} concentration level, you'll study best in ${sessionDuration}-minute focused sessions with regular breaks.`
    };
}

// Get study techniques based on learning style
function getStudyTechniques(learningStyle, difficultyLevel) {
    const techniques = {
        visual: [
            "Create mind maps and diagrams for complex topics",
            "Use color-coded notes and highlighters",
            "Watch educational videos and animations",
            "Create flashcards with images",
            "Use visual analogies to remember concepts"
        ],
        auditory: [
            "Record yourself reading notes and listen back",
            "Study in groups and discuss topics aloud",
            "Use mnemonic devices and rhymes",
            "Listen to educational podcasts",
            "Explain concepts to others verbally"
        ],
        reading: [
            "Write detailed summaries of each topic",
            "Create outlines and bullet-point notes",
            "Read textbooks actively with highlighting",
            "Rewrite important information in your own words",
            "Create comparison charts and tables"
        ],
        kinesthetic: [
            "Take frequent movement breaks",
            "Use hands-on experiments and activities",
            "Walk while reciting information",
            "Build physical models or use manipulatives",
            "Act out historical events or scientific processes"
        ],
        mixed: [
            "Combine multiple techniques for each study session",
            "Rotate between visual, auditory, and hands-on activities",
            "Create multimedia study materials",
            "Use different methods for different subjects"
        ]
    };
    
    let techList = techniques[learningStyle] || techniques.mixed;
    
    // Add difficulty-specific advice
    if (difficultyLevel === 'beginner') {
        techList.push("Start with basic concepts before moving to complex material");
        techList.push("Use plenty of examples and practice problems");
    } else if (difficultyLevel === 'advanced') {
        techList.push("Focus on connecting concepts across subjects");
        techList.push("Teach difficult concepts to others to deepen understanding");
    }
    
    return techList;
}

// Generate weekly schedule
function generateWeeklySchedule(subjects, sessionsPerDay, sessionDuration) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const schedule = {};
    
    days.forEach(day => {
        const isWeekend = (day === 'Saturday' || day === 'Sunday');
        let sessions = isWeekend ? Math.max(1, sessionsPerDay - 1) : sessionsPerDay;
        
        // Distribute subjects
        const dailySubjects = [];
        for (let i = 0; i < sessions; i++) {
            const subjectIndex = (days.indexOf(day) * sessions + i) % subjects.length;
            dailySubjects.push(subjects[subjectIndex]);
        }
        
        schedule[day] = {
            sessions: sessions,
            subjects: dailySubjects,
            totalMinutes: sessions * sessionDuration,
            breakSuggestion: sessionDuration <= 25 ? "Take 5-minute breaks" : "Take 10-15 minute breaks"
        };
    });
    
    return schedule;
}

// Get revision plan
function getRevisionPlan() {
    return {
        method: "Spaced Repetition System",
        intervals: {
            first: "24 hours",
            second: "3 days",
            third: "1 week",
            fourth: "2 weeks",
            fifth: "1 month"
        },
        instructions: [
            "Review new material within 24 hours of learning it",
            "Second review after 3 days",
            "Third review after 1 week",
            "Fourth review after 2 weeks",
            "Final review after 1 month for long-term retention",
            "Use active recall - test yourself without looking at notes"
        ],
        weeklyTips: [
            "Dedicate Sundays for weekly revision",
            "Mix old and new topics during revision sessions",
            "Create summary sheets for quick review"
        ]
    };
}

// Get memory techniques
function getMemoryTechniques(learningStyle) {
    const techniques = [
        {
            name: 'Active Recall',
            description: 'Test yourself instead of just re-reading notes',
            implementation: 'After studying, close your book and write down everything you remember'
        },
        {
            name: 'Spaced Repetition',
            description: 'Review information at increasing intervals',
            implementation: 'Use flashcards with a spaced repetition system'
        },
        {
            name: 'Mnemonics',
            description: 'Create memory aids like acronyms or rhymes',
            implementation: 'Create memorable phrases where the first letter of each word represents key information'
        }
    ];
    
    if (learningStyle === 'visual') {
        techniques.push({
            name: 'Memory Palace',
            description: 'Associate information with locations in an imagined space',
            implementation: 'Place visual representations of information along a familiar route'
        });
    } else if (learningStyle === 'auditory') {
        techniques.push({
            name: 'Rhythm and Rhyme',
            description: 'Put information to music or rhythm',
            implementation: 'Create songs or rhymes to remember sequences or lists'
        });
    }
    
    return techniques;
}

// Update user count display
function updateUserCount() {
    const users = JSON.parse(localStorage.getItem('weStudyUsers')) || [];
    const userCountSpan = document.getElementById('userCount');
    if (userCountSpan) {
        userCountSpan.textContent = users.length;
    }
}

// Load dashboard data
function loadDashboardData() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update welcome message
    const welcomeElement = document.querySelector('.card.bg-gradient-primary h2');
    if (welcomeElement) {
        welcomeElement.innerHTML = `Welcome back, ${currentUser.name}! 👋`;
    }
    
    // Get study plans
    const studyPlans = currentUser.studyPlans || [];
    const studyPlansContainer = document.getElementById('studyPlansContainer');
    
    if (studyPlansContainer) {
        if (studyPlans.length === 0) {
            studyPlansContainer.innerHTML = `
                <div class="text-center py-5">
                    <p class="text-muted">No study plans yet. Complete the assessment to get your personalized plan!</p>
                    <a href="assessment.html" class="btn btn-primary">Complete Assessment</a>
                </div>
            `;
        } else {
            studyPlansContainer.innerHTML = studyPlans.map(plan => `
                <div class="col-md-6 mb-4">
                    <div class="plan-card">
                        <div class="card-body">
                            <h5 class="card-title">Study Plan - ${new Date(plan.generatedAt).toLocaleDateString()}</h5>
                            <p class="text-muted small">Learning Style: ${plan.learningStyle}</p>
                            <p class="text-muted small">${plan.subjects.length} subjects</p>
                            <button onclick="viewStudyPlan(${plan.id})" class="btn btn-primary btn-sm">View Plan</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Update stats
    const totalStudyTime = studyPlans.reduce((total, plan) => {
        return total + (plan.sessionDuration * plan.sessionsPerDay * 5); // Approximate weekly total
    }, 0);
    
    const totalTimeElement = document.querySelector('.stat-card h3');
    if (totalTimeElement && totalStudyTime > 0) {
        totalTimeElement.textContent = `${totalStudyTime} min`;
    }
    
    // Get upcoming sessions
    const latestPlan = studyPlans[studyPlans.length - 1];
    if (latestPlan && latestPlan.weeklySchedule) {
        const upcomingContainer = document.getElementById('upcomingSessions');
        if (upcomingContainer) {
            const today = new Date();
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const todayName = days[today.getDay()];
            
            const todaySchedule = latestPlan.weeklySchedule[todayName];
            if (todaySchedule) {
                upcomingContainer.innerHTML = `
                    <div class="list-group">
                        ${todaySchedule.subjects.map((subject, idx) => `
                            <div class="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="mb-1">${subject}</h6>
                                    <small class="text-muted">
                                        <i class="far fa-clock me-1"></i>Session ${idx + 1} of ${todaySchedule.sessions}
                                        <i class="fas fa-hourglass-half ms-2 me-1"></i>${latestPlan.sessionDuration} min
                                    </small>
                                </div>
                                <button class="btn btn-sm btn-outline-success" onclick="markSessionComplete('${subject}')">
                                    <i class="fas fa-check"></i> Complete
                                </button>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                upcomingContainer.innerHTML = '<p class="text-muted text-center py-4">No sessions scheduled for today. Check your weekly plan!</p>';
            }
        }
    }
}

// View specific study plan
function viewStudyPlan(planId) {
    if (!currentUser) return;
    
    const plan = currentUser.studyPlans.find(p => p.id === planId);
    if (plan) {
        localStorage.setItem('currentStudyPlan', JSON.stringify(plan));
        window.location.href = 'study-plan.html';
    }
}

// Load study plan detail page
function loadStudyPlanDetail() {
    const planData = localStorage.getItem('currentStudyPlan');
    if (!planData) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    const plan = JSON.parse(planData);
    
    // Update page content
    document.getElementById('planTitle').innerHTML = `Study Plan - ${new Date(plan.generatedAt).toLocaleDateString()}`;
    document.getElementById('planSummary').innerHTML = plan.summary;
    
    // Load techniques
    const techniquesList = document.getElementById('techniquesList');
    if (techniquesList) {
        techniquesList.innerHTML = plan.studyTechniques.map(tech => `
            <li class="list-group-item bg-transparent">
                <i class="fas fa-check-circle text-success me-2"></i>${tech}
            </li>
        `).join('');
    }
    
    // Load session duration
    document.getElementById('sessionDuration').innerHTML = plan.sessionDuration;
    
    // Load weekly schedule
    const scheduleTable = document.getElementById('weeklySchedule');
    if (scheduleTable) {
        scheduleTable.innerHTML = Object.entries(plan.weeklySchedule).map(([day, schedule]) => `
            <tr>
                <td><strong>${day}</strong></td>
                <td>${schedule.sessions} sessions</td>
                <td>${schedule.subjects.join(', ')}</td>
                <td>${schedule.totalMinutes} min</td>
            </tr>
        `).join('');
    }
    
    // Load revision plan
    document.getElementById('revisionInstructions').innerHTML = plan.revisionPlan.instructions.map(inst => `
        <li>${inst}</li>
    `).join('');
    
    // Load memory techniques
    const memoryContainer = document.getElementById('memoryTechniques');
    if (memoryContainer) {
        memoryContainer.innerHTML = plan.memoryTechniques.map(tech => `
            <div class="col-md-6 mb-3">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${tech.name}</h5>
                        <p class="card-text">${tech.description}</p>
                        <small class="text-muted">💡 ${tech.implementation}</small>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Mark session as complete
function markSessionComplete(subject) {
    alert(`Great job completing your ${subject} study session! 🎉\n\nKeep up the momentum!`);
    location.reload();
}

// Export functions for use in HTML
window.register = register;
window.login = login;
window.logout = logout;
window.checkAuth = checkAuth;
window.saveAssessment = saveAssessment;
window.loadDashboardData = loadDashboardData;
window.viewStudyPlan = viewStudyPlan;
window.loadStudyPlanDetail = loadStudyPlanDetail;
window.markSessionComplete = markSessionComplete;