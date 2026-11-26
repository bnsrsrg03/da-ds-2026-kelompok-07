@echo off
start "Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"
start "Backend" cmd /k "cd /d ""%~dp0backend"" && go run ."
start "Model service" cmd /k "cd /d ""%~dp0"" && call .venv\Scripts\activate.bat && uvicorn app.model.main:app --reload --port 8000"