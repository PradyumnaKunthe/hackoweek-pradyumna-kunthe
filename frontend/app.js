// State Variables
let currentCategory = null;
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = []; // Format: { id: "q1", answer: "A", timeRemaining: 15 }
let timerInterval;
let timeRemaining = 20;
const MAX_TIME = 20;
let soundEnabled = true;

// DOM Elements
const views = {
    landing: document.getElementById('landing-page'),
    quiz: document.getElementById('quiz-page'),
    loading: document.getElementById('loading-page'),
    results: document.getElementById('results-page'),
    leaderboard: document.getElementById('leaderboard-page')
};

const categoryCards = document.querySelectorAll('.category-card');
const startBtn = document.getElementById('start-btn');
const themeToggle = document.getElementById('theme-toggle');
const soundToggle = document.getElementById('sound-toggle');
const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const timerBar = document.getElementById('timer-bar');
const timerText = document.getElementById('timer-text');
const questionProgress = document.getElementById('question-progress');
const currentScoreElement = document.getElementById('current-score');

// Sounds (Using simple base64 placeholders or free sound links for robustness)
// Real URLs to free usable low-latency beeps
const sfx = {
    correct: new Audio('https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg'),
    incorrect: new Audio('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg'),
    finish: new Audio('https://actions.google.com/sounds/v1/cartoon/clown_horn.ogg')
};

// Initialize
function init() {
    // Theme setup
    const savedTheme = localStorage.getItem('quizTheme');
    if (savedTheme === 'light') toggleTheme(false);
    
    // Category selection
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            categoryCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            currentCategory = card.dataset.category;
            startBtn.disabled = false;
        });
    });

    // Event listeners
    startBtn.addEventListener('click', startQuiz);
    themeToggle.addEventListener('click', () => toggleTheme(true));
    soundToggle.addEventListener('click', toggleSound);
    viewLeaderboardBtn.addEventListener('click', showLeaderboard);
    
    document.getElementById('restart-btn').addEventListener('click', () => switchView('landing'));
    document.getElementById('home-btn').addEventListener('click', () => switchView('landing'));
    document.getElementById('back-home-btn').addEventListener('click', () => switchView('landing'));
    document.getElementById('save-score-btn').addEventListener('click', saveScore);
}

// Utils
function switchView(viewName) {
    Object.values(views).forEach(view => view.classList.remove('active'));
    views[viewName].classList.add('active');
}

function toggleTheme(manual = false) {
    if (manual) {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('quizTheme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    } else {
        document.body.classList.remove('dark-mode');
    }
    const icon = themeToggle.querySelector('i');
    if (document.body.classList.contains('dark-mode')) {
        icon.className = 'fa-solid fa-sun';
    } else {
        icon.className = 'fa-solid fa-moon';
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const icon = soundToggle.querySelector('i');
    icon.className = soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
}

function playSound(type) {
    if (!soundEnabled) return;
    sfx[type].currentTime = 0;
    sfx[type].play().catch(() => {}); // Catch play preventions
}

// Quiz Flow
async function startQuiz() {
    if (!currentCategory) return;
    switchView('loading');
    
    try {
        const response = await fetch(`http://localhost:3000/api/questions?category=${currentCategory}`);
        questions = await response.json();
        
        if (questions.length === 0) {
            alert("No questions found for this category!");
            switchView('landing');
            return;
        }

        currentQuestionIndex = 0;
        userAnswers = [];
        currentScoreElement.innerText = "0";
        showQuestion();
        switchView('quiz');
    } catch (error) {
        console.error("Error fetching questions:", error);
        alert("Failed to connect to the server.");
        switchView('landing');
    }
}

function showQuestion() {
    const question = questions[currentQuestionIndex];
    questionText.innerText = question.question;
    questionProgress.innerText = `Question ${currentQuestionIndex + 1}/${questions.length}`;
    
    optionsContainer.innerHTML = '';
    question.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = option;
        btn.addEventListener('click', () => handleAnswer(option, btn));
        optionsContainer.appendChild(btn);
    });

    startTimer();
}

function startTimer() {
    timeRemaining = MAX_TIME;
    updateTimerUI();
    clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerUI();
        
        if (timeRemaining <= 0) {
            handleAnswer(null, null); // Time's up
        }
    }, 1000);
}

function updateTimerUI() {
    timerText.innerText = `${timeRemaining}s`;
    const percentage = (timeRemaining / MAX_TIME) * 100;
    timerBar.style.width = `${percentage}%`;
    
    if (percentage < 25) {
        timerBar.style.backgroundColor = 'var(--danger)';
        timerText.style.color = 'var(--danger)';
    } else {
        timerBar.style.backgroundColor = 'var(--timer-color)';
        timerText.style.color = 'var(--primary-color)';
    }
}

function handleAnswer(selectedOption, clickedBtn) {
    clearInterval(timerInterval);
    const question = questions[currentQuestionIndex];
    
    // Disable all buttons
    const buttons = optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);

    // Record answer
    userAnswers.push({
        id: question.id,
        answer: selectedOption,
        timeRemaining: selectedOption === null ? 0 : timeRemaining
    });

    // Provide visual feedback
    if (selectedOption !== null) {
        if (selectedOption === question.correctAnswer) {
            clickedBtn.classList.add('correct');
            playSound('correct');
        } else {
            clickedBtn.classList.add('incorrect');
            playSound('incorrect');
            // Find and highlight correct answer
            buttons.forEach(btn => {
                if (btn.innerText === question.correctAnswer) {
                    btn.classList.add('correct');
                }
            });
        }
    } else {
        playSound('incorrect');
        // Time's up logic
        buttons.forEach(btn => {
            if (btn.innerText === question.correctAnswer) {
                btn.classList.add('correct');
            }
        });
    }

    setTimeout(nextQuestion, 1500);
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        submitQuiz();
    }
}

async function submitQuiz() {
    switchView('loading');
    try {
        const response = await fetch('http://localhost:3000/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers: userAnswers })
        });
        
        const result = await response.json();
        showResults(result);
    } catch (error) {
        console.error("Error submitting quiz:", error);
        alert("Failed to submit quiz results.");
        switchView('landing');
    }
}

function showResults(result) {
    playSound('finish');
    document.getElementById('final-score').innerText = result.score;
    document.getElementById('correct-count').innerText = result.correctCount;
    document.getElementById('total-count').innerText = result.total;
    document.getElementById('result-message').innerText = result.message;
    
    // Animate score circle
    const circle = document.querySelector('.score-circle');
    const percentage = (result.correctCount / result.total) * 100;
    circle.style.background = `conic-gradient(var(--primary-color) ${percentage}%, var(--bg-color) 0%)`;
    
    document.getElementById('player-name').value = '';
    document.getElementById('save-score-btn').disabled = false;
    document.getElementById('save-score-btn').innerText = 'Save Score';
    
    // Store latest score globally for saving
    window.latestScore = result.score;
    
    switchView('results');
}

function saveScore() {
    const nameInput = document.getElementById('player-name').value.trim();
    if (!nameInput) {
        alert("Please enter your name");
        return;
    }
    
    const leaderboard = JSON.parse(localStorage.getItem('quizLeaderboard') || '[]');
    leaderboard.push({ name: nameInput, score: window.latestScore });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboard.slice(0, 10))); // Keep top 10
    
    const btn = document.getElementById('save-score-btn');
    btn.innerText = 'Saved!';
    btn.disabled = true;
}

function showLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('quizLeaderboard') || '[]');
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    
    if (leaderboard.length === 0) {
        list.innerHTML = '<li><span class="lb-name">No scores yet. Play a round!</span></li>';
    } else {
        leaderboard.forEach((entry, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="lb-rank">#${index + 1}</span>
                <span class="lb-name">${entry.name}</span>
                <span class="lb-score">${entry.score} pts</span>
            `;
            list.appendChild(li);
        });
    }
    
    switchView('leaderboard');
}

// Start app
window.onload = init;
