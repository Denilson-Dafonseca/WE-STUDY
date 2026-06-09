// User data storage
let currentUser = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    updateUserCount();
    setupEventListeners();
});

function setupEventListeners() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            login(email, password);
        });
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            const userData = {
                name: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                password: password
            };
            
            register(userData);
        });
    }
    
    const assessmentForm = document.getElementById('assessmentForm');
    if (assessmentForm) {
        assessmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAssessmentData();
        });
    }
}

function register(userData) {
    let users = JSON.parse(localStorage.getItem('weStudyUsers')) || [];
    
    if (users.find(u => u.email === userData.email)) {
        alert('Email already registered! Please login instead.');
        return false;
    }
    
    const newUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        password: userData.password,
        learningProfile: null,
        studyPlans: [],
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('weStudyUsers', JSON.stringify(users));
    
    login(userData.email, userData.password);
    return true;
}

function login(email, password) {
    const users = JSON.parse(localStorage.getItem('weStudyUsers')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        alert('Login successful!');
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid email or password!');
    }
}

function logout() {
    sessionStorage.removeItem('currentUser');
    currentUser = null;
    window.location.href = 'index.html';
}

function checkAuth() {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        
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
        
        const getStartedBtn = document.getElementById('getStartedBtn');
        if (getStartedBtn) {
            getStartedBtn.href = 'dashboard.html';
            getStartedBtn.innerHTML = '<i class="fas fa-chart-line me-2"></i>Go to Dashboard';
        }
    } else {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const dashboardLink = document.getElementById('dashboardLink');
        const assessmentLink = document.getElementById('assessmentLink');
        
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        if (dashboardLink) dashboardLink.style.display = 'none';
        if (assessmentLink) assessmentLink.style.display = 'none';
        
        const protectedPages = ['dashboard.html', 'assessment.html', 'study-plan.html'];
        const currentPage = window.location.pathname.split('/').pop();
        if (protectedPages.includes(currentPage) && currentPage !== 'index.html') {
            window.location.href = 'login.html';
        }
    }
}

function saveAssessmentData() {
    if (!currentUser) {
        alert('Please login first!');
        window.location.href = 'login.html';
        return;
    }
    
    const assessmentData = {
        learningStyle: document.getElementById('learningStyle')?.value || 'mixed',
        difficultyLevel: document.getElementById('difficultyLevel')?.value || 'intermediate',
        concentrationLevel: document.getElementById('concentrationLevel')?.value || 'medium',
        subjects: document.getElementById('subjects')?.value || 'General Studies',
        goals: document.getElementById('goals')?.value || 'Improve study habits',
        challenges: document.getElementById('challenges')?.value || 'None',
        studyHours: document.getElementById('studyHours')?.value || 2
    };
    
    currentUser.learningProfile = assessmentData;
    
    const studyPlan = generateStudyPlan(assessmentData);
    currentUser.studyPlans.push(studyPlan);
    
    let users = JSON.parse(localStorage.getItem('weStudyUsers')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('weStudyUsers', JSON.stringify(users));
    }
    
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('currentStudyPlan', JSON.stringify(studyPlan));
    
    alert('Your AI study plan has been generated successfully!');
    window.location.href = 'dashboard.html';
}

function generateStudyPlan(assessment) {
    const subjects = assessment.subjects.split(',').map(s => s.trim());
    let sessionDuration = 45;
    if (assessment.concentrationLevel === 'low') sessionDuration = 25;
    else if (assessment.concentrationLevel === 'high') sessionDuration = 60;
    
    const techniques = {
        visual: ["Create mind maps and diagrams", "Use color-coded notes", "Watch educational videos", "Create flashcards with images", "Use visual analogies"],
        auditory: ["Record and listen to your notes", "Study in groups and discuss aloud", "Use mnemonic devices and rhymes", "Listen to educational podcasts", "Explain concepts verbally"],
        reading: ["Write detailed summaries", "Create bullet-point outlines", "Read textbooks actively", "Rewrite important information", "Create comparison charts"],
        kinesthetic: ["Take frequent movement breaks", "Use hands-on experiments", "Walk while reciting information", "Build physical models", "Act out processes"],
        mixed: ["Combine multiple techniques", "Rotate between different methods", "Create multimedia study materials", "Use varied approaches for different subjects"]
    };
    
    // Generate weekly schedule
    const weeklySchedule = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const sessionsPerDay = Math.max(1, Math.floor(assessment.studyHours * 60 / sessionDuration));
    
    days.forEach((day, index) => {
        const isWeekend = (day === 'Saturday' || day === 'Sunday');
        let sessions = isWeekend ? Math.max(1, sessionsPerDay - 1) : sessionsPerDay;
        
        const dailySubjects = [];
        for (let i = 0; i < sessions; i++) {
            const subjectIndex = (index * sessions + i) % subjects.length;
            dailySubjects.push(subjects[subjectIndex]);
        }
        
        weeklySchedule[day] = {
            sessions: sessions,
            subjects: dailySubjects,
            totalMinutes: sessions * sessionDuration
        };
    });
    
    return {
        id: Date.now(),
        generatedAt: new Date().toISOString(),
        learningStyle: assessment.learningStyle,
        subjects: subjects,
        sessionDuration: sessionDuration,
        studyTechniques: techniques[assessment.learningStyle] || techniques.mixed,
        weeklySchedule: weeklySchedule,
        summary: `Based on your ${assessment.learningStyle} learning style and ${assessment.concentrationLevel} concentration level, you'll study best in ${sessionDuration}-minute focused sessions.`
    };
}

function updateUserCount() {
    const users = JSON.parse(localStorage.getItem('weStudyUsers')) || [];
    const userCountSpan = document.getElementById('userCount');
    if (userCountSpan) {
        userCountSpan.textContent = users.length;
    }
}

function loadDashboard() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    const welcomeElement = document.querySelector('.bg-gradient-primary h2');
    if (welcomeElement) {
        welcomeElement.innerHTML = `Welcome back, ${currentUser.name}! 👋`;
    }
    
    if (currentUser.learningProfile) {
        const styleElement = document.getElementById('learningStyleDisplay');
        if (styleElement) {
            styleElement.textContent = currentUser.learningProfile.learningStyle.charAt(0).toUpperCase() + 
                currentUser.learningProfile.learningStyle.slice(1);
        }
    }
    
    const studyPlansContainer = document.getElementById('studyPlansContainer');
    if (studyPlansContainer) {
        const plans = currentUser.studyPlans || [];
        const activePlansSpan = document.getElementById('activePlans');
        if (activePlansSpan) activePlansSpan.textContent = plans.length;
        
        if (plans.length === 0) {
            studyPlansContainer.innerHTML = `
                <div class="text-center py-5">
                    <p class="text-muted">No study plans yet. Complete the assessment to get your personalized plan!</p>
                    <a href="assessment.html" class="btn btn-primary">Complete Assessment</a>
                </div>
            `;
        } else {
            studyPlansContainer.innerHTML = plans.map(plan => `
                <div class="col-md-6 mb-4">
                    <div class="plan-card">
                        <h5>📖 ${plan.subjects.length} Subjects</h5>
                        <p class="text-muted small">Created: ${new Date(plan.generatedAt).toLocaleDateString()}</p>
                        <p>🎯 ${plan.sessionDuration} min sessions | ${plan.learningStyle} learner</p>
                        <button onclick="viewStudyPlan(${plan.id})" class="btn btn-primary btn-sm">View Full Plan</button>
                    </div>
                </div>
            `).join('');
        }
    }
}

function viewStudyPlan(planId) {
    const plan = currentUser.studyPlans.find(p => p.id === planId);
    if (plan) {
        localStorage.setItem('currentStudyPlan', JSON.stringify(plan));
        window.location.href = 'study-plan.html';
    }
}

function loadStudyPlanDetail() {
    const planData = localStorage.getItem('currentStudyPlan');
    if (!planData) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    const plan = JSON.parse(planData);
    
    // Update title and summary
    const titleElement = document.getElementById('planTitle');
    if (titleElement) titleElement.innerHTML = `Study Plan - ${new Date(plan.generatedAt).toLocaleDateString()}`;
    
    const summaryElement = document.getElementById('planSummary');
    if (summaryElement) summaryElement.innerHTML = plan.summary;
    
    // Update session duration
    const durationElement = document.getElementById('sessionDuration');
    if (durationElement) durationElement.innerHTML = plan.sessionDuration;
    
    // Update techniques list
    const techniquesList = document.getElementById('techniquesList');
    if (techniquesList) {
        techniquesList.innerHTML = plan.studyTechniques.map(tech => `
            <li class="list-group-item">
                <i class="fas fa-check-circle text-success me-2"></i>${tech}
            </li>
        `).join('');
    }
    
    // Update weekly schedule
    const scheduleBody = document.getElementById('scheduleBody');
    if (scheduleBody && plan.weeklySchedule) {
        scheduleBody.innerHTML = Object.entries(plan.weeklySchedule).map(([day, schedule]) => `
            <tr>
                <td><strong>${day}</strong></td>
                <td>${schedule.sessions} sessions</td>
                <td>${schedule.subjects.join(', ')}</td>
                <td>${schedule.totalMinutes} min</td>
            </tr>
        `).join('');
    }
}

// Make functions global
window.logout = logout;
window.viewStudyPlan = viewStudyPlan;
window.loadDashboard = loadDashboard;
window.loadStudyPlanDetail = loadStudyPlanDetail;
window.checkAuth = checkAuth;
window.updateUserCount = updateUserCount;