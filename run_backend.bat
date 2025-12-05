@echo off
echo Compiling backend...
g++ backend.cpp -o backend.exe -lws2_32
if %errorlevel% neq 0 (
    echo Compilation failed!
    pause
    exit /b %errorlevel%
)

echo Starting C++ Backend Server...
echo Open http://localhost:8080 in your browser.
backend.exe
