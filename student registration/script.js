/* ═════════════════════════════════════════════════════
   ENTHUSIA FEST 2025 — Registration Form Logic
   script.js  |  Vanilla JS, no dependencies
═══════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────
   1. ANIMATED PARTICLE BACKGROUND
───────────────────────────────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;
  const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticle() {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.4 + 0.1;
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.2 + 0.4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: Math.random() * 0.5 + 0.1,
      hue: 260 + Math.random() * 60   // purple-pink range
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: 90 }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const dark = isDark();
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -5) p.x = W + 5;
      if (p.x > W + 5) p.x = -5;
      if (p.y < -5) p.y = H + 5;
      if (p.y > H + 5) p.y = -5;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      const alpha = dark ? p.alpha : p.alpha * 0.4;
      ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${alpha})`;
      ctx.fill();
    });

    // Sparse connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const a = dark ? (1 - dist / 100) * 0.12 : (1 - dist / 100) * 0.05;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `hsla(270, 70%, 70%, ${a})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  init();
  draw();
  window.addEventListener('resize', () => { resize(); });
})();


/* ─────────────────────────────────────────────────────
   2. THEME TOGGLE (Dark / Light)
───────────────────────────────────────────────────── */
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const html        = document.documentElement;

// Persist preference
const savedTheme = localStorage.getItem('enthusia-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
themeIcon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  themeIcon.className = next === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
  localStorage.setItem('enthusia-theme', next);
  // Animate the button
  themeToggle.style.transform = 'rotate(360deg)';
  setTimeout(() => { themeToggle.style.transform = ''; }, 400);
});


/* ─────────────────────────────────────────────────────
   3. MULTI-STEP NAVIGATION
───────────────────────────────────────────────────── */
let currentStep = 1;
const TOTAL_STEPS = 4;

function goToStep(target) {
  if (target < 1 || target > TOTAL_STEPS) return;

  // Validate current step before moving forward
  if (target > currentStep && !validateStep(currentStep)) return;

  // Build preview before showing step 4
  if (target === 4) buildPreview();

  // Animate out current
  const current = document.getElementById(`step${currentStep}`);
  current.style.animation = 'step-out 0.3s ease forwards';
  setTimeout(() => {
    current.classList.remove('active');
    current.style.animation = '';
    const next = document.getElementById(`step${target}`);
    next.classList.add('active');
    currentStep = target;
    updateProgressUI();
    // Scroll form into view smoothly
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 280);
}

function updateProgressUI() {
  document.querySelectorAll('.step[data-step]').forEach(el => {
    const n = parseInt(el.dataset.step);
    el.classList.remove('active', 'completed');
    if (n === currentStep) el.classList.add('active');
    else if (n < currentStep) el.classList.add('completed');
  });

  // Fill step lines
  document.querySelectorAll('.step-line').forEach((line, i) => {
    // Line i connects step (i+1) to step (i+2)
    if (i + 2 <= currentStep) line.classList.add('filled');
    else line.classList.remove('filled');
  });
}

updateProgressUI(); // init


/* ─────────────────────────────────────────────────────
   4. VALIDATION
───────────────────────────────────────────────────── */
function setError(fieldGroupId, errId, message) {
  const fg  = document.getElementById(fieldGroupId);
  const err = document.getElementById(errId);
  if (!fg || !err) return;
  fg.classList.add('error');
  err.querySelector('span').textContent = message;
}

function clearError(fieldGroupId, errId) {
  const fg  = document.getElementById(fieldGroupId);
  const err = document.getElementById(errId);
  if (!fg || !err) return;
  fg.classList.remove('error');
  err.querySelector('span').textContent = '';
}

function showSuccess(fieldGroupId) {
  const fg = document.getElementById(fieldGroupId);
  if (fg) fg.classList.remove('error');
}

// Email regex
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Phone: 10 digits
const PHONE_RE = /^\d{10}$/;

function validateStep(step) {
  let valid = true;

  if (step === 1) {
    // Full Name
    const name = document.getElementById('fullName').value.trim();
    if (!name) { setError('fg-name', 'err-name', 'Full name is required.'); valid = false; }
    else if (name.length < 3) { setError('fg-name', 'err-name', 'Name must be at least 3 characters.'); valid = false; }
    else clearError('fg-name', 'err-name');

    // Email
    const email = document.getElementById('email').value.trim();
    if (!email) { setError('fg-email', 'err-email', 'Email address is required.'); valid = false; }
    else if (!EMAIL_RE.test(email)) { setError('fg-email', 'err-email', 'Enter a valid email address.'); valid = false; }
    else clearError('fg-email', 'err-email');

    // Phone
    const phone = document.getElementById('phone').value.trim();
    if (!phone) { setError('fg-phone', 'err-phone', 'Phone number is required.'); valid = false; }
    else if (!PHONE_RE.test(phone)) { setError('fg-phone', 'err-phone', 'Enter a valid 10-digit phone number.'); valid = false; }
    else clearError('fg-phone', 'err-phone');

    // Gender
    const gender = document.querySelector('input[name="gender"]:checked');
    if (!gender) { setError('fg-gender', 'err-gender', 'Please select your gender.'); valid = false; }
    else clearError('fg-gender', 'err-gender');
  }

  if (step === 2) {
    // College Name
    const college = document.getElementById('collegeName').value.trim();
    if (!college) { setError('fg-college', 'err-college', 'College name is required.'); valid = false; }
    else clearError('fg-college', 'err-college');

    // Branch
    const branch = document.getElementById('branch').value;
    if (!branch) { setError('fg-branch', 'err-branch', 'Please select your branch / department.'); valid = false; }
    else clearError('fg-branch', 'err-branch');

    // Year
    const year = document.querySelector('input[name="year"]:checked');
    if (!year) { setError('fg-year', 'err-year', 'Please select your year of study.'); valid = false; }
    else clearError('fg-year', 'err-year');
  }

  if (step === 3) {
    // Events
    const events = document.querySelectorAll('input[name="events"]:checked');
    if (events.length === 0) { setError('fg-events', 'err-events', 'Please select at least one event.'); valid = false; }
    else clearError('fg-events', 'err-events');

    // ID Card
    const idCard = document.getElementById('idCard').files;
    if (!idCard || idCard.length === 0) { setError('fg-idcard', 'err-idcard', 'Please upload your college ID card.'); valid = false; }
    else clearError('fg-idcard', 'err-idcard');
  }

  return valid;
}


/* ─────────────────────────────────────────────────────
   5. REAL-TIME VALIDATION ON INPUT
───────────────────────────────────────────────────── */
function liveValidate(inputId, fgId, errId, rule) {
  const el = document.getElementById(inputId);
  if (!el) return;
  el.addEventListener('input', () => {
    const result = rule(el.value.trim());
    if (result === true) clearError(fgId, errId);
    else setError(fgId, errId, result);
  });
  el.addEventListener('blur', () => {
    const result = rule(el.value.trim());
    if (result === true) clearError(fgId, errId);
    else setError(fgId, errId, result);
  });
}

liveValidate('fullName', 'fg-name', 'err-name', v => {
  if (!v) return 'Full name is required.';
  if (v.length < 3) return 'Name must be at least 3 characters.';
  return true;
});

liveValidate('email', 'fg-email', 'err-email', v => {
  if (!v) return 'Email address is required.';
  if (!EMAIL_RE.test(v)) return 'Enter a valid email address.';
  return true;
});

liveValidate('phone', 'fg-phone', 'err-phone', v => {
  if (!v) return 'Phone number is required.';
  if (!PHONE_RE.test(v)) return 'Enter a valid 10-digit phone number.';
  return true;
});

// Only allow digits in phone
document.getElementById('phone').addEventListener('keypress', e => {
  if (!/[0-9]/.test(e.key)) e.preventDefault();
});

// Branch live
document.getElementById('branch').addEventListener('change', function () {
  if (this.value) clearError('fg-branch', 'err-branch');
  else setError('fg-branch', 'err-branch', 'Please select your branch / department.');
});

// Gender live
document.querySelectorAll('input[name="gender"]').forEach(r => {
  r.addEventListener('change', () => clearError('fg-gender', 'err-gender'));
});

// Year live
document.querySelectorAll('input[name="year"]').forEach(r => {
  r.addEventListener('change', () => clearError('fg-year', 'err-year'));
});

// Events live
document.querySelectorAll('input[name="events"]').forEach(cb => {
  cb.addEventListener('change', () => {
    const any = document.querySelectorAll('input[name="events"]:checked').length > 0;
    if (any) clearError('fg-events', 'err-events');
  });
});

// College Name
liveValidate('collegeName', 'fg-college', 'err-college', v => {
  if (!v) return 'College name is required.';
  return true;
});


/* ─────────────────────────────────────────────────────
   6. CHARACTER COUNTER FOR TEXTAREA
───────────────────────────────────────────────────── */
const messageArea = document.getElementById('message');
const charCount   = document.getElementById('charCount');
const MAX_CHARS   = 300;

messageArea.addEventListener('input', function () {
  const len = this.value.length;
  if (len > MAX_CHARS) {
    this.value = this.value.substring(0, MAX_CHARS);
  }
  charCount.textContent = `${Math.min(len, MAX_CHARS)} / ${MAX_CHARS}`;
  charCount.style.color = len >= MAX_CHARS ? 'var(--error-color)' : 'var(--text-muted)';
});


/* ─────────────────────────────────────────────────────
   7. FILE UPLOAD (Drag & Drop + Browse)
───────────────────────────────────────────────────── */
const dropZone       = document.getElementById('fileDropZone');
const fileInput      = document.getElementById('idCard');
const fileDropContent= document.getElementById('fileDropContent');
const filePreview    = document.getElementById('filePreview');
const fileNameEl     = document.getElementById('fileName');
const fileSizeEl     = document.getElementById('fileSize');
const fileRemoveBtn  = document.getElementById('fileRemove');

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function showFilePreview(file) {
  fileDropContent.style.display = 'none';
  filePreview.style.display = 'flex';
  fileNameEl.textContent = file.name;
  fileSizeEl.textContent = formatBytes(file.size);
  clearError('fg-idcard', 'err-idcard');
}

function clearFilePreview() {
  fileDropContent.style.display = 'flex';
  filePreview.style.display = 'none';
  fileInput.value = '';
}

fileInput.addEventListener('change', function () {
  if (this.files && this.files[0]) {
    const file = this.files[0];
    if (file.size > 5 * 1024 * 1024) {
      setError('fg-idcard', 'err-idcard', 'File size must not exceed 5 MB.');
      clearFilePreview();
      return;
    }
    showFilePreview(file);
  }
});

fileRemoveBtn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  clearFilePreview();
});

// Drag & Drop
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (!file) return;
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowed.includes(file.type)) {
    setError('fg-idcard', 'err-idcard', 'Only JPG, PNG, or PDF files are allowed.');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    setError('fg-idcard', 'err-idcard', 'File size must not exceed 5 MB.');
    return;
  }
  // Assign to input (for later reading)
  const dt = new DataTransfer();
  dt.items.add(file);
  fileInput.files = dt.files;
  showFilePreview(file);
});


/* ─────────────────────────────────────────────────────
   8. BUILD PREVIEW CARD (Step 4)
───────────────────────────────────────────────────── */
const BRANCH_LABELS = {
  cse: 'Computer Science & Engineering',
  it: 'Information Technology',
  ece: 'Electronics & Communication',
  eee: 'Electrical & Electronics',
  mech: 'Mechanical Engineering',
  civil: 'Civil Engineering',
  chem: 'Chemical Engineering',
  bio: 'Biotechnology',
  arch: 'Architecture',
  mba: 'MBA / Management',
  arts: 'Arts & Humanities',
  science: 'Science',
  other: 'Other'
};

const EVENT_LABELS = {
  dance: '💃 Dance', coding: '💻 Coding', gaming: '🎮 Gaming',
  music: '🎵 Music', photography: '📸 Photography', debate: '🎤 Debate',
  quiz: '🧠 Quiz', art: '🎨 Art & Design', hackathon: '⚡ Hackathon', drama: '🎭 Drama'
};

function getFormData() {
  const events = [...document.querySelectorAll('input[name="events"]:checked')].map(e => e.value);
  const gender = document.querySelector('input[name="gender"]:checked');
  const year   = document.querySelector('input[name="year"]:checked');
  const branch = document.getElementById('branch').value;
  const file   = fileInput.files[0];

  return {
    fullName:   document.getElementById('fullName').value.trim(),
    email:      document.getElementById('email').value.trim(),
    phone:      document.getElementById('phone').value.trim(),
    gender:     gender ? capitalize(gender.value) : '—',
    collegeName: document.getElementById('collegeName').value.trim(),
    branch:     BRANCH_LABELS[branch] || '—',
    year:       year ? yearLabel(year.value) : '—',
    events,
    idCardName: file ? file.name : '—',
    message:    document.getElementById('message').value.trim()
  };
}

function yearLabel(v) {
  return { '1': '1st Year', '2': '2nd Year', '3': '3rd Year', '4': '4th Year' }[v] || v;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildPreview() {
  const d = getFormData();
  const previewCard = document.getElementById('previewCard');

  const eventPills = d.events.map(e => `<span class="event-pill">${EVENT_LABELS[e] || e}</span>`).join('');

  previewCard.innerHTML = `
    <div class="preview-section">
      <div class="preview-section-title">👤 Personal Information</div>
      <div class="preview-grid">
        <div class="preview-item">
          <span class="preview-label">Full Name</span>
          <span class="preview-value">${escHtml(d.fullName)}</span>
        </div>
        <div class="preview-item">
          <span class="preview-label">Email</span>
          <span class="preview-value">${escHtml(d.email)}</span>
        </div>
        <div class="preview-item">
          <span class="preview-label">Phone</span>
          <span class="preview-value">${escHtml(d.phone)}</span>
        </div>
        <div class="preview-item">
          <span class="preview-label">Gender</span>
          <span class="preview-value">${escHtml(d.gender)}</span>
        </div>
      </div>
    </div>

    <div class="preview-section">
      <div class="preview-section-title">🎓 Academic Details</div>
      <div class="preview-grid">
        <div class="preview-item" style="grid-column:1/-1">
          <span class="preview-label">College Name</span>
          <span class="preview-value">${escHtml(d.collegeName)}</span>
        </div>
        <div class="preview-item">
          <span class="preview-label">Branch</span>
          <span class="preview-value">${escHtml(d.branch)}</span>
        </div>
        <div class="preview-item">
          <span class="preview-label">Year</span>
          <span class="preview-value">${escHtml(d.year)}</span>
        </div>
      </div>
    </div>

    <div class="preview-section">
      <div class="preview-section-title">⭐ Events Selected</div>
      <div class="preview-events">${eventPills}</div>
    </div>

    <div class="preview-section">
      <div class="preview-section-title">📎 Documents</div>
      <div class="preview-item">
        <span class="preview-label">ID Card</span>
        <span class="preview-value">${escHtml(d.idCardName)}</span>
      </div>
    </div>

    ${d.message ? `
    <div class="preview-section">
      <div class="preview-section-title">💬 Message</div>
      <div class="preview-item">
        <span class="preview-value" style="font-weight:400;color:var(--text-secondary)">${escHtml(d.message)}</span>
      </div>
    </div>` : ''}
  `;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}


/* ─────────────────────────────────────────────────────
   9. FORM SUBMISSION
───────────────────────────────────────────────────── */
const form       = document.getElementById('registrationForm');
const submitBtn  = document.getElementById('submitBtn');
const btnText    = submitBtn.querySelector('.btn-text');
const btnLoader  = submitBtn.querySelector('.btn-loader');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  // Validate terms
  const terms = document.getElementById('termsCheck');
  if (!terms.checked) {
    setError('fg-terms', 'err-terms', 'You must agree to the Terms & Conditions.');
    return;
  }
  clearError('fg-terms', 'err-terms');

  // Loading state
  btnText.style.display = 'none';
  btnLoader.style.display = 'flex';
  submitBtn.disabled = true;

  // Simulate async submission (e.g., fetch to a backend)
  await new Promise(res => setTimeout(res, 1800));

  // Save to localStorage
  const data = getFormData();
  localStorage.setItem('enthusia-registration', JSON.stringify({ ...data, submittedAt: new Date().toISOString() }));

  // Reset button
  btnText.style.display = 'flex';
  btnLoader.style.display = 'none';
  submitBtn.disabled = false;

  // Show success modal
  openSuccessModal(data);
});


/* ─────────────────────────────────────────────────────
   10. SUCCESS MODAL
───────────────────────────────────────────────────── */
const modal        = document.getElementById('successModal');
const closeModalBtn= document.getElementById('closeModalBtn');
const downloadBtn  = document.getElementById('downloadBtn');

function openSuccessModal(data) {
  const modalSummary = document.getElementById('modalSummary');
  const events = data.events.map(e => EVENT_LABELS[e] || e).join(', ');

  modalSummary.innerHTML = `
    <strong>${escHtml(data.fullName)}</strong><br>
    📧 ${escHtml(data.email)} &nbsp; · &nbsp; 📱 ${escHtml(data.phone)}<br>
    🎓 ${escHtml(data.collegeName)} — ${escHtml(data.branch)}, ${escHtml(data.year)}<br>
    ⭐ Events: ${escHtml(events)}
  `;

  modal.classList.add('open');
  spawnConfetti();
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

closeModalBtn.addEventListener('click', () => {
  closeModal();
  // Reset form to step 1 after brief delay
  setTimeout(() => {
    form.reset();
    clearFilePreview();
    charCount.textContent = '0 / 300';
    // Remove all errors
    document.querySelectorAll('.field-group').forEach(fg => fg.classList.remove('error'));
    goToStepDirect(1);
  }, 350);
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// Direct step jump (no validation)
function goToStepDirect(target) {
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step${target}`).classList.add('active');
  currentStep = target;
  updateProgressUI();
}


/* ─────────────────────────────────────────────────────
   11. DOWNLOAD SUMMARY (text file)
───────────────────────────────────────────────────── */
downloadBtn.addEventListener('click', () => {
  const raw = localStorage.getItem('enthusia-registration');
  if (!raw) return;

  const d = JSON.parse(raw);
  const events = d.events.map(e => EVENT_LABELS[e] || e).join(', ');
  const date   = new Date(d.submittedAt).toLocaleString();

  const content = [
    '╔══════════════════════════════════════════╗',
    '║      ENTHUSIA FEST 2025 — Registration  ║',
    '╚══════════════════════════════════════════╝',
    '',
    `Submitted On   : ${date}`,
    '',
    '── Personal Information ──────────────────',
    `Full Name      : ${d.fullName}`,
    `Email          : ${d.email}`,
    `Phone          : ${d.phone}`,
    `Gender         : ${d.gender}`,
    '',
    '── Academic Details ──────────────────────',
    `College        : ${d.collegeName}`,
    `Branch         : ${d.branch}`,
    `Year           : ${d.year}`,
    '',
    '── Events Selected ───────────────────────',
    events,
    '',
    '── Documents ─────────────────────────────',
    `ID Card        : ${d.idCardName}`,
    '',
    d.message ? `── Message ───────────────────────────────\n${d.message}` : '',
    '',
    '─────────────────────────────────────────',
    'Thank you for registering for Enthusia Fest!',
    'See you there 🎉'
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `Enthusia-Registration-${d.fullName.replace(/\s+/g, '_')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
});


/* ─────────────────────────────────────────────────────
   12. CONFETTI EFFECT
───────────────────────────────────────────────────── */
function spawnConfetti() {
  const container    = document.getElementById('confettiContainer');
  container.innerHTML = '';
  const colors = ['#7c3aed', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f43f5e'];

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${Math.random() * 8 + 4}px;
      height: ${Math.random() * 8 + 4}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration: ${Math.random() * 2 + 2}s;
      animation-delay: ${Math.random() * 0.8}s;
    `;
    container.appendChild(piece);
  }
}


/* ─────────────────────────────────────────────────────
   13. RESTORE FROM LOCALSTORAGE (auto-save)
───────────────────────────────────────────────────── */
(function restoreDraft() {
  const draft = localStorage.getItem('enthusia-draft');
  if (!draft) return;
  try {
    const d = JSON.parse(draft);
    if (d.fullName)    document.getElementById('fullName').value    = d.fullName;
    if (d.email)       document.getElementById('email').value       = d.email;
    if (d.phone)       document.getElementById('phone').value       = d.phone;
    if (d.collegeName) document.getElementById('collegeName').value = d.collegeName;
    if (d.branch)      document.getElementById('branch').value      = d.branch;
    if (d.message)     { document.getElementById('message').value   = d.message; charCount.textContent = `${d.message.length} / 300`; }
    if (d.gender) {
      const r = document.querySelector(`input[name="gender"][value="${d.gender}"]`);
      if (r) r.checked = true;
    }
    if (d.year) {
      const r = document.querySelector(`input[name="year"][value="${d.year}"]`);
      if (r) r.checked = true;
    }
    if (d.events && Array.isArray(d.events)) {
      d.events.forEach(ev => {
        const cb = document.querySelector(`input[name="events"][value="${ev}"]`);
        if (cb) cb.checked = true;
      });
    }
  } catch {}
})();

// Auto-save draft on any input
document.querySelectorAll('input, select, textarea').forEach(el => {
  el.addEventListener('change', saveDraft);
  el.addEventListener('input', saveDraft);
});

function saveDraft() {
  const gender = document.querySelector('input[name="gender"]:checked');
  const year   = document.querySelector('input[name="year"]:checked');
  const events = [...document.querySelectorAll('input[name="events"]:checked')].map(e => e.value);

  const draft = {
    fullName:    document.getElementById('fullName').value,
    email:       document.getElementById('email').value,
    phone:       document.getElementById('phone').value,
    collegeName: document.getElementById('collegeName').value,
    branch:      document.getElementById('branch').value,
    message:     document.getElementById('message').value,
    gender:      gender ? gender.value : '',
    year:        year ? year.value : '',
    events
  };
  localStorage.setItem('enthusia-draft', JSON.stringify(draft));
}

// Clear draft after successful registration
closeModalBtn.addEventListener('click', () => {
  localStorage.removeItem('enthusia-draft');
}, { once: false });


/* ─────────────────────────────────────────────────────
   14. KEYBOARD ACCESSIBILITY
───────────────────────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('open')) {
    closeModal();
  }
});

// Trap focus within modal when open
modal.addEventListener('keydown', (e) => {
  if (!modal.classList.contains('open')) return;
  const focusables = modal.querySelectorAll('button, a, input, [tabindex]:not([tabindex="-1"])');
  const first = focusables[0];
  const last  = focusables[focusables.length - 1];
  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});


/* ─────────────────────────────────────────────────────
   15. MICRO-INTERACTIONS / EXTRAS
───────────────────────────────────────────────────── */
// Ripple effect on buttons
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const ripple = document.createElement('span');
    const rect   = this.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position:absolute;
      border-radius:50%;
      width:${size}px; height:${size}px;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY - rect.top - size/2}px;
      background:rgba(255,255,255,0.2);
      transform:scale(0);
      animation:ripple-anim 0.5s linear;
      pointer-events:none;
      z-index:10;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});

// Add ripple keyframes dynamically
const rStyle = document.createElement('style');
rStyle.textContent = `
  @keyframes ripple-anim {
    to { transform: scale(2.5); opacity: 0; }
  }
`;
document.head.appendChild(rStyle);

// Input field: floating label behavior for select (no placeholder trick)
const branchSelect = document.getElementById('branch');
branchSelect.addEventListener('change', function () {
  if (this.value) this.classList.add('has-value');
  else this.classList.remove('has-value');
});

// Animate step circles on completion
document.querySelectorAll('.step[data-step]').forEach(stepEl => {
  const circle = stepEl.querySelector('.step-circle');
  if (circle) {
    circle.addEventListener('mouseenter', () => {
      if (stepEl.classList.contains('completed')) {
        circle.style.transform = 'rotate(360deg) scale(1.1)';
        circle.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
      }
    });
    circle.addEventListener('mouseleave', () => {
      circle.style.transform = '';
    });
  }
});

console.log('%c🎉 Enthusia Fest 2025', 'font-size:20px;font-weight:bold;background:linear-gradient(135deg,#7c3aed,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;');
console.log('%cRegistration form loaded successfully!', 'color:#a855f7;font-size:12px;');
