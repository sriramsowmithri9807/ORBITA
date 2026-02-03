from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import init_db
from .routers import mission, websocket, ai

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown

app = FastAPI(
    title="ORBITA Mission Control API",
    description="Backend for Autonomous Space Mission Planner",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mission.router, prefix="/mission", tags=["Mission"])
app.include_router(websocket.router, tags=["WebSocket"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])

@app.get("/")
async def root():
    return {"message": "ORBITA Mission Control System Online"}
