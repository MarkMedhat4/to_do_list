# 📝 TaskFlow — To-Do List App

A professional, feature-rich task management app with a **dark glassmorphism UI**, sidebar navigation, real-time stats, and full task organization with groups, priorities, timers, and multiple view modes.

![Built with](https://img.shields.io/badge/Built%20with-HTML%2FCSS%2FJS-blue) ![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### 📋 Task Management
- Create tasks with custom group names
- Set **priorities** (Low / Medium / High) with color-coded indicators
- Add **due dates** with automatic overdue detection
- Mark tasks as complete or delete them individually
- **Clear All** button with confirmation dialog

### 🗂 View Modes (Sidebar)
- **Groups** — Organize tasks by your custom group names
- **Weekly** — Auto-group tasks by ISO week number
- **Monthly** — View tasks organized by month and year

### 📊 Live Stats (Sidebar)
- Real-time counters for **Total**, **Done**, and **Overdue** tasks
- Updates instantly on every add, complete, or delete action

### ⏱ Task Timers
- Pomodoro-style per-task countdown timer
- Start, Pause, and Resume support
- Visual flash animation when timer finishes
- Timer state persists across page reloads

### 🔍 Search & Sort
- Real-time search filters tasks by name or group
- Sort by **Priority** (High → Low) or **Due Date** (Earliest first)

### 🎨 UI / UX
- Dark theme with warm yellow accent (`#f5c542`)
- DM Sans + DM Mono typography
- Priority color strip on each task card (green / orange / red)
- Smooth slide-in animations on task creation
- Overdue tasks highlighted with a red tint
- Fully responsive — works on desktop, tablet, and mobile

### 💾 Data Persistence
- Saved automatically to `localStorage` on every change
- Migrates data from older app versions automatically
- No backend or internet connection required

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3 (Custom Properties, Grid, Flexbox) |
| Scripting | Vanilla JS (ES6+) |
| Fonts | DM Sans + DM Mono (Google Fonts) |
| Storage | Browser `localStorage` |
| Optional Backend | C++ HTTP server (`backend.cpp`) |

---

## 🚀 Quick Start

### No Installation Needed
1. Download all project files into the same folder
2. Open `index.html` in any modern browser
3. Start adding tasks!

### Optional C++ Backend (Windows)
If you want file-based persistence instead of localStorage, compile and run the backend:

```bash
# Option 1: Use the batch script
run_backend.bat

# Option 2: Compile manually
g++ backend.cpp -o backend.exe -lws2_32
backend.exe
```

Then open `http://localhost:8080` in your browser. The backend serves static files and saves tasks to `tasks.json`.

---

## 📖 Usage Guide

### Adding a Task
1. Fill in the form at the top:
   - **Group** — Category name (e.g. "Work", "Personal")
   - **Task** — What needs to be done
   - **Priority** — Low, Medium, or High
   - **Due Date** — Optional deadline
   - **Timer** — Optional countdown in minutes
2. Click **+ Add Task**

### Managing Tasks
- **Complete** — Click the circle button on the left of a task
- **Delete** — Click the trash icon on the right
- **Timer** — Click Start → Pause → Resume as needed

### Views & Filters
- Switch views from the **left sidebar** (Groups / Weekly / Monthly)
- Use the **search bar** in the top right to filter in real time
- Use the **Sort** dropdown to reorder by priority or date

### Visual Indicators
- 🟢 **Green strip** = Low priority
- 🟡 **Orange strip** = Medium priority
- 🔴 **Red strip** = High priority
- ⚠ **Red tint** = Overdue task

---

## 📂 Project Structure

```
taskflow/
├── index.html          # App layout — sidebar, form, task container
├── style.css           # Dark theme, animations, responsive layout
├── app.js              # Task logic, rendering, timers, storage
├── README.md           # This file
├── backend.cpp         # Optional C++ HTTP server (Windows)
└── run_backend.bat     # Compile + run backend script
```

---

## 🎨 Customization

### Change Accent Color
Edit in `style.css`:
```css
:root {
  --accent: #f5c542;       /* Main accent (yellow-gold) */
  --accent-dim: rgba(245, 197, 66, 0.12);
  --accent-glow: rgba(245, 197, 66, 0.25);
}
```

### Change Background
```css
:root {
  --bg:   #0e0f11;   /* Main background */
  --bg-2: #15161a;   /* Sidebar & cards */
  --bg-3: #1c1d22;   /* Input fields */
}
```

### Change Fonts
Replace the Google Fonts import in `index.html` and update `style.css`:
```css
:root {
  --font: 'Your Font', sans-serif;
  --mono: 'Your Mono Font', monospace;
}
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|---|---|
| Tasks not showing after reload | Check that `localStorage` is enabled in your browser |
| Form won't submit | Both **Group** and **Task** fields are required |
| Timer resets on reload | This is expected if the tab was closed while running — timer state is saved on pause |
| Backend not starting | Make sure `g++` and Winsock (`ws2_32`) are available on your system |
| Data lost after update | Old data migrates automatically from the `tasks` key to `taskflow_tasks` |

---

## 🔮 Planned Enhancements

- 🌙 Light mode toggle
- 📤 Export tasks to JSON / CSV
- 🔔 Browser notifications when timer ends
- 🏷 Task tags and labels
- 📊 Progress dashboard
- ⌨️ Keyboard shortcuts
- 📱 Progressive Web App (PWA) support
- ☁️ Optional cloud sync

---

## 📝 License

MIT License — free to use, modify, and distribute.
