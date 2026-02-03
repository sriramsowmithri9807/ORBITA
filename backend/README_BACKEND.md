# ORBITA Backend

This is the backend for the ORBITA Autonomous Space Mission Planner. It handles mission state, telemetry simulation, AI decision making, and real-time WebSocket broadcasting.

## Tech Stack

- **Python 3.11+**
- **FastAPI**: High-performance async web framework.
- **SQLAlchemy (Async)**: Database ORM.
- **AIOSQLite**: Async SQLite driver.
- **WebSockets**: Real-time communication.
- **Google Gemini**: Integration ready for AI analysis.

## Setup

1. **Create Virtual Environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Variables**:
   Create a `.env` file in `backend/` if you want to use a real Gemini API key.
   ```
   GEMINI_API_KEY=your_key_here
   DATABASE_URL=sqlite+aiosqlite:///./orbita.db
   ```

## Running the Server

```bash
python run.py
```
Or directly with uvicorn:
```bash
uvicorn app.main:app --reload
```
The server runs on **http://localhost:8000**.

## API Documentation

Once running, visit **http://localhost:8000/docs** for the Swagger UI.

## Architecture

- **`app/services/telemetry_service.py`**: Simulates satellite physics (battery drift, thermal cycles, orbital instability).
- **`app/services/autonomy_service.py`**: The core loop. It runs every few seconds for each active mission, evolving the telemetry, feeding it to the AI service, and logging the results.
- **`app/services/ai_service.py`**: Contains the logic to detect anomalies and suggest actions. Currently includes rule-based fallback logic for demonstration without API keys.

## API Endpoints

- **POST /mission/create**: Initialize a new mission.
- **POST /mission/{id}/start**: Manually start the autonomy loop.
- **WS /mission/live/{id}**: WebSocket for real-time telemetry updates.
