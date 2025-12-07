// Central tasks state persisted in localStorage
let tasks = [];

// Utilities: storage
async function saveTasks() {
  try {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  } catch (e) {
    console.error("Failed to save tasks:", e);
    showFormFeedback("Failed to save tasks", "error");
  }
}

async function loadTasks() {
  try {
    const stored = localStorage.getItem('tasks');
    tasks = stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse tasks from storage, resetting.", e);
    tasks = [];
  }

  // Render tasks based on current view
  renderAllTasks();
}

let currentView = 'groups'; // 'groups', 'weeks', 'months'

function getWeekNumber(d) {
    // ISO week date
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return { year: d.getUTCFullYear(), week: weekNo };
}

function getGroupNameForTask(task) {
    if (currentView === 'groups') {
        return task.groupName;
    } else if (currentView === 'weeks') {
        if (!task.date) return "No Date";
        const date = new Date(task.date);
        const { year, week } = getWeekNumber(date);
        return `Week ${week}, ${year}`;
    } else if (currentView === 'months') {
        if (!task.date) return "No Date";
        const date = new Date(task.date);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }
    return 'Unknown';
}

function renderAllTasks() {
    const groupsContainer = document.getElementById("groupsContainer");
    const emptyState = document.getElementById("emptyState");
    
    groupsContainer.innerHTML = "";
    
    if (tasks.length === 0) {
        emptyState.classList.add("show");
        return;
    }
    
    emptyState.classList.remove("show");
    
    let tasksToRender = [...tasks];
    
    // Apply search filter if any
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim()) {
        const searchTerm = searchInput.value.toLowerCase();
        tasksToRender = tasksToRender.filter(task =>
            task.text.toLowerCase().includes(searchTerm) ||
            task.groupName.toLowerCase().includes(searchTerm)
        );
    }

    // If viewing by date, pre-sort by date so groups appear in order
    if (currentView !== 'groups') {
        tasksToRender.sort((a, b) => {
             if (!a.date) return 1;
             if (!b.date) return -1;
             return a.date.localeCompare(b.date);
        });
    }

    tasksToRender.forEach(task => {
        renderTask(task);
    });

    applySorting();
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createOrGetGroup(groupName) {
  let groupDiv = document.querySelector(`[data-group="${groupName}"]`);

  if (!groupDiv) {
    groupDiv = document.createElement("div");
    groupDiv.className = "group";
    groupDiv.setAttribute("data-group", groupName);

    const title = document.createElement("h2");
    title.textContent = groupName;
    groupDiv.appendChild(title);

    const taskList = document.createElement("ul");
    taskList.id = `list-${groupName}`;
    groupDiv.appendChild(taskList);

    document.getElementById("groupsContainer").appendChild(groupDiv);
  }

  return groupDiv.querySelector("ul");
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  // Compare YYYY-MM-DD lexicographically; safe for same format
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;
  return dateStr < todayStr;
}

function applyOverdueClass(li, task) {
  if (task.completed) {
    li.classList.remove("overdue");
    return;
  }
  if (isOverdue(task.date)) li.classList.add("overdue");
  else li.classList.remove("overdue");
}

function minutesAndSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function renderTask(task) {
  const dynamicGroupName = getGroupNameForTask(task);
  const taskList = createOrGetGroup(dynamicGroupName);

  // li container
  const li = document.createElement("li");
  li.dataset.taskId = task.id;
  li.classList.add(`priority-${task.priority}`);
  li.classList.add('slide-in'); // Animation class
  if (task.completed) li.classList.add("completed");

  const taskDetailsDiv = document.createElement("div");
  taskDetailsDiv.className = "task-details";

  const taskTextSpan = document.createElement("span");
  taskTextSpan.textContent = task.text;
  taskTextSpan.className = "task-text";

  const infoDiv = document.createElement("div");
  infoDiv.className = "task-info";

  const prioritySpan = document.createElement("span");
  prioritySpan.textContent = `Priority: ${capitalizeFirstLetter(task.priority)} | `;
  const dateSpan = document.createElement("span");
  dateSpan.textContent = task.date ? `Due: ${task.date}` : "";

  infoDiv.appendChild(prioritySpan);
  infoDiv.appendChild(dateSpan);

  taskDetailsDiv.appendChild(taskTextSpan);
  taskDetailsDiv.appendChild(infoDiv);

  const taskActionsDiv = document.createElement("div");
  taskActionsDiv.className = "task-actions";

  // Timer elements
  if (task.timerMinutes && task.timerMinutes > 0) {
    const timerContainer = document.createElement("div");
    timerContainer.className = "timer-container";

    const timerDisplay = document.createElement("span");
    timerDisplay.className = "timer-display";

    const initialSeconds = Number.isFinite(task.remainingSeconds)
      ? Math.max(0, Number(task.remainingSeconds))
      : task.timerMinutes * 60;

    if (task.timerState === "done" || initialSeconds === 0) {
      timerDisplay.textContent = "Time's up!";
      timerDisplay.classList.add("timer-expired");
    } else {
      timerDisplay.textContent = minutesAndSeconds(initialSeconds);
    }

    const startTimerBtn = document.createElement("button");
    startTimerBtn.className = "start-timer-btn";

    function setTimerButtonState() {
      if (task.timerState === "running") {
        startTimerBtn.textContent = "Pause";
        startTimerBtn.title = "Pause Timer";
        startTimerBtn.disabled = false;
      } else if (task.timerState === "done") {
        startTimerBtn.textContent = "Done";
        startTimerBtn.title = "Timer finished";
        startTimerBtn.disabled = true;
      } else if (task.timerState === "paused") {
        startTimerBtn.textContent = "Resume";
        startTimerBtn.title = "Resume Timer";
        startTimerBtn.disabled = false;
      } else {
        startTimerBtn.textContent = "Start";
        startTimerBtn.title = "Start Timer";
        startTimerBtn.disabled = false;
      }
    }

    setTimerButtonState();

    startTimerBtn.onclick = function () {
      // If already running, pause
      if (timerDisplay.dataset.intervalId) {
        const id = parseInt(timerDisplay.dataset.intervalId, 10);
        clearInterval(id);
        delete timerDisplay.dataset.intervalId;
        const t = getTaskById(task.id);
        if (t) {
          t.timerState = "paused";
          // remainingSeconds already updated during running
          saveTasks();
        }
        setTimerButtonState();
        return;
      }

      // Start/resume
      const t = getTaskById(task.id);
      if (!t) return;
      startTimer(startTimerBtn, timerDisplay, t);
      setTimerButtonState();
    };

    timerContainer.appendChild(timerDisplay);
    timerContainer.appendChild(startTimerBtn);
    taskActionsDiv.appendChild(timerContainer);
  }

  // Complete button
  const completeBtn = document.createElement("button");
  completeBtn.textContent = "✔";
  completeBtn.title = "Toggle Complete";
  completeBtn.onclick = function () {
    li.classList.toggle("completed");
    const t = getTaskById(task.id);
    if (t) {
      t.completed = li.classList.contains("completed");
      saveTasks();
      applyOverdueClass(li, t);
    }
  };

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i> 🗑'; // Use icon if available, or just text
  deleteBtn.textContent = '🗑';
  deleteBtn.title = "Delete Task";
  deleteBtn.onclick = function () {
    // Clear any active timer for this task
    const timerDisplay = li.querySelector(".timer-display[data-interval-id]");
    if (timerDisplay) {
      clearInterval(parseInt(timerDisplay.dataset.intervalId, 10));
      delete timerDisplay.dataset.intervalId;
    }

    // Add exit animation class
    li.classList.remove('slide-in');
    li.classList.add('slide-out');

    // Wait for animation to finish before removing
    li.addEventListener('animationend', () => {
        // Remove from DOM
        const parentList = li.parentElement;
        if (parentList) parentList.removeChild(li);

        // Remove from state
        tasks = tasks.filter((t) => t.id !== task.id);
        saveTasks();

        // If taskList is empty, remove the group
        if (parentList && parentList.children.length === 0) {
            const groupContainer = parentList.parentNode;
            const container = document.getElementById("groupsContainer");
            if (
                groupContainer &&
                groupContainer.classList.contains("group") &&
                groupContainer.parentNode === container
            ) {
                groupContainer.parentNode.removeChild(groupContainer);
            }
        }
    });
  };

  // Group action buttons (Complete & Delete)
  const taskButtons = document.createElement("div");
  taskButtons.className = "task-buttons";
  taskButtons.appendChild(completeBtn);
  taskButtons.appendChild(deleteBtn);

  taskActionsDiv.appendChild(taskButtons);

  li.appendChild(taskDetailsDiv);
  li.appendChild(taskActionsDiv);

  taskList.appendChild(li);

  // overdue visual
  applyOverdueClass(li, task);
}

function getTaskById(id) {
  return tasks.find((t) => t.id === id);
}

// Public API
function addTask() {
  const groupName = document.getElementById("groupName").value.trim();
  const taskText = document.getElementById("taskInput").value.trim();
  const taskPriority = document.getElementById("taskPriority").value;
  const taskDate = document.getElementById("taskDate").value;
  const taskTimerMinutesInput = document.getElementById("taskTimer").value;

  // Clear error messages
  clearValidationErrors();

  // Validate inputs
  if (!groupName) {
    showValidationError("groupName", "Group name is required");
    return;
  }
  if (!taskText) {
    showValidationError("taskInput", "Task description is required");
    return;
  }

  const taskTimerMinutes = parseInt(taskTimerMinutesInput, 10);

  const task = {
    id: generateId(),
    groupName,
    text: taskText,
    priority: taskPriority,
    date: taskDate || "",
    timerMinutes: !isNaN(taskTimerMinutes) && taskTimerMinutes > 0 ? taskTimerMinutes : 0,
    remainingSeconds: !isNaN(taskTimerMinutes) && taskTimerMinutes > 0 ? taskTimerMinutes * 60 : 0,
    timerState: (!isNaN(taskTimerMinutes) && taskTimerMinutes > 0) ? "idle" : "none",
    completed: false,
  };

  tasks.push(task);
  saveTasks();
  renderTask(task);
  applySorting();

  // Show success message
  showFormFeedback("✓ Task added successfully!", "success");

  // Clear inputs
  document.getElementById("groupName").value = "";
  document.getElementById("taskInput").value = "";
  document.getElementById("taskPriority").value = "medium";
  document.getElementById("taskDate").value = "";
  document.getElementById("taskTimer").value = "";
  
  // Re-render all if view is not 'groups', because a new task might belong to a specific week
  if (currentView !== 'groups') {
      renderAllTasks();
  }
}

function deleteAllTasks() {
  // Clear any running timers
  document.querySelectorAll(".timer-display[data-interval-id]").forEach((el) => {
    clearInterval(parseInt(el.dataset.intervalId, 10));
    delete el.dataset.intervalId;
  });

  const groupsContainer = document.getElementById("groupsContainer");
  groupsContainer.innerHTML = "";
  tasks = [];
  saveTasks();
}

function startTimer(button, displayElement, task) {
  // Clear any existing interval on this display element before starting a new one
  if (displayElement.dataset.intervalId) {
    clearInterval(parseInt(displayElement.dataset.intervalId, 10));
    delete displayElement.dataset.intervalId;
  }

  let totalSeconds = Number.isFinite(task.remainingSeconds) && task.remainingSeconds > 0
    ? Math.floor(task.remainingSeconds)
    : (task.timerMinutes || 0) * 60;

  if (totalSeconds <= 0) {
    // Nothing to run
    task.timerState = "done";
    displayElement.textContent = "Time's up!";
    displayElement.classList.add("timer-expired");
    button.disabled = true;
    saveTasks();
    return;
  }

  const updateDisplay = () => {
    displayElement.textContent = minutesAndSeconds(totalSeconds);
  };

  updateDisplay(); // Initial display

  task.timerState = "running";
  saveTasks();

  const timerInterval = setInterval(() => {
    totalSeconds--;
    task.remainingSeconds = Math.max(0, totalSeconds);
    updateDisplay();

    if (totalSeconds <= 0) {
      clearInterval(timerInterval);
      delete displayElement.dataset.intervalId;
      displayElement.textContent = "Time's up!";
      displayElement.classList.add("timer-expired");
      button.disabled = true;
      button.textContent = "Done";
      task.timerState = "done";
      task.remainingSeconds = 0;
      const taskLi = displayElement.closest('li');
      if (taskLi) {
        taskLi.classList.add('timer-finished-highlight');
        setTimeout(() => {
          taskLi.classList.remove('timer-finished-highlight');
        }, 2000);
      }
      saveTasks();
      return;
    }

    // Persist progress (optional: could throttle)
    saveTasks();
  }, 1000);

  displayElement.dataset.intervalId = String(timerInterval);
  button.textContent = "Pause";
  button.title = "Pause Timer";
}

// Sorting support
function applySorting() {
  const sortSelect = document.getElementById('sortOption');
  const mode = sortSelect ? sortSelect.value : 'none';
  if (!mode || mode === 'none') return;

  const byPriority = (a, b) => {
    const map = { high: 2, medium: 1, low: 0 };
    const ta = getTaskById(a.dataset.taskId);
    const tb = getTaskById(b.dataset.taskId);
    const va = ta ? map[ta.priority] || 0 : 0;
    const vb = tb ? map[tb.priority] || 0 : 0;
    return vb - va; // high first
  };

  const byDate = (a, b) => {
    const ta = getTaskById(a.dataset.taskId);
    const tb = getTaskById(b.dataset.taskId);
    const da = ta && ta.date ? ta.date : '9999-12-31';
    const db = tb && tb.date ? tb.date : '9999-12-31';
    if (da === db) return 0;
    return da < db ? -1 : 1; // earlier first
  };

  document.querySelectorAll('.group ul').forEach((ul) => {
    const items = Array.from(ul.children);
    items.sort(mode === 'priority' ? byPriority : byDate);
    items.forEach((li) => ul.appendChild(li));
  });
}

// Helper function
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Form validation helpers
function clearValidationErrors() {
  document.querySelectorAll('.error-message').forEach(el => {
    el.classList.remove('show');
    el.textContent = '';
  });
}

function showValidationError(fieldId, message) {
  const errorEl = document.getElementById(`${fieldId}-error`);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('show');
  }
}

function showFormFeedback(message, type = 'success') {
  const feedbackEl = document.getElementById('form-feedback');
  if (feedbackEl) {
    feedbackEl.textContent = message;
    feedbackEl.className = `form-feedback show ${type}`;
    setTimeout(() => {
      feedbackEl.classList.remove('show');
    }, 3000);
  }
}

// Init on load
(function init() {
  // Form submission
  const form = document.getElementById('task-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      addTask();
    });
  }

  // If a sort dropdown exists, wire it
  const sortSelect = document.getElementById('sortOption');
  if (sortSelect) {
    sortSelect.addEventListener('change', applySorting);
  }

  const viewSelect = document.getElementById('viewOption');
  if (viewSelect) {
    viewSelect.addEventListener('change', (e) => {
      currentView = e.target.value;
      renderAllTasks();
    });
  }

  // Search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderAllTasks();
    });
  }

  // Delete all button
  const deleteAllBtn = document.getElementById('deleteAllBtn');
  if (deleteAllBtn) {
    deleteAllBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete all tasks? This cannot be undone.')) {
        deleteAllTasks();
      }
    });
  }

  loadTasks();
})();
