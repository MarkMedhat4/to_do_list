# 📝 Modern To-Do List Application

A feature-rich, aesthetically pleasing To-Do List application designed with a **Glassmorphism** UI and **Notion-style** grouping views. This project connects a modern web frontend with a custom C++ backend for data persistence.

## ✨ Features

- **Modern UI**: Beautiful Glassmorphism design with smooth animations and a vibrant gradient background.
- **Smart Grouping**: Toggle views between **Custom Groups**, **Weekly**, and **Monthly** (Notion-style).
- **Task Management**:
  - Organize tasks into custom groups.
  - Set **Priorities** (Low, Medium, High).
  - Add **Due Dates** and track overdue items.
  - Built-in **Task Timers** (Pomodoro style).
- **Sorting**: Sort tasks by Priority or Due Date.
- **Persistence**: Tasks are saved to a local JSON file via a custom C++ server.

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Variables, Flexbox, Glassmorphism), JavaScript (ES6+).
- **Backend**: C++ (Winsock2 for HTTP server).
- **Font**: Poppins (Google Fonts).

## 🚀 How to Run

### Prerequisites
- A Windows environment (due to `Winsock2` usage in C++).
- `g++` compiler installed and added to PATH.

### Steps
1. **Start the Backend**:
   - Double-click `run_backend.bat` in the project folder.
   - This script compiles `backend.cpp` and starts the server on port `8080`.

2. **Access the App**:
   - Open your web browser and navigate to:
     ```
     http://localhost:8080
     ```

## 📂 Project Structure

- `index.html`: Main application structure.
- `style.css`: All styling, including animations and glassmorphism effects.
- `app.js`: Frontend logic (DOM manipulation, state management, view switching).
- `backend.cpp`: Lightweight HTTP server written in C++ handling API requests and file saving.
- `run_backend.bat`: Helper script to compile and run the server.
- `tasks.json`: (Created automatically) Stores your tasks.

---
