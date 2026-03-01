// ============================================================
//  TaskFlow — app.js
//  Updated to work with the redesigned UI
// ============================================================

let tasks = [];
let currentView = 'groups'; // 'groups', 'weeks', 'months'

// ─── Storage ────────────────────────────────────────────────

function saveTasks() {
  try {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  } catch (e) {
    showFormFeedback('Failed to save tasks', 'error');
  }
  updateSidebarStats();
}

function loadTasks() {
  try {
    const stored = localStorage.getItem('taskflow_tasks');
    // migrate from old key if needed
    const legacy = !stored && localStorage.getItem('tasks');
    tasks = stored ? JSON.parse(stored) : (legacy ? JSON.parse(legacy) : []);
  } catch (e) {
    tasks = [];
  }
  renderAllTasks();
}

// ─── Utility ─────────────────────────────────────────────────

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function capitalizeFirstLetter(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function minutesAndSeconds(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  const todayStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');
  return dateStr < todayStr;
}

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
}

function getGroupNameForTask(task) {
  if (currentView === 'groups') return task.groupName;
  if (currentView === 'weeks') {
    if (!task.date) return 'No Date';
    const { year, week } = getWeekNumber(new Date(task.date));
    return `Week ${week}, ${year}`;
  }
  if (currentView === 'months') {
    if (!task.date) return 'No Date';
    return new Date(task.date).toLocaleString('default', { month: 'long', year: 'numeric' });
  }
  return 'Unknown';
}

function getTaskById(id) {
  return tasks.find(t => t.id === id);
}

// ─── Stats ───────────────────────────────────────────────────

function updateSidebarStats() {
  const total   = tasks.length;
  const done    = tasks.filter(t => t.completed).length;
  const overdue = tasks.filter(t => !t.completed && isOverdue(t.date)).length;

  const el = (id) => document.getElementById(id);
  if (el('statTotal'))   el('statTotal').textContent   = total;
  if (el('statDone'))    el('statDone').textContent    = done;
  if (el('statOverdue')) el('statOverdue').textContent = overdue;
}

// ─── Rendering ───────────────────────────────────────────────

function renderAllTasks() {
  const container   = document.getElementById('groupsContainer');
  const emptyState  = document.getElementById('emptyState');
  container.innerHTML = '';

  if (tasks.length === 0) {
    emptyState.classList.add('show');
    updateSidebarStats();
    return;
  }

  emptyState.classList.remove('show');

  let list = [...tasks];

  // Search filter
  const searchVal = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  if (searchVal) {
    list = list.filter(t =>
      t.text.toLowerCase().includes(searchVal) ||
      t.groupName.toLowerCase().includes(searchVal)
    );
  }

  // Pre-sort by date when in time-based views
  if (currentView !== 'groups') {
    list.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.localeCompare(b.date);
    });
  }

  list.forEach(t => renderTask(t));
  applySorting();
  updateSidebarStats();
}

function createOrGetGroup(groupName) {
  let groupDiv = document.querySelector(`[data-group="${CSS.escape(groupName)}"]`);

  if (!groupDiv) {
    groupDiv = document.createElement('div');
    groupDiv.className = 'group';
    groupDiv.setAttribute('data-group', groupName);

    const header = document.createElement('div');
    header.className = 'group-header';

    const title = document.createElement('span');
    title.className = 'group-title';
    title.textContent = groupName;

    const count = document.createElement('span');
    count.className = 'group-count';
    count.textContent = '0';

    header.appendChild(title);
    header.appendChild(count);
    groupDiv.appendChild(header);

    const ul = document.createElement('ul');
    ul.className = 'task-list';
    ul.id = `list-${groupName}`;
    groupDiv.appendChild(ul);

    document.getElementById('groupsContainer').appendChild(groupDiv);
  }

  // Update count
  const ul = groupDiv.querySelector('ul');
  const countEl = groupDiv.querySelector('.group-count');
  if (countEl) {
    // will be updated after append
    setTimeout(() => {
      countEl.textContent = ul.querySelectorAll('li:not(.hidden-by-search)').length;
    }, 0);
  }

  return ul;
}

function renderTask(task) {
  const groupName = getGroupNameForTask(task);
  const ul = createOrGetGroup(groupName);

  const li = document.createElement('li');
  li.className = `task-item priority-${task.priority} slide-in`;
  li.dataset.taskId = task.id;
  if (task.completed) li.classList.add('completed');
  if (!task.completed && isOverdue(task.date)) li.classList.add('overdue');

  // ── Check button
  const checkBtn = document.createElement('button');
  checkBtn.className = 'task-check';
  checkBtn.title = 'Toggle complete';
  checkBtn.setAttribute('aria-label', 'Toggle complete');
  checkBtn.innerHTML = `<svg class="task-check-icon" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="2,6 5,9 10,3"/></svg>`;
  checkBtn.onclick = () => toggleComplete(task.id, li);

  // ── Task body
  const body = document.createElement('div');
  body.className = 'task-body';

  const textEl = document.createElement('div');
  textEl.className = 'task-text';
  textEl.textContent = task.text;
  textEl.title = task.text;

  const meta = document.createElement('div');
  meta.className = 'task-meta';

  // Priority badge
  const priTag = document.createElement('span');
  priTag.className = `meta-tag priority-${task.priority}`;
  priTag.textContent = capitalizeFirstLetter(task.priority);
  meta.appendChild(priTag);

  // Date badge
  if (task.date) {
    const dateTag = document.createElement('span');
    dateTag.className = `meta-tag${isOverdue(task.date) && !task.completed ? ' overdue-tag' : ''}`;
    const label = isOverdue(task.date) && !task.completed ? '⚠ ' : '';
    dateTag.textContent = `${label}${task.date}`;
    meta.appendChild(dateTag);
  }

  body.appendChild(textEl);
  body.appendChild(meta);

  // ── Actions
  const actions = document.createElement('div');
  actions.className = 'task-actions';

  // Timer
  if (task.timerMinutes && task.timerMinutes > 0) {
    const timerWrap = document.createElement('div');
    timerWrap.className = 'timer-container';

    const display = document.createElement('span');
    display.className = 'timer-display';

    const initSecs = Number.isFinite(task.remainingSeconds) && task.remainingSeconds > 0
      ? Math.max(0, Math.floor(task.remainingSeconds))
      : task.timerMinutes * 60;

    if (task.timerState === 'done' || initSecs === 0) {
      display.textContent = "Done!";
      display.classList.add('timer-expired');
    } else {
      display.textContent = minutesAndSeconds(initSecs);
    }

    const timerBtn = document.createElement('button');
    timerBtn.className = 'start-timer-btn';

    function refreshTimerBtn() {
      if (task.timerState === 'running') {
        timerBtn.textContent = 'Pause';
      } else if (task.timerState === 'done') {
        timerBtn.textContent = 'Done';
        timerBtn.disabled = true;
      } else if (task.timerState === 'paused') {
        timerBtn.textContent = 'Resume';
      } else {
        timerBtn.textContent = 'Start';
      }
    }

    refreshTimerBtn();

    timerBtn.onclick = () => {
      const t = getTaskById(task.id);
      if (!t) return;
      if (display.dataset.intervalId) {
        clearInterval(parseInt(display.dataset.intervalId));
        delete display.dataset.intervalId;
        t.timerState = 'paused';
        saveTasks();
        refreshTimerBtn();
        return;
      }
      startTimer(timerBtn, display, t);
      refreshTimerBtn();
    };

    timerWrap.appendChild(display);
    timerWrap.appendChild(timerBtn);
    actions.appendChild(timerWrap);
  }

  // Delete button
  const delBtn = document.createElement('button');
  delBtn.className = 'task-btn delete-btn';
  delBtn.title = 'Delete task';
  delBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>`;
  delBtn.onclick = () => deleteTask(task.id, li);

  actions.appendChild(delBtn);

  li.appendChild(checkBtn);
  li.appendChild(body);
  li.appendChild(actions);
  ul.appendChild(li);
}

// ─── Actions ─────────────────────────────────────────────────

function toggleComplete(id, li) {
  const t = getTaskById(id);
  if (!t) return;
  t.completed = !t.completed;
  li.classList.toggle('completed', t.completed);
  if (t.completed) {
    li.classList.remove('overdue');
  } else if (isOverdue(t.date)) {
    li.classList.add('overdue');
  }
  saveTasks();
}

function deleteTask(id, li) {
  li.classList.add('slide-out');
  li.addEventListener('animationend', () => {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    li.remove();
    // Remove empty group
    const ul = li.closest('ul');
    if (ul && ul.children.length === 0) {
      ul.closest('.group')?.remove();
    }
    if (tasks.length === 0) {
      document.getElementById('emptyState').classList.add('show');
    }
    updateSidebarStats();
  }, { once: true });
}

function deleteAllTasks() {
  document.querySelectorAll('.timer-display[data-interval-id]').forEach(el => {
    clearInterval(parseInt(el.dataset.intervalId));
  });
  tasks = [];
  saveTasks();
  document.getElementById('groupsContainer').innerHTML = '';
  document.getElementById('emptyState').classList.add('show');
}

function addTask() {
  const groupName = document.getElementById('groupName').value.trim();
  const taskText  = document.getElementById('taskInput').value.trim();
  const priority  = document.getElementById('taskPriority').value;
  const date      = document.getElementById('taskDate').value;
  const timerVal  = parseInt(document.getElementById('taskTimer').value, 10);

  // Clear errors
  document.querySelectorAll('.field-error').forEach(el => {
    el.textContent = '';
    el.classList.remove('show');
  });

  let valid = true;
  if (!groupName) {
    const el = document.getElementById('groupName-error');
    el.textContent = 'Group name is required';
    el.classList.add('show');
    valid = false;
  }
  if (!taskText) {
    const el = document.getElementById('taskInput-error');
    el.textContent = 'Task description is required';
    el.classList.add('show');
    valid = false;
  }
  if (!valid) return;

  const timer = !isNaN(timerVal) && timerVal > 0 ? timerVal : 0;

  const task = {
    id:               generateId(),
    groupName,
    text:             taskText,
    priority,
    date:             date || '',
    timerMinutes:     timer,
    remainingSeconds: timer * 60,
    timerState:       timer > 0 ? 'idle' : 'none',
    completed:        false,
  };

  tasks.push(task);
  saveTasks();

  if (currentView !== 'groups') {
    renderAllTasks();
  } else {
    document.getElementById('emptyState').classList.remove('show');
    renderTask(task);
    applySorting();
  }

  showFormFeedback('✓ Task added!', 'success');

  document.getElementById('groupName').value   = '';
  document.getElementById('taskInput').value   = '';
  document.getElementById('taskPriority').value = 'medium';
  document.getElementById('taskDate').value    = '';
  document.getElementById('taskTimer').value   = '';
  document.getElementById('taskInput').focus();
}

// ─── Timer ───────────────────────────────────────────────────

function startTimer(button, display, task) {
  if (display.dataset.intervalId) {
    clearInterval(parseInt(display.dataset.intervalId));
    delete display.dataset.intervalId;
  }

  let secs = Number.isFinite(task.remainingSeconds) && task.remainingSeconds > 0
    ? Math.floor(task.remainingSeconds)
    : (task.timerMinutes || 0) * 60;

  if (secs <= 0) {
    task.timerState = 'done';
    display.textContent = 'Done!';
    display.classList.add('timer-expired');
    button.disabled = true;
    saveTasks();
    return;
  }

  display.textContent = minutesAndSeconds(secs);
  task.timerState = 'running';
  saveTasks();

  const id = setInterval(() => {
    secs--;
    task.remainingSeconds = Math.max(0, secs);
    display.textContent = minutesAndSeconds(secs);

    if (secs <= 0) {
      clearInterval(id);
      delete display.dataset.intervalId;
      display.textContent = 'Done!';
      display.classList.add('timer-expired');
      button.textContent = 'Done';
      button.disabled = true;
      task.timerState = 'done';
      task.remainingSeconds = 0;
      const li = display.closest('li');
      if (li) {
        li.classList.add('timer-finished-highlight');
        setTimeout(() => li.classList.remove('timer-finished-highlight'), 700);
      }
      saveTasks();
      return;
    }

    saveTasks();
  }, 1000);

  display.dataset.intervalId = String(id);
  button.textContent = 'Pause';
}

// ─── Sorting ─────────────────────────────────────────────────

function applySorting() {
  const mode = document.getElementById('sortOption')?.value;
  if (!mode || mode === 'none') return;

  const priority = { high: 2, medium: 1, low: 0 };

  document.querySelectorAll('.task-list').forEach(ul => {
    const items = Array.from(ul.children);
    items.sort((a, b) => {
      const ta = getTaskById(a.dataset.taskId);
      const tb = getTaskById(b.dataset.taskId);
      if (!ta || !tb) return 0;
      if (mode === 'priority') {
        return (priority[tb.priority] || 0) - (priority[ta.priority] || 0);
      }
      if (mode === 'date') {
        const da = ta.date || '9999-12-31';
        const db = tb.date || '9999-12-31';
        return da < db ? -1 : da > db ? 1 : 0;
      }
      return 0;
    });
    items.forEach(li => ul.appendChild(li));
  });
}

// ─── Form Feedback ───────────────────────────────────────────

function showFormFeedback(msg, type = 'success') {
  const el = document.getElementById('form-feedback');
  if (!el) return;
  el.textContent = msg;
  el.className = `form-feedback show ${type}`;
  setTimeout(() => el.classList.remove('show'), 2800);
}

// ─── Init ────────────────────────────────────────────────────

(function init() {
  // Form submit
  document.getElementById('task-form')?.addEventListener('submit', e => {
    e.preventDefault();
    addTask();
  });

  // Sort
  document.getElementById('sortOption')?.addEventListener('change', applySorting);

  // View nav buttons
  document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view;
      document.querySelectorAll('.nav-btn[data-view]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAllTasks();
    });
  });

  // Legacy view select (not in new HTML, kept for safety)
  document.getElementById('viewOption')?.addEventListener('change', e => {
    currentView = e.target.value;
    renderAllTasks();
  });

  // Search
  document.getElementById('searchInput')?.addEventListener('input', renderAllTasks);

  // Delete all
  document.getElementById('deleteAllBtn')?.addEventListener('click', () => {
    if (confirm('Delete all tasks? This cannot be undone.')) {
      deleteAllTasks();
    }
  });

  loadTasks();
})();
