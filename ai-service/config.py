import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Ensure local .env and root .env are loaded
load_dotenv(Path(__file__).parent / ".env")
load_dotenv(Path(__file__).parent.parent / ".env")
load_dotenv()

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "Drishya AI Creator Assistant"
    AI_SERVICE_HOST: str = os.getenv("AI_SERVICE_HOST", "0.0.0.0")
    AI_SERVICE_PORT: int = int(os.getenv("PORT", os.getenv("AI_SERVICE_PORT", "8001")))
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    NODE_ENV: str = os.getenv("NODE_ENV", "development")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "")

    # LLM Provider Configuration
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini") # "gemini", "openai"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    GEMINI_FALLBACK_MODEL: str = os.getenv("GEMINI_FALLBACK_MODEL", "gemini-3.5-flash-lite")
    
    # Embedding Configuration
    EMBEDDING_PROVIDER: str = os.getenv("EMBEDDING_PROVIDER", "huggingface") # "huggingface", "gemini"
    EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
    
    # RAG Vector Store
    INDEX_DIR: str = os.getenv("INDEX_DIR", str(Path(__file__).parent / "faiss_index"))
    RETRIEVAL_K: int = int(os.getenv("RETRIEVAL_K", "5"))
    RETRIEVAL_FETCH_K: int = int(os.getenv("RETRIEVAL_FETCH_K", "20"))
    
    # Optional image generation key
    FAL_KEY: str = os.getenv("FAL_KEY", "")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
