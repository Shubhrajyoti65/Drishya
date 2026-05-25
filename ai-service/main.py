import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import services and routes
from services.gemini_service import GeminiAIService
from routes.generator_routes import create_generator_routes

# Initialize FastAPI app
app = FastAPI(
    title="Drishya AI Service",
    description="AI-powered content generation service for creators",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
try:
    gemini_service = GeminiAIService()
    logger.info("Gemini AI Service initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Gemini AI Service: {str(e)}")
    raise

# Include routes
generator_router = create_generator_routes(gemini_service)
app.include_router(generator_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Drishya AI Service",
        "version": "1.0.0",
        "docs": "/api/docs",
        "endpoints": {
            "health": "/api/v1/generate/health",
            "video_titles": "/api/v1/generate/video-titles",
            "content_ideas": "/api/v1/generate/content-ideas",
            "thumbnail_suggestions": "/api/v1/generate/thumbnail-suggestions"
        }
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Drishya AI Service"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "An error occurred",
            "error": str(exc) if os.getenv("NODE_ENV") != "production" else "Internal server error"
        }
    )


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("AI_SERVICE_PORT", 8001))
    host = os.getenv("AI_SERVICE_HOST", "0.0.0.0")

    logger.info(f"Starting Drishya AI Service on {host}:{port}")

    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info"
    )
