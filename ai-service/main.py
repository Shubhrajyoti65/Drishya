import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from config import settings

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("DrishyaAIService")

# Import services and routes
from services.gemini_service import GeminiAIService
from services.fal_service import FalAIService
from rag.rag_service import get_rag_service
from routes.generator_routes import create_generator_routes

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing Drishya RAG Service and vector store...")
    rag = get_rag_service()
    if rag.vector_store is not None:
        logger.info("RAG FAISS Vector Store successfully mounted into memory.")
    else:
        logger.warning("RAG Vector store not yet indexed. Run 'python scripts/ingest.py' to build index.")
    yield
    # Shutdown
    logger.info("Shutting down Drishya AI Service...")

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Production RAG-powered content generation service for creators using LangChain and FAISS",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# CORS middleware
cors_origins_env = settings.CORS_ORIGINS
env_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
default_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8000",
    "https://drishya-chi.vercel.app",
]
allowed_origins = list(set(default_origins + env_origins)) if env_origins else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize optional auxiliary services
gemini_service = None
try:
    if settings.GEMINI_API_KEY:
        gemini_service = GeminiAIService()
except Exception as e:
    logger.warning(f"Legacy GeminiAIService init: {e}")

fal_service = None
try:
    if settings.FAL_KEY:
        fal_service = FalAIService()
except Exception as e:
    logger.debug(f"Auxiliary FalAIService init skipped: {e}")

# Include Generator & RAG Routes
generator_router = create_generator_routes(gemini_service, fal_service)
app.include_router(generator_router)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Drishya AI Creator Assistant",
        "version": "2.0.0",
        "docs": "/api/docs",
        "endpoints": {
            "health": "/health",
            "generate": "POST /generate",
            "feedback": "POST /feedback",
            "video_titles": "POST /api/v1/generate/video-titles",
            "content_ideas": "POST /api/v1/generate/content-ideas",
            "thumbnail_suggestions": "POST /api/v1/generate/thumbnail-suggestions"
        }
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception on {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "An error occurred during request processing",
            "error": str(exc) if settings.NODE_ENV != "production" else "Internal server error"
        }
    )

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting {settings.APP_NAME} on {settings.AI_SERVICE_HOST}:{settings.AI_SERVICE_PORT}")
    uvicorn.run(
        app,
        host=settings.AI_SERVICE_HOST,
        port=settings.AI_SERVICE_PORT,
        log_level=settings.LOG_LEVEL.lower()
    )
