import logging
from fastapi import APIRouter, HTTPException

from schemas import (
    GenerateRequest,
    GenerateResponse,
    FeedbackRequest,
    FeedbackResponse,
    VideoTitleRequest,
    VideoTitleResponse,
    ContentIdeaRequest,
    ContentIdeaResponse,
    ThumbnailRequest,
    ThumbnailResponse
)
from rag.rag_service import get_rag_service

logger = logging.getLogger("GeneratorRoutes")

def create_generator_routes(gemini_service=None, fal_service=None):
    """
    Create FastAPI routes for content generation with RAG & LangChain
    """
    router = APIRouter(tags=["Content Generation & RAG Workflows"])

    # ==========================================
    # Unified RAG Generation Endpoint
    # ==========================================
    @router.post(
        "/generate",
        response_model=GenerateResponse,
        summary="Unified RAG Content Generation",
        description="Generates 5 video titles, 3 thumbnail concepts, and 5 personalized content ideas using FAISS retrieval and LLMs."
    )
    async def generate_content(request: GenerateRequest):
        """
        Main RAG generation endpoint:
        1. Retrieves contextual documents (top videos, hook formulas, thumbnail patterns) from FAISS
        2. Injects context into LangChain prompt template
        3. Calls LLM with strict structured JSON output parsing
        4. Returns validated Pydantic response
        """
        try:
            rag_service = get_rag_service()
            response = await rag_service.generate_content_rag(request)
            return response
        except Exception as e:
            logger.error(f"Error in /generate endpoint: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Content generation failed: {str(e)}"
            )

    # Prefix route alias for API versioning
    @router.post("/api/v1/generate", response_model=GenerateResponse, include_in_schema=False)
    async def generate_content_v1(request: GenerateRequest):
        return await generate_content(request)

    # ==========================================
    # Personalization Feedback Endpoint
    # ==========================================
    @router.post(
        "/feedback",
        response_model=FeedbackResponse,
        summary="Creator Title Feedback",
        description="Stores creator-selected titles for personalization and continuous FAISS re-ingestion."
    )
    async def record_feedback(request: FeedbackRequest):
        """
        Record feedback from creator:
        Stores preferred titles and adds them to the vector index for creator personalization
        """
        try:
            rag_service = get_rag_service()
            return rag_service.store_feedback(request)
        except Exception as e:
            logger.error(f"Error recording feedback: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to record feedback: {str(e)}"
            )

    @router.post("/api/v1/feedback", response_model=FeedbackResponse, include_in_schema=False)
    async def record_feedback_v1(request: FeedbackRequest):
        return await record_feedback(request)

    # ==========================================
    # Health Check Endpoint
    # ==========================================
    @router.get(
        "/health",
        summary="Health Check",
        description="Check if the AI service and RAG pipelines are healthy"
    )
    async def health_check():
        rag_service = get_rag_service()
        has_index = rag_service.vector_store is not None
        return {
            "status": "healthy",
            "service": "Drishya AI Creator Assistant",
            "rag_index_loaded": has_index
        }

    @router.get("/api/v1/generate/health", include_in_schema=False)
    async def health_check_v1():
        return await health_check()

    # ==========================================
    # Legacy Sub-Endpoints (Zero Frontend Regression)
    # ==========================================
    @router.post(
        "/api/v1/generate/video-titles",
        response_model=VideoTitleResponse,
        summary="Legacy Video Titles Endpoint"
    )
    async def generate_video_titles(request: VideoTitleRequest):
        try:
            rag_service = get_rag_service()
            gen_req = GenerateRequest(
                topic=request.topic,
                niche=request.niche,
                target_audience=request.target_audience,
                creator_id=request.creator_id or "public",
                tone=request.tone or "engaging"
            )
            result = await rag_service.generate_content_rag(gen_req)
            return VideoTitleResponse(
                success=True,
                titles=result.titles,
                message="Video titles generated successfully using RAG"
            )
        except Exception as e:
            logger.error(f"Error in video-titles: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.post(
        "/api/v1/generate/content-ideas",
        response_model=ContentIdeaResponse,
        summary="Legacy Content Ideas Endpoint"
    )
    async def generate_content_ideas(request: ContentIdeaRequest):
        try:
            rag_service = get_rag_service()
            topic_hint = f"{request.niche} Strategy"
            if request.previous_content:
                topic_hint += f" following {request.previous_content}"
            gen_req = GenerateRequest(
                topic=topic_hint,
                niche=request.niche,
                target_audience=request.target_audience,
                creator_id=request.creator_id or "public"
            )
            result = await rag_service.generate_content_rag(gen_req)
            ideas_dict = [{"title": idea.title, "description": f"{idea.hook} — {idea.description}"} for idea in result.content_ideas]
            return ContentIdeaResponse(
                success=True,
                ideas=ideas_dict,
                message="Content ideas generated successfully using RAG"
            )
        except Exception as e:
            logger.error(f"Error in content-ideas: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.post(
        "/api/v1/generate/thumbnail-suggestions",
        response_model=ThumbnailResponse,
        summary="Legacy Thumbnail Suggestions Endpoint"
    )
    async def generate_thumbnail_suggestions(request: ThumbnailRequest):
        # Optional Fal.ai generation if key is present
        if fal_service and getattr(fal_service, "api_key", None):
            try:
                import asyncio
                image_url = await asyncio.wait_for(
                    asyncio.to_thread(
                        fal_service.generate_thumbnail_image,
                        topic=request.topic,
                        category=request.category,
                        mood=request.mood
                    ),
                    timeout=4.0
                )
                return ThumbnailResponse(
                    success=True,
                    suggestions=[{
                        "text": f"Generated Thumbnail for '{request.topic}'",
                        "imageUrl": image_url,
                        "layout": f"FLUX Dev generated image ({request.category} niche)",
                        "colors": f"Mood: {request.mood or 'default'}"
                    }],
                    message="Thumbnail image generated successfully using Fal.ai"
                )
            except Exception as e:
                logger.warning(f"Fal.ai generation skipped/failed, using RAG thumbnail concepts: {e}")

        try:
            rag_service = get_rag_service()
            gen_req = GenerateRequest(
                topic=request.topic,
                niche=request.category,
                tone=request.mood or "engaging"
            )
            result = await rag_service.generate_content_rag(gen_req)
            suggestions = [
                {
                    "text": t.text_overlay,
                    "colors": t.color_palette,
                    "layout": f"{t.layout_description} | {t.visual_elements}"
                }
                for t in result.thumbnails
            ]
            return ThumbnailResponse(
                success=True,
                suggestions=suggestions,
                message="Thumbnail suggestions generated successfully using RAG"
            )
        except Exception as e:
            logger.error(f"Error in thumbnail-suggestions: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    return router
