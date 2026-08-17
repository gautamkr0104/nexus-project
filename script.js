/* ============================================
   NEXUS — Student Universe
   Main JavaScript
   ============================================ */

// ---------- DATA & STATE ----------

/** Default data structure for a new user */
function getDefaultData() {
    return {
        userName: '',
        xp: 0,
        level: 1,
        streak: 0,
        bestStreak: 0,
        completedMissions: 0,
        focusMinutes: 0,
        missions: [],
        subjects: [
            { id: 1, name: 'Mathematics', icon: '📐', progress: 0, color: '#a855f7' },
            { id: 2, name: 'Physics', icon: '⚛️', progress: 0, color: '#06b6d4' },
            { id: 3, name: 'Chemistry', icon: '🧪', progress: 0, color: '#3b82f6' },
            { id: 4, name: 'Biology', icon: '🧬', progress: 0, color: '#22c55e' },
            { id: 5, name: 'English', icon: '📖', progress: 0, color: '#eab308' },
            { id: 6, name: 'Computer Science', icon: '💻', progress: 0, color: '#ec4899' }
        ],
        notes: [],
        activity: {},  // { 'YYYY-MM-DD': { missions: N, focusMinutes: N } }
        settings: {
            focusDuration: 25,
            breakDuration: 5,
            soundEffects: true,
            theme: 'dark'
        },
        nextMissionId: 1,
        nextSubjectId: 7,
        nextNoteId: 1
    };
}

/** Demo missions shown on first launch */
function getDemoMissions(nextId) {
    return [
        {
            id: nextId,
            title: 'Revise Motion',
            subject: 'Physics',
            difficulty: 'medium',
            minutes: 30,
            completed: false,
            xp: 40
        },
        {
            id: nextId + 1,
            title: 'Complete 10 Algebra Problems',
            subject: 'Mathematics',
            difficulty: 'hard',
            minutes: 45,
            completed: false,
            xp: 75
        },
        {
            id: nextId + 2,
            title: 'Read English Chapter 3',
            subject: 'English',
            difficulty: 'easy',
            minutes: 20,
            completed: false,
            xp: 20
        }
    ];
}

/** XP required per level (level N needs N*100 XP) */
function xpForLevel(level) {
    return level * 100;
}

/** Level titles */
const levelTitles = {
    1: 'Curious Starter',
    2: 'Eager Learner',
    3: 'Knowledge Explorer',
    4: 'Brain Builder',
    5: 'Mind Architect',
    6: 'Wisdom Seeker',
    7: 'Scholar Prodigy',
    8: 'Intellectual Giant',
    9: 'Grandmaster',
    10: 'Universal Mind'
};

function getLevelTitle(level) {
    if (levelTitles[level]) return levelTitles[level];
    if (level >= 11) return 'Legendary Scholar';
    return 'Knowledge Explorer';
}

/** Motivational quotes */
const quotes = [
    "Discipline beats motivation.",
    "Your only competition is yesterday's version of you.",
    "Start before you're ready.",
    "Consistency creates results.",
    "Small progress is still progress.",
    "Your future self is watching.",
    "One focused hour beats three distracted ones.",
    "Keep going.",
    "The secret of getting ahead is getting started.",
    "The only way to do great work is to love what you do.",
    "It always seems impossible until it's done.",
    "Don't watch the clock; do what it does. Keep going.",
    "Success is the sum of small efforts repeated daily.",
    "Your brain is a muscle. The more you use it, the stronger it gets.",
    "Be stronger than your excuses."
];

/** Focus mode motivational quotes */
const focusQuotes = [
    "One focused hour beats three distracted ones.",
    "Your future self is watching.",
    "Small progress is still progress.",
    "Keep going.",
    "Deep work is the ability to focus without distraction.",
    "Concentration is the secret of strength.",
    "Focus on being productive instead of busy.",
    "The key is not to prioritize what's on your schedule, but to schedule your priorities."
];

/** Educational facts */
const facts = [
    "The speed of light is approximately 299,792 km/s — fast enough to circle Earth 7.5 times in one second.",
    "Octopuses have three hearts and blue blood.",
    "A teaspoon of neutron star material weighs about 6 billion tons.",
    "Water can boil and freeze at the same time in a process called the triple point.",
    "The human brain has about 86 billion neurons.",
    "Honey never spoils — archaeologists found 3000-year-old honey still edible.",
    "Venus is the only planet that spins clockwise.",
    "A group of flamingos is called a 'flamboyance'.",
    "The Great Wall of China is over 21,000 km long.",
    "Bananas are naturally radioactive due to potassium-40.",
    "The Moon is slowly drifting away from Earth at about 3.8 cm per year.",
    "DNA in all your cells stretched end to end would reach the Sun and back over 600 times.",
    "Elephants are the only animals that can't jump.",
    "There are more possible chess games than atoms in the observable universe.",
    "The inventor of the Pringles can is buried in one.",
    "A jiffy is an actual unit of time: 1/100th of a second.",
    "Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramid.",
    "Butterflies taste with their feet.",
    "Hot water freezes faster than cold water under certain conditions (Mpemba effect).",
    "The total weight of ants on Earth roughly equals the total weight of people.",
    "Saturn's density is low enough that it would float in water (if you had a big enough bathtub).",
    "Your stomach gets a new lining every 3-4 days to prevent it from digesting itself."
];

/** Subject colors for charts */
const subjectColors = ['#a855f7', '#06b6d4', '#3b82f6', '#22c55e', '#eab308', '#ec4899', '#ef4444', '#f97316'];

// ---------- STATE ----------

let nexusData = null;
let timerInterval = null;
let timerRunning = false;
let timerPaused = false;
let timerTotalSeconds = 0;
let timerRemainingSeconds = 0;
let currentPage = 'dashboard';
let missionFilter = 'all';
let editingNoteId = null;

// ---------- CORE FUNCTIONS ----------

/** Load data from localStorage */
function loadData() {
    const stored = localStorage.getItem('nexusData');
    if (stored) {
        try {
            nexusData = JSON.parse(stored);
            // Ensure all keys exist (migration for older versions)
            const defaults = getDefaultData();
            for (const key of Object.keys(defaults)) {
                if (!(key in nexusData)) {
                    nexusData[key] = defaults[key];
                }
            }
        } catch (e) {
            nexusData = getDefaultData();
        }
    } else {
        nexusData = getDefaultData();
        // Add demo data on first launch
        nexusData.missions = getDemoMissions(nexusData.nextMissionId);
        nexusData.nextMissionId = 4;
    }
}

/** Save data to localStorage */
function saveData() {
    localStorage.setItem('nexusData', JSON.stringify(nexusData));
}

// ---------- STREAK SYSTEM ----------

/** Get today's date as YYYY-MM-DD */
function todayStr() {
    return new Date().toISOString().split('T')[0];
}

/** Record activity for today */
function recordActivity(type, value) {
    const today = todayStr();
    if (!nexusData.activity[today]) {
        nexusData.activity[today] = { missions: 0, focusMinutes: 0 };
    }
    nexusData.activity[today][type] += value;
}

/** Update the streak based on activity */
function updateStreak() {
    const today = new Date();
    let streak = 0;
    let checkDate = new Date(today);

    // Check if today has activity
    const todayKey = todayStr();
    const todayActivity = nexusData.activity[todayKey];
    const todayHasActivity = todayActivity && (todayActivity.missions > 0 || todayActivity.focusMinutes > 0);

    // Start checking from today (or yesterday if today has no activity yet)
    if (!todayHasActivity) {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
        const key = checkDate.toISOString().split('T')[0];
        const dayAct = nexusData.activity[key];
        if (dayAct && (dayAct.missions > 0 || dayAct.focusMinutes > 0)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    nexusData.streak = streak;
    if (streak > nexusData.bestStreak) {
        nexusData.bestStreak = streak;
    }
}

// ---------- XP & LEVEL SYSTEM ----------

/** Add XP and check for level up */
function addXP(amount) {
    nexusData.xp += amount;
    checkLevelUp();
    saveData();
}

/** Check if user has enough XP to level up */
function checkLevelUp() {
    const required = xpForLevel(nexusData.level);
    if (nexusData.xp >= required) {
        nexusData.level++;
        nexusData.xp -= required;
        showLevelUp();
    }
}

/** Show level up overlay with confetti */
function showLevelUp() {
    const overlay = document.getElementById('levelUpOverlay');
    const levelText = document.getElementById('levelUpLevel');
    levelText.textContent = `Level ${nexusData.level} — ${getLevelTitle(nexusData.level)}`;
    overlay.classList.remove('hidden');
    spawnConfetti();

    // Auto-close after 3 seconds
    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 3000);

    // Click to close
    overlay.onclick = () => overlay.classList.add('hidden');
}

/** Spawn confetti particles */
function spawnConfetti() {
    const container = document.getElementById('confetti');
    container.innerHTML = '';
    const colors = ['#a855f7', '#06b6d4', '#3b82f6', '#22c55e', '#eab308', '#ec4899', '#ef4444'];

    for (let i = 0; i < 60; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.width = (Math.random() * 8 + 6) + 'px';
        piece.style.height = (Math.random() * 8 + 6) + 'px';
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
        piece.style.animationDelay = (Math.random() * 1.5) + 's';
        container.appendChild(piece);
    }
}

// ---------- TOAST NOTIFICATIONS ----------

/** Show a toast notification */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ---------- NAVIGATION ----------

/** Switch to a page */
function navigateTo(page) {
    currentPage = page;
    // Update nav buttons
    document.querySelectorAll('.nav-btn[data-page]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === page);
    });
    // Show/hide pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    const pageEl = document.getElementById('page-' + page);
    if (pageEl) pageEl.classList.add('active');

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.add('hidden');

    // Refresh page content
    if (page === 'dashboard') renderDashboard();
    else if (page === 'missions') renderMissions();
    else if (page === 'focus') renderFocus();
    else if (page === 'subjects') renderSubjects();
    else if (page === 'notes') renderNotes();
    else if (page === 'analytics') renderAnalytics();
}

// ---------- DASHBOARD ----------

/** Render the main dashboard */
function renderDashboard() {
    // Greeting
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';
    document.getElementById('greetingText').textContent = `${greeting}, ${nexusData.userName || 'Student'}`;

    // Date
    const now = new Date();
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    // Avatar
    document.getElementById('avatar').textContent = (nexusData.userName || 'S')[0].toUpperCase();

    // XP bar
    const required = xpForLevel(nexusData.level);
    const pct = Math.min((nexusData.xp / required) * 100, 100);
    document.getElementById('xpLevel').textContent = `LEVEL ${nexusData.level}`;
    document.getElementById('xpTitle').textContent = getLevelTitle(nexusData.level);
    document.getElementById('xpFill').style.width = pct + '%';
    document.getElementById('xpNumbers').textContent = `${nexusData.xp} / ${required} XP`;

    // Today's stats
    const today = todayStr();
    const todayAct = nexusData.activity[today] || { missions: 0, focusMinutes: 0 };
    updateStreak();
    document.getElementById('statMissions').textContent = todayAct.missions;
    document.getElementById('statFocus').textContent = todayAct.focusMinutes;
    document.getElementById('statStreak').textContent = '🔥 ' + nexusData.streak;
    // XP earned today = sum of XP from today's completed missions + focus XP
    let todayXP = 0;
    nexusData.missions.filter(m => m.completed && m.completedDate === today).forEach(m => todayXP += m.xp);
    document.getElementById('statXP').textContent = '+' + todayXP;

    // Daily quote
    const quoteIdx = now.getDate() % quotes.length;
    document.getElementById('dailyQuote').textContent = `"${quotes[quoteIdx]}"`;

    // Random fact
    document.getElementById('randomFact').textContent = facts[Math.floor(Math.random() * facts.length)];

    // Quick missions on dashboard
    const dashList = document.getElementById('dashMissionList');
    const activeMissions = nexusData.missions.filter(m => !m.completed).slice(0, 4);
    if (activeMissions.length === 0) {
        dashList.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🎯</span>
                <p class="empty-title">No active missions</p>
                <p class="empty-sub">Your next achievement is waiting.</p>
            </div>
        `;
    } else {
        dashList.innerHTML = activeMissions.map(m => createMissionCard(m, true)).join('');
        attachMissionListeners(dashList);
    }
}

// ---------- MISSIONS ----------

/** Create HTML for a single mission card */
function createMissionCard(mission, compact = false) {
    const diffClass = 'badge-' + mission.difficulty;
    const diffLabel = mission.difficulty.charAt(0).toUpperCase() + mission.difficulty.slice(1);
    return `
        <div class="mission-card ${mission.completed ? 'completed' : ''}" data-id="${mission.id}">
            <button class="mission-check" data-action="toggle" aria-label="Toggle mission completion">${mission.completed ? '✓' : ''}</button>
            <div class="mission-info">
                <div class="mission-name">${escapeHTML(mission.title)}</div>
                <div class="mission-meta">
                    <span>${mission.subject || 'General'}</span>
                    <span class="mission-badge ${diffClass}">${diffLabel}</span>
                    ${mission.minutes ? `<span>⏱ ${mission.minutes}m</span>` : ''}
                </div>
            </div>
            <span class="mission-xp">+${mission.xp} XP</span>
            ${!compact ? `<button class="mission-delete" data-action="delete" aria-label="Delete mission">✕</button>` : ''}
        </div>
    `;
}

/** Attach event listeners to mission cards */
function attachMissionListeners(container) {
    container.querySelectorAll('.mission-card').forEach(card => {
        const id = parseInt(card.dataset.id);
        card.querySelector('[data-action="toggle"]').addEventListener('click', () => toggleMission(id));
        const delBtn = card.querySelector('[data-action="delete"]');
        if (delBtn) delBtn.addEventListener('click', () => deleteMission(id));
    });
}

/** Render the missions page */
function renderMissions() {
    // Populate subject dropdown
    const subjectSelect = document.getElementById('missionSubject');
    const currentVal = subjectSelect.value;
    subjectSelect.innerHTML = '<option value="">Select subject</option>' +
        nexusData.subjects.map(s => `<option value="${s.name}" ${s.name === currentVal ? 'selected' : ''}>${s.icon} ${s.name}</option>`).join('');

    // Filter missions
    let filtered = nexusData.missions;
    if (missionFilter === 'active') filtered = filtered.filter(m => !m.completed);
    else if (missionFilter === 'completed') filtered = filtered.filter(m => m.completed);

    const list = document.getElementById('missionList');
    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🎯</span>
                <p class="empty-title">${missionFilter === 'completed' ? 'No completed missions yet' : 'No missions yet'}</p>
                <p class="empty-sub">${missionFilter === 'completed' ? 'Complete a mission to see it here.' : 'Your next achievement is waiting.'}</p>
            </div>
        `;
    } else {
        list.innerHTML = filtered.map(m => createMissionCard(m)).join('');
        attachMissionListeners(list);
    }
}

/** Add a new mission */
function addMission() {
    const title = document.getElementById('missionTitle').value.trim();
    if (!title) {
        showToast('Please enter a mission title.', 'error');
        return;
    }

    const subject = document.getElementById('missionSubject').value;
    const difficulty = document.getElementById('missionDifficulty').value;
    const minutes = parseInt(document.getElementById('missionMinutes').value) || 0;

    const xpMap = { easy: 20, medium: 40, hard: 75 };

    const mission = {
        id: nexusData.nextMissionId++,
        title: title,
        subject: subject,
        difficulty: difficulty,
        minutes: minutes,
        completed: false,
        xp: xpMap[difficulty] || 40
    };

    nexusData.missions.push(mission);
    saveData();

    // Clear form
    document.getElementById('missionTitle').value = '';
    document.getElementById('missionMinutes').value = '';

    showToast('Mission added!', 'success');
    renderMissions();
}

/** Toggle mission completion */
function toggleMission(id) {
    const mission = nexusData.missions.find(m => m.id === id);
    if (!mission) return;

    if (!mission.completed) {
        mission.completed = true;
        mission.completedDate = todayStr();
        nexusData.completedMissions++;
        recordActivity('missions', 1);
        addXP(mission.xp);
        showToast(`Mission completed! +${mission.xp} XP earned!`, 'success');
        updateStreak();
    } else {
        mission.completed = false;
        mission.completedDate = null;
        nexusData.completedMissions = Math.max(0, nexusData.completedMissions - 1);
        // Remove activity record (simplified: just decrement)
        const today = todayStr();
        if (nexusData.activity[today]) {
            nexusData.activity[today].missions = Math.max(0, nexusData.activity[today].missions - 1);
        }
    }

    saveData();
    renderMissions();
    if (currentPage === 'dashboard') renderDashboard();
}

/** Delete a mission */
function deleteMission(id) {
    nexusData.missions = nexusData.missions.filter(m => m.id !== id);
    saveData();
    showToast('Mission deleted.', 'info');
    renderMissions();
    if (currentPage === 'dashboard') renderDashboard();
}

// ---------- FOCUS MODE ----------

/** Render the focus page */
function renderFocus() {
    document.getElementById('focusQuote').textContent = `"${focusQuotes[Math.floor(Math.random() * focusQuotes.length)]}"`;

    // Update timer display if not running
    if (!timerRunning) {
        const focusMin = nexusData.settings.focusDuration;
        document.getElementById('focusDuration').value = focusMin;
        document.getElementById('breakDuration').value = nexusData.settings.breakDuration;
        updateTimerDisplay(focusMin * 60);
    }

    document.getElementById('focusComplete').classList.add('hidden');
}

/** Update timer display */
function updateTimerDisplay(totalSec) {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    document.getElementById('timerMinutes').textContent = String(mins).padStart(2, '0');
    document.getElementById('timerSeconds').textContent = String(secs).padStart(2, '0');

    // Update circular progress
    const totalDuration = timerTotalSeconds || (nexusData.settings.focusDuration * 60);
    const circumference = 2 * Math.PI * 90; // radius = 90
    const offset = circumference * (1 - totalSec / totalDuration);
    document.getElementById('timerProgress').style.strokeDashoffset = offset;
}

/** Start the timer */
function startTimer() {
    if (timerRunning && !timerPaused) return;

    if (!timerRunning) {
        // Fresh start
        const focusMin = parseInt(document.getElementById('focusDuration').value) || 25;
        timerTotalSeconds = focusMin * 60;
        timerRemainingSeconds = timerTotalSeconds;
        document.getElementById('timerProgress').style.strokeDasharray = 2 * Math.PI * 90;
    }

    timerRunning = true;
    timerPaused = false;

    document.getElementById('timerStart').disabled = true;
    document.getElementById('timerPause').disabled = false;
    document.getElementById('focusDuration').disabled = true;
    document.getElementById('breakDuration').disabled = true;

    timerInterval = setInterval(() => {
        timerRemainingSeconds--;
        updateTimerDisplay(timerRemainingSeconds);

        if (timerRemainingSeconds <= 0) {
            clearInterval(timerInterval);
            timerRunning = false;
            timerPaused = false;
            document.getElementById('timerStart').disabled = false;
            document.getElementById('timerPause').disabled = true;
            document.getElementById('focusDuration').disabled = false;
            document.getElementById('breakDuration').disabled = false;
            focusSessionComplete();
        }
    }, 1000);
}

/** Pause the timer */
function pauseTimer() {
    if (!timerRunning || timerPaused) return;
    clearInterval(timerInterval);
    timerPaused = true;
    document.getElementById('timerStart').disabled = false;
    document.getElementById('timerStart').textContent = 'Resume';
    document.getElementById('timerPause').disabled = true;
}

/** Reset the timer */
function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerPaused = false;
    timerTotalSeconds = 0;
    timerRemainingSeconds = 0;

    const focusMin = parseInt(document.getElementById('focusDuration').value) || 25;
    updateTimerDisplay(focusMin * 60);

    document.getElementById('timerStart').disabled = false;
    document.getElementById('timerStart').textContent = 'Start';
    document.getElementById('timerPause').disabled = true;
    document.getElementById('focusDuration').disabled = false;
    document.getElementById('breakDuration').disabled = false;
}

/** Handle focus session completion */
function focusSessionComplete() {
    const focusMin = parseInt(document.getElementById('focusDuration').value) || 25;

    nexusData.focusMinutes += focusMin;
    recordActivity('focusMinutes', focusMin);

    // Award XP based on focus time
    let xp = 10;
    if (focusMin >= 50) xp = 70;
    else if (focusMin >= 25) xp = 30;
    else if (focusMin >= 10) xp = 10;

    addXP(xp);
    updateStreak();
    saveData();

    document.getElementById('focusCompleteText').textContent =
        `You focused for ${focusMin} minutes and earned ${xp} XP!`;
    document.getElementById('focusComplete').classList.remove('hidden');
    showToast(`Focus session complete! +${xp} XP earned!`, 'success');

    timerTotalSeconds = 0;
    timerRemainingSeconds = 0;
    updateTimerDisplay(focusMin * 60);
}

// ---------- SUBJECTS ----------

/** Get gradient color for a subject */
function getSubjectColor(subject, index) {
    if (subject.color) return subject.color;
    return subjectColors[index % subjectColors.length];
}

/** Render subjects page */
function renderSubjects() {
    const grid = document.getElementById('subjectList');

    if (nexusData.subjects.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📚</span>
                <p class="empty-title">No subjects yet</p>
                <p class="empty-sub">Add your first subject above.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = nexusData.subjects.map((s, i) => {
        const color = getSubjectColor(s, i);
        const completedCount = nexusData.missions.filter(m => m.completed && m.subject === s.name).length;
        return `
            <div class="subject-card" data-id="${s.id}">
                <div class="subject-header">
                    <span class="subject-icon">${s.icon}</span>
                    <span class="subject-name">${escapeHTML(s.name)}</span>
                </div>
                <div class="subject-progress-bar">
                    <div class="subject-progress-fill" style="width: ${s.progress}%; background: ${color};"></div>
                </div>
                <div class="subject-stats">
                    <span>${s.progress}% complete</span>
                    <span>${completedCount} missions done</span>
                </div>
                <button class="subject-delete" data-action="delete-subject" aria-label="Delete subject">Delete</button>
            </div>
        `;
    }).join('');

    // Attach listeners
    grid.querySelectorAll('.subject-card').forEach(card => {
        const id = parseInt(card.dataset.id);
        card.addEventListener('click', (e) => {
            if (e.target.dataset.action === 'delete-subject') return;
            openSubjectDetail(id);
        });
        card.querySelector('[data-action="delete-subject"]').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSubject(id);
        });
    });
}

/** Open subject detail (update progress) */
function openSubjectDetail(id) {
    const subject = nexusData.subjects.find(s => s.id === id);
    if (!subject) return;
    const newProgress = prompt(`Update progress for "${subject.name}" (0-100):`, subject.progress);
    if (newProgress === null) return;
    const val = parseInt(newProgress);
    if (isNaN(val) || val < 0 || val > 100) {
        showToast('Please enter a number between 0 and 100.', 'error');
        return;
    }
    subject.progress = val;
    saveData();
    showToast('Subject progress updated!', 'success');
    renderSubjects();
}

/** Add a new subject */
function addSubject() {
    const name = document.getElementById('subjectName').value.trim();
    const icon = document.getElementById('subjectIcon').value.trim() || '📘';

    if (!name) {
        showToast('Please enter a subject name.', 'error');
        return;
    }

    if (nexusData.subjects.find(s => s.name.toLowerCase() === name.toLowerCase())) {
        showToast('Subject already exists.', 'error');
        return;
    }

    nexusData.subjects.push({
        id: nexusData.nextSubjectId++,
        name: name,
        icon: icon,
        progress: 0,
        color: subjectColors[nexusData.subjects.length % subjectColors.length]
    });

    saveData();
    document.getElementById('subjectName').value = '';
    document.getElementById('subjectIcon').value = '';
    showToast('Subject added!', 'success');
    renderSubjects();
}

/** Delete a subject */
function deleteSubject(id) {
    nexusData.subjects = nexusData.subjects.filter(s => s.id !== id);
    saveData();
    showToast('Subject deleted.', 'info');
    renderSubjects();
}

// ---------- NOTES ----------

/** Render the notes page */
function renderNotes() {
    const list = document.getElementById('noteList');

    if (nexusData.notes.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📝</span>
                <p class="empty-title">Your notebook is empty</p>
                <p class="empty-sub">Capture your first idea.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = nexusData.notes.map(note => `
        <div class="note-card" data-id="${note.id}">
            <div class="note-title">${escapeHTML(note.title)}</div>
            <div class="note-content">${escapeHTML(note.content)}</div>
            <div class="note-actions">
                <button class="btn btn-small btn-secondary" data-action="edit">Edit</button>
                <button class="btn btn-small btn-danger" data-action="delete">Delete</button>
            </div>
        </div>
    `).join('');

    list.querySelectorAll('.note-card').forEach(card => {
        const id = parseInt(card.dataset.id);
        card.querySelector('[data-action="edit"]').addEventListener('click', () => editNote(id));
        card.querySelector('[data-action="delete"]').addEventListener('click', () => deleteNote(id));
    });
}

/** Save or update a note */
function saveNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();

    if (!title) {
        showToast('Please enter a note title.', 'error');
        return;
    }

    if (editingNoteId) {
        // Update existing
        const note = nexusData.notes.find(n => n.id === editingNoteId);
        if (note) {
            note.title = title;
            note.content = content;
            note.updatedAt = new Date().toISOString();
        }
        editingNoteId = null;
        document.getElementById('noteFormTitle').textContent = 'New Note';
        document.getElementById('cancelEditBtn').classList.add('hidden');
        showToast('Note updated!', 'success');
    } else {
        // Create new
        nexusData.notes.push({
            id: nexusData.nextNoteId++,
            title: title,
            content: content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        showToast('Note saved!', 'success');
    }

    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    saveData();
    renderNotes();
}

/** Edit a note */
function editNote(id) {
    const note = nexusData.notes.find(n => n.id === id);
    if (!note) return;

    editingNoteId = id;
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteContent').value = note.content;
    document.getElementById('noteFormTitle').textContent = 'Edit Note';
    document.getElementById('cancelEditBtn').classList.remove('hidden');

    // Scroll to form
    document.getElementById('noteTitle').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/** Cancel note editing */
function cancelEdit() {
    editingNoteId = null;
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    document.getElementById('noteFormTitle').textContent = 'New Note';
    document.getElementById('cancelEditBtn').classList.add('hidden');
}

/** Delete a note */
function deleteNote(id) {
    nexusData.notes = nexusData.notes.filter(n => n.id !== id);
    saveData();
    showToast('Note deleted.', 'info');
    if (editingNoteId === id) cancelEdit();
    renderNotes();
}

// ---------- ANALYTICS ----------

/** Render the analytics page */
function renderAnalytics() {
    document.getElementById('analyticsXP').textContent = nexusData.xp + (nexusData.level - 1) * 100;
    document.getElementById('analyticsLevel').textContent = nexusData.level;
    document.getElementById('analyticsStreak').textContent = nexusData.bestStreak;
    document.getElementById('analyticsMissions').textContent = nexusData.completedMissions;
    document.getElementById('analyticsFocus').textContent = nexusData.focusMinutes;
    document.getElementById('analyticsNotes').textContent = nexusData.notes.length;

    renderWeeklyChart();
    renderSubjectChart();
}

/** Render the weekly activity bar chart */
function renderWeeklyChart() {
    const chart = document.getElementById('weeklyChart');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const dayOfWeek = today.getDay();

    let maxVal = 1;
    const weekData = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - dayOfWeek + i);
        const key = d.toISOString().split('T')[0];
        const act = nexusData.activity[key];
        const val = act ? (act.missions + act.focusMinutes) : 0;
        weekData.push({ day: days[i], value: val });
        if (val > maxVal) maxVal = val;
    }

    chart.innerHTML = weekData.map(d => {
        const height = maxVal > 0 ? (d.value / maxVal * 160) : 4;
        return `
            <div class="bar-item">
                <span class="bar-value">${d.value}</span>
                <div class="bar" style="height: ${Math.max(height, 4)}px;"></div>
                <span class="bar-label">${d.day}</span>
            </div>
        `;
    }).join('');
}

/** Render the subject progress chart */
function renderSubjectChart() {
    const chart = document.getElementById('subjectChart');

    if (nexusData.subjects.length === 0) {
        chart.innerHTML = '<p class="text-muted">No subjects to display.</p>';
        return;
    }

    chart.innerHTML = nexusData.subjects.map((s, i) => {
        const color = getSubjectColor(s, i);
        return `
            <div class="subject-chart-row">
                <span class="subject-chart-label">${s.icon} ${escapeHTML(s.name)}</span>
                <div class="subject-chart-bar">
                    <div class="subject-chart-fill" style="width: ${s.progress}%; background: ${color};"></div>
                </div>
                <span class="subject-chart-value">${s.progress}%</span>
            </div>
        `;
    }).join('');
}

// ---------- SEARCH ----------

/** Handle search input */
function handleSearch(query) {
    query = query.toLowerCase().trim();
    if (!query) {
        // Reset to normal view
        if (currentPage === 'missions') renderMissions();
        if (currentPage === 'notes') renderNotes();
        return;
    }

    if (currentPage === 'missions') {
        const filtered = nexusData.missions.filter(m =>
            m.title.toLowerCase().includes(query) ||
            (m.subject && m.subject.toLowerCase().includes(query))
        );
        const list = document.getElementById('missionList');
        if (filtered.length === 0) {
            list.innerHTML = `<div class="empty-state"><p class="empty-title">No missions match "${escapeHTML(query)}"</p></div>`;
        } else {
            list.innerHTML = filtered.map(m => createMissionCard(m)).join('');
            attachMissionListeners(list);
        }
    }

    if (currentPage === 'notes') {
        const filtered = nexusData.notes.filter(n =>
            n.title.toLowerCase().includes(query) ||
            n.content.toLowerCase().includes(query)
        );
        const list = document.getElementById('noteList');
        if (filtered.length === 0) {
            list.innerHTML = `<div class="empty-state"><p class="empty-title">No notes match "${escapeHTML(query)}"</p></div>`;
        } else {
            list.innerHTML = filtered.map(note => `
                <div class="note-card" data-id="${note.id}">
                    <div class="note-title">${escapeHTML(note.title)}</div>
                    <div class="note-content">${escapeHTML(note.content)}</div>
                    <div class="note-actions">
                        <button class="btn btn-small btn-secondary" data-action="edit">Edit</button>
                        <button class="btn btn-small btn-danger" data-action="delete">Delete</button>
                    </div>
                </div>
            `).join('');
            list.querySelectorAll('.note-card').forEach(card => {
                const id = parseInt(card.dataset.id);
                card.querySelector('[data-action="edit"]').addEventListener('click', () => editNote(id));
                card.querySelector('[data-action="delete"]').addEventListener('click', () => deleteNote(id));
            });
        }
    }
}

// ---------- THEME ----------

/** Apply theme */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    nexusData.settings.theme = theme;
    const btnText = theme === 'dark' ? '🌙' : '☀️';
    document.getElementById('themeToggle').textContent = btnText;
    document.getElementById('themeToggleMobile').textContent = btnText;
    saveData();
}

/** Toggle theme */
function toggleTheme() {
    const current = nexusData.settings.theme || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
}

// ---------- SETTINGS ----------

/** Open settings modal */
function openSettings() {
    document.getElementById('settingsName').value = nexusData.userName;
    document.getElementById('settingsFocus').value = nexusData.settings.focusDuration;
    document.getElementById('settingsBreak').value = nexusData.settings.breakDuration;
    document.getElementById('settingsSound').checked = nexusData.settings.soundEffects;
    document.getElementById('settingsModal').classList.remove('hidden');
}

/** Save settings */
function saveSettings() {
    const name = document.getElementById('settingsName').value.trim();
    if (name) nexusData.userName = name;

    nexusData.settings.focusDuration = parseInt(document.getElementById('settingsFocus').value) || 25;
    nexusData.settings.breakDuration = parseInt(document.getElementById('settingsBreak').value) || 5;
    nexusData.settings.soundEffects = document.getElementById('settingsSound').checked;

    saveData();
    document.getElementById('settingsModal').classList.add('hidden');
    showToast('Settings updated!', 'success');

    // Update timer defaults
    if (!timerRunning) {
        document.getElementById('focusDuration').value = nexusData.settings.focusDuration;
        document.getElementById('breakDuration').value = nexusData.settings.breakDuration;
    }

    renderDashboard();
}

/** Reset all data */
function resetAllData() {
    localStorage.removeItem('nexusData');
    nexusData = getDefaultData();
    nexusData.missions = getDemoMissions(nexusData.nextMissionId);
    nexusData.nextMissionId = 4;
    saveData();
    document.getElementById('confirmModal').classList.add('hidden');
    document.getElementById('settingsModal').classList.add('hidden');
    showToast('All data has been reset.', 'info');
    navigateTo('dashboard');
}

// ---------- HELPERS ----------

/** Escape HTML to prevent XSS */
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ---------- DATA EXPORT / IMPORT ----------

/** Export all data as JSON file */
function exportData() {
    const blob = new Blob([JSON.stringify(nexusData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-data-${todayStr()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!', 'success');
}

/** Import data from JSON file */
function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            // Validate it has expected structure
            if (!imported || typeof imported !== 'object') throw new Error('Invalid data');
            const defaults = getDefaultData();
            for (const key of Object.keys(defaults)) {
                if (!(key in imported)) {
                    imported[key] = defaults[key];
                }
            }
            nexusData = imported;
            saveData();
            applyTheme(nexusData.settings.theme || 'dark');
            renderDashboard();
            showToast('Data imported successfully!', 'success');
        } catch (err) {
            showToast('Failed to import data. Invalid file format.', 'error');
        }
    };
    reader.readAsText(file);
}

// ---------- EVENT LISTENERS ----------

document.addEventListener('DOMContentLoaded', () => {
    // Load data
    loadData();
    applyTheme(nexusData.settings.theme || 'dark');

    // Check if first launch (no name)
    if (!nexusData.userName) {
        document.getElementById('nameModal').classList.remove('hidden');
    }

    // Name submit
    document.getElementById('nameSubmit').addEventListener('click', () => {
        const name = document.getElementById('nameInput').value.trim();
        if (name) {
            nexusData.userName = name;
            saveData();
            document.getElementById('nameModal').classList.add('hidden');
            renderDashboard();
            showToast(`Welcome to NEXUS, ${name}!`, 'success');
        }
    });
    document.getElementById('nameInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('nameSubmit').click();
    });

    // Navigation
    document.querySelectorAll('.nav-btn[data-page]').forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.dataset.page));
    });

    document.getElementById('goToMissions')?.addEventListener('click', () => navigateTo('missions'));

    // Hamburger menu
    document.getElementById('hamburger').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebarOverlay').classList.toggle('hidden');
    });
    document.getElementById('sidebarOverlay').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.add('hidden');
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('themeToggleMobile').addEventListener('click', toggleTheme);

    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => handleSearch(e.target.value));
    document.getElementById('searchInputDesktop').addEventListener('input', (e) => handleSearch(e.target.value));

    // Missions
    document.getElementById('addMissionBtn').addEventListener('click', addMission);
    document.getElementById('missionTitle').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addMission();
    });
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            missionFilter = btn.dataset.filter;
            renderMissions();
        });
    });

    // Focus
    document.getElementById('timerStart').addEventListener('click', () => {
        if (timerPaused) {
            startTimer();
        } else {
            startTimer();
        }
    });
    document.getElementById('timerPause').addEventListener('click', pauseTimer);
    document.getElementById('timerReset').addEventListener('click', resetTimer);

    // Subjects
    document.getElementById('addSubjectBtn').addEventListener('click', addSubject);
    document.getElementById('subjectName').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addSubject();
    });

    // Notes
    document.getElementById('saveNoteBtn').addEventListener('click', saveNote);
    document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);

    // Random fact
    document.getElementById('newFactBtn').addEventListener('click', () => {
        document.getElementById('randomFact').textContent = facts[Math.floor(Math.random() * facts.length)];
    });

    // Settings
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('closeSettings').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.add('hidden');
    });
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('settingsDark').addEventListener('click', () => applyTheme('dark'));
    document.getElementById('settingsLight').addEventListener('click', () => applyTheme('light'));

    // Reset data
    document.getElementById('resetDataBtn').addEventListener('click', () => {
        document.getElementById('confirmModal').classList.remove('hidden');
    });
    document.getElementById('confirmYes').addEventListener('click', resetAllData);
    document.getElementById('confirmNo').addEventListener('click', () => {
        document.getElementById('confirmModal').classList.add('hidden');
    });

    // Export / Import data
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    document.getElementById('importDataBtn').addEventListener('click', () => {
        document.getElementById('importFileInput').click();
    });
    document.getElementById('importFileInput').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importData(e.target.files[0]);
            e.target.value = '';
        }
    });

    // Close modals on overlay click
    document.getElementById('settingsModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('settingsModal')) {
            document.getElementById('settingsModal').classList.add('hidden');
        }
    });
    document.getElementById('confirmModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('confirmModal')) {
            document.getElementById('confirmModal').classList.add('hidden');
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape closes modals
        if (e.key === 'Escape') {
            document.getElementById('settingsModal').classList.add('hidden');
            document.getElementById('confirmModal').classList.add('hidden');
            document.getElementById('levelUpOverlay').classList.add('hidden');
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('sidebarOverlay').classList.add('hidden');
        }
        // Ctrl+K / Cmd+K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.top-bar .search-box') || document.getElementById('searchInput');
            if (searchInput) searchInput.focus();
        }
        // Ctrl+Enter to add mission when focused on mission title
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (document.activeElement?.id === 'missionTitle') addMission();
        }
    });

    // Initial render
    renderDashboard();
});
