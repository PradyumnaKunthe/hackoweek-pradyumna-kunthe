const API_URL = 'http://localhost:5000/api/tasks';

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const filterBtns = document.querySelectorAll('.filter-btn');

// Edit Modal Elements
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editTaskInput = document.getElementById('edit-task-input');
const editTaskId = document.getElementById('edit-task-id');
const cancelEditBtn = document.getElementById('cancel-edit');

let tasks = [];
let currentFilter = 'All';

// Initialize
document.addEventListener('DOMContentLoaded', fetchTasks);

// Fetch all tasks from backend
async function fetchTasks() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    tasks = await res.json();
    renderTasks();
  } catch (error) {
    showErrorState('Failed to load tasks. Is the server running?');
    console.error(error);
  }
}

// Add new task
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to add task');
    
    const newTask = await res.json();
    tasks.unshift(newTask); // Add to beginning of array
    taskInput.value = '';
    renderTasks();
  } catch (error) {
    alert('Failed to add task');
    console.error(error);
  }
});

// Toggle Task Status
async function toggleTaskStatus(id, currentStatus) {
  const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
  
  try {
    // Optimistic UI update
    const taskIndex = tasks.findIndex(t => t._id === id);
    if (taskIndex > -1) {
      tasks[taskIndex].status = newStatus;
      renderTasks();
    }

    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) throw new Error('Failed to update task');
  } catch (error) {
    // Revert if failed
    if (taskIndex > -1) {
      tasks[taskIndex].status = currentStatus;
      renderTasks();
    }
    alert('Failed to update task');
    console.error(error);
  }
}

// Delete Task
async function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  
  try {
    // Optimistic UI
    tasks = tasks.filter(t => t._id !== id);
    renderTasks();

    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) throw new Error('Failed to delete task');
  } catch (error) {
    alert('Failed to delete task');
    fetchTasks(); // Reload from server
    console.error(error);
  }
}

// Open Edit Modal
function openEditModal(id, currentTitle) {
  editTaskId.value = id;
  editTaskInput.value = currentTitle;
  editModal.classList.add('visible');
  editTaskInput.focus();
}

// Close Edit Modal
function closeEditModal() {
  editModal.classList.remove('visible');
  editTaskId.value = '';
  editTaskInput.value = '';
}

// Handle Cancel Edit
cancelEditBtn.addEventListener('click', closeEditModal);

// Handle Edit Form Submit
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = editTaskId.value;
  const newTitle = editTaskInput.value.trim();
  
  if (!newTitle) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    });

    if (!res.ok) throw new Error('Failed to edit task');
    
    const updatedTask = await res.json();
    const index = tasks.findIndex(t => t._id === id);
    if (index > -1) {
      tasks[index] = updatedTask;
    }
    
    closeEditModal();
    renderTasks();
  } catch (error) {
    alert('Failed to save changes');
    console.error(error);
  }
});

// Filters
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active class
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Set current filter and render
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Render Tasks Array to DOM
function renderTasks() {
  taskList.innerHTML = '';
  
  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'All') return true;
    return task.status === currentFilter;
  });

  if (filteredTasks.length === 0) {
    showEmptyState(currentFilter);
    return;
  }

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.status === 'Completed' ? 'completed' : ''}`;
    
    const iconClass = task.status === 'Completed' ? 'ph-check-circle-fill' : 'ph-circle';

    li.innerHTML = `
      <div class="task-content">
        <button class="status-toggle" aria-label="Toggle status" onclick="toggleTaskStatus('${task._id}', '${task.status}')">
          <i class="ph ${iconClass}"></i>
        </button>
        <span class="task-title" onclick="openEditModal('${task._id}', '${escapeHtml(task.title)}')">${escapeHtml(task.title)}</span>
      </div>
      <div class="task-actions">
        <button class="action-btn edit-btn" aria-label="Edit task" onclick="openEditModal('${task._id}', '${escapeHtml(task.title)}')">
          <i class="ph ph-pencil-simple"></i>
        </button>
        <button class="action-btn del-btn" aria-label="Delete task" onclick="deleteTask('${task._id}')">
          <i class="ph ph-trash"></i>
        </button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

function showEmptyState(filter) {
  let message = 'No tasks found.';
  if (filter === 'Pending') message = 'No pending tasks left. Great job!';
  if (filter === 'Completed') message = 'No completed tasks yet.';
  if (filter === 'All' && tasks.length === 0) message = "You're all caught up! Add a new task above.";
  
  taskList.innerHTML = `
    <li class="status-state">
      <i class="ph ph-check-square-offset"></i>
      <p>${message}</p>
    </li>
  `;
}

function showErrorState(message) {
  taskList.innerHTML = `
    <li class="status-state">
      <i class="ph ph-warning-circle" style="color: var(--danger)"></i>
      <p>${message}</p>
    </li>
  `;
}

// Utility to prevent XSS in rendering
function escapeHtml(unsafe) {
  return unsafe
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");
}
