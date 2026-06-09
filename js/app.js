// User data storage
let currentUser = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    updateUserCount();
    setupEventListeners();
});

function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            login(email, password);
        });
    }
    
    // Register form
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
    
    // Assessment form
    const assessmentForm = document.getElementById('assessmentForm');
    if (assessmentForm) {
        assessmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAssessmentData();
        });
    }
}

// Register new user
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

// Login user
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

// Logout user
function logout() {
    sessionStorage.removeItem('currentUser');
    currentUser = null;
    window.location.href = 'index.html';
}

// Check authentication
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

// Save assessment data
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

// Generate study plan
function generateStudyPlan(assessment) {
    const subjects = assessment.subjects.split(',').map(s => s.trim());
    let sessionDuration = 45;
    if (assessment.concentrationLevel === 'low') sessionDuration = 25;
    else if (assessment.concentrationLevel === 'high') sessionDuration = 60;
    
    const techniques = {
        visual: ["Create mind maps", "Use color-coded notes", "Watch videos", "Use flashcards with images"],
        auditory: ["Record and listen to notes", "Study in groups", "Use rhymes", "Listen to podcasts"],
        reading: ["Write summaries", "Create outlines", "Read actively", "Rewrite notes"],
        kinesthetic: ["Take movement breaks", "Use hands-on activities", "Walk while studying", "Build models"],
        mixed: ["Combine multiple techniques", "Rotate activities", "Use varied methods"]
    };
    
    return {
        id: Date.now(),
        generatedAt: new Date().toISOString(),
        learningStyle: assessment.learningStyle,
        subjects: subjects,
        sessionDuration: sessionDuration,
        studyTechniques: techniques[assessment.learningStyle] || techniques.mixed,
        summary: `Based on your ${assessment.learningStyle} learning style, study in ${sessionDuration}-minute sessions.`
    };
}

// Update user count
function updateUserCount() {
    const users = JSON.parse(localStorage.getItem('weStudyUsers')) || [];
    const userCountSpan = document.getElementById('userCount');
    if (userCountSpan) {
        userCountSpan.textContent = users.length;
    }
}

// Load dashboard
function loadDashboard() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update welcome message
    const welcomeElement = document.querySelector('.bg-gradient-primary h2');
    if (welcomeElement) {
        welcomeElement.innerHTML = `Welcome back, ${currentUser.name}! 👋`;
    }
    
    // Update learning style display
    if (currentUser.learningProfile) {
        const styleElement = document.getElementById('learningStyleDisplay');
        if (styleElement) {
            styleElement.textContent = currentUser.learningProfile.learningStyle.charAt(0).toUpperCase() + 
                currentUser.learningProfile.learningStyle.slice(1);
        }
    }
    
    // Update study plans
    const studyPlansContainer = document.getElementById('studyPlansContainer');
    if (studyPlansContainer) {
        const plans = currentUser.studyPlans || [];
        document.getElementById('activePlans').textContent = plans.length;
        
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
                    <div class="plan-card p-3">
                        <h5>Study Plan - ${new Date(plan.generatedAt).toLocaleDateString()}</h5>
                        <p class="text-muted">${plan.subjects.length} subjects | ${plan.sessionDuration} min sessions</p>
                        <button onclick="viewStudyPlan(${plan.id})" class="btn btn-primary btn-sm">View Plan</button>
                    </div>
                </div>
            `).join('');
        }
    }
}

// View study plan
function viewStudyPlan(planId) {
    const plan = currentUser.studyPlans.find(p => p.id === planId);
    if (plan) {
        localStorage.setItem('currentStudyPlan', JSON.stringify(plan));
        window.location.href = 'study-plan.html';
    }
}

// Load study plan detail
function loadStudyPlanDetail() {
    const planData = localStorage.getItem('currentStudyPlan');
    if (!planData) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    const plan = JSON.parse(planData);
    
    document.getElementById('planTitle').innerHTML = `Study Plan - ${new Date(plan.generatedAt).toLocaleDateString()}`;
    document.getElementById('planSummary').innerHTML = plan.summary;
    document.getElementById('sessionDuration').innerHTML = plan.sessionDuration;
    
    const techniquesList = document.getElementById('techniquesList');
    if (techniquesList) {
        techniquesList.innerHTML = plan.studyTechniques.map(tech => `
            <li class="list-group-item"><i class="fas fa-check-circle text-success me-2"></i>${tech}</li>
        `).join('');
    }
}

// Make functions global
window.logout = logout;
window.viewStudyPlan = viewStudyPlan;
window.loadDashboard = loadDashboard;
window.loadStudyPlanDetail = loadStudyPlanDetail;