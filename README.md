# 📝 Modern To-Do List Application

A feature-rich, aesthetically pleasing to-do list application with a **Glassmorphism UI**, **Notion-style** grouping views, and persistent local storage. Organize, prioritize, and manage your tasks with timers and multiple viewing options.

![Built with](https://img.shields.io/badge/Built%20with-HTML%2FCSS%2FJS-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 📋 **Task Management**
- ✅ Create tasks with custom group organization
- ✅ Set task **priorities** (Low, Medium, High) with visual indicators
- ✅ Add **due dates** with overdue tracking
- ✅ Mark tasks as complete with visual feedback
- ✅ Delete individual tasks or clear all at once (with confirmation)
- ✅ Real-time search and filter functionality

### 🎯 **Viewing Options**
- **Groups View**: Organize tasks by custom group names
- **Weekly View**: Automatically group tasks by ISO week number
- **Monthly View**: View tasks organized by month and year
- Smooth transitions between different view modes

### ⏱️ **Task Timers**
- Built-in Pomodoro-style task timers
- Start, pause, and resume timer functionality
- Visual timer display with automatic completion detection
- Success animation when timer finishes

### 🎨 **Advanced UI/UX**
- Beautiful Glassmorphism design with frosted glass effects
- Vibrant gradient background (teal to purple)
- Smooth animations and transitions
- Priority-based color indicators (green, orange, red)
- Empty state messaging for better guidance
- Fully responsive design (desktop, tablet, mobile)
- Form validation with error messages
- Success/failure feedback notifications

### 💾 **Data Persistence**
- Tasks saved automatically to browser's LocalStorage
- Data persists across browser sessions
- No backend server required
- Instant sync across browser tabs

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3 (Custom Properties, Flexbox, Grid) |
| **Styling** | Glassmorphism, Gradient Backgrounds, Animations |
| **JavaScript** | ES6+, Async/Await, Event Handling, LocalStorage API |
| **Font** | Poppins (Google Fonts) |
| **Storage** | Browser LocalStorage |

## 🚀 Quick Start

### Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No backend server or compilation required!

### Installation & Running
1. **Clone or Download** the project files
2. **Open** `index.html` in your web browser
   - Double-click the file, or
   - Right-click → "Open with" → Select your browser
3. **Start adding tasks!**

## 📖 Usage Guide

### Adding a Task
1. Fill in the form fields:
   - **Group Name**: Category for organizing tasks (e.g., "Work", "Personal")
   - **Task Description**: What you need to do
   - **Priority**: Choose Low, Medium, or High
   - **Due Date**: Optional deadline (click calendar icon)
   - **Timer**: Optional time in minutes (Pomodoro timer)
2. Click **"+ Add Task"** button
3. Task appears in the appropriate group

### Managing Tasks
- **Complete a Task**: Click the ✔ (checkmark) button
- **Delete a Task**: Click the 🗑 (trash) button
- **Use Timer**: Click "Start" to begin a task timer
  - Click "Pause" to pause the timer
  - Click "Resume" to continue where you left off
  - Timer automatically completes when time reaches zero

### Filtering & Sorting
- **View Options**: Switch between Groups, Weekly, and Monthly views
- **Sort By**: Organize by Priority (High → Low) or Due Date (Earliest First)
- **Search**: Filter tasks by name or group in real-time
- **Clear All**: Remove all tasks at once (confirmation required)

### Visual Indicators
- 🟢 **Green border** = Low priority
- 🟠 **Orange border** = Medium priority
- 🔴 **Red border** = High priority
- 🔴 **Overdue tasks** = Red background with pulsing animation
- ✔ **Completed tasks** = Faded appearance with strikethrough text

## 📂 Project Structure

```
to-do-list/
├── index.html          # Main HTML structure & form
├── style.css           # Complete styling with animations
├── app.js              # Frontend logic & state management
├── README.md           # This file
└── run_backend.bat     # (Optional) Backend launcher script
```

### File Details

| File | Purpose |
|------|---------|
| `index.html` | Application structure, form inputs, and task container |
| `style.css` | Glassmorphism design, responsive layout, animations |
| `app.js` | Task creation, rendering, state management, event handling |
| `run_backend.bat` | (Optional) For C++ backend if needed in future |

## 🎨 Customization

### Change Color Scheme
Edit the CSS variables in `style.css` (lines 1-31):
```css
:root {
    --primary-color: #6c5ce7;      /* Main color */
    --danger-color: #ff7675;        /* Delete/danger color */
    --success-color: #00b894;       /* Complete/success color */
    /* ... more variables ... */
}
```

### Adjust Animations
Modify animation duration in `style.css`:
```css
--transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
```

## 💡 Tips & Tricks

- 💾 **Your data is safe**: All tasks are saved automatically to your browser
- 🔄 **Multiple windows**: Tasks sync across all open tabs
- 🔍 **Quick search**: Use the search box to find tasks instantly
- ⏰ **Timer alerts**: Set timers to stay focused on one task
- 📱 **Mobile friendly**: Works great on smartphones and tablets
- 🌙 **Works offline**: No internet connection required

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Tasks not appearing | Refresh the page or clear browser cache |
| Data lost after restart | Check if LocalStorage is enabled in browser |
| Form not submitting | Ensure both Group Name and Task Description are filled |
| Timer not working | Make sure JavaScript is enabled in your browser |

## 🔮 Future Enhancements

- 🌙 Dark mode toggle
- 📤 Export tasks to CSV/JSON
- 📱 Progressive Web App (PWA)
- ☁️ Cloud sync with optional backend
- 🔔 Desktop notifications
- 🎨 Customizable themes
- 🏷️ Task tags and labels
- 📊 Statistics dashboard
- ⌨️ Keyboard shortcuts
- 🔐 Local encryption

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation