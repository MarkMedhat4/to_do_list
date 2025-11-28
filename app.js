// Central tasks state persisted in localStorage
let tasks = [];

// Utilities: storage
function saveTasks() {
  try {
    localStorage.setItem("tasksData", JSON.stringify(tasks));
  } catch (e) {
    console.error("Failed to save tasks:", e);
  }
}

function loadTasks() {
  try {
    const raw = localStorage.getItem("tasksData");
    tasks = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to parse tasks from storage, resetting.", e);
    tasks = [];
  }

  // Render tasks
  const groupsContainer = document.getElementById("groupsContainer");
  groupsContainer.innerHTML = "";

  tasks.forEach((task) => {
    renderTask(task);
  });

  // Apply any selected sort on load
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
  const taskList = createOrGetGroup(task.groupName);

  // li container
  const li = document.createElement("li");
  li.dataset.taskId = task.id;
  li.classList.add(`priority-${task.priority}`);
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
  deleteBtn.textContent = "🗑";
  deleteBtn.title = "Delete Task";
  deleteBtn.onclick = function () {
    // Clear any active timer for this task
    const timerDisplay = li.querySelector(".timer-display[data-interval-id]");
    if (timerDisplay) {
      clearInterval(parseInt(timerDisplay.dataset.intervalId, 10));
      delete timerDisplay.dataset.intervalId;
    }

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

  if (!groupName || !taskText) return;

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

  // Clear inputs
  document.getElementById("groupName").value = "";
  document.getElementById("taskInput").value = "";
  document.getElementById("taskPriority").value = "low";
  document.getElementById("taskDate").value = "";
  document.getElementById("taskTimer").value = "";
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

// Init on load
(function init() {
  // If a sort dropdown exists, wire it
  const sortSelect = document.getElementById('sortOption');
  if (sortSelect) {
    sortSelect.addEventListener('change', applySorting);
  }
  loadTasks();
})();
