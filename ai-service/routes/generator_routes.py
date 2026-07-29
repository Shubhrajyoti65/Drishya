from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


class VideoTitleRequest(BaseModel):
    topic: str = Field(..., min_length=3, max_length=200)
    niche: str = Field(..., min_length=3, max_length=100)
    target_audience: Optional[str] = Field(None, max_length=200)


class ContentIdeaRequest(BaseModel):
    niche: str = Field(..., min_length=3, max_length=100)
    previous_content: Optional[str] = Field(None, max_length=500)
    target_audience: Optional[str] = Field(None, max_length=200)
    current_trends: Optional[str] = Field(None, max_length=300)


class ThumbnailRequest(BaseModel):
    topic: str = Field(..., min_length=3, max_length=200)
    category: str = Field(..., min_length=3, max_length=100)
    mood: Optional[str] = Field(None, max_length=100)


class VideoTitleResponse(BaseModel):
    success: bool
    titles: List[str]
    message: str


class ContentIdeaResponse(BaseModel):
    success: bool
    ideas: List[dict]
    message: str


class ThumbnailResponse(BaseModel):
    success: bool
    suggestions: List[dict]
    message: str


def create_generator_routes(gemini_service, fal_service):
    """
    Create FastAPI routes for content generation
    
    Args:
        gemini_service: Instance of GeminiAIService
    """
    router = APIRouter(prefix="/api/v1/generate", tags=["Content Generation"])

    @router.post(
        "/video-titles",
        response_model=VideoTitleResponse,
        summary="Generate video titles",
        description="Generate 5 AI-powered YouTube video titles based on topic, niche, and target audience"
    )
    async def generate_video_titles(request: VideoTitleRequest):
        """
        Generate optimized video titles for YouTube
        
        Args:
            request: VideoTitleRequest containing topic, niche, target_audience
            
        Returns:
            VideoTitleResponse with generated titles
        """
        if not gemini_service:
            raise HTTPException(
                status_code=500,
                detail="Gemini AI Service is not initialized. Please configure a valid GEMINI_API_KEY."
            )
        try:
            titles = await gemini_service.generate_video_titles(
                topic=request.topic,
                niche=request.niche,
                target_audience=request.target_audience,
            )

            return VideoTitleResponse(
                success=True,
                titles=titles,
                message="Video titles generated successfully"
            )

        except Exception as e:
            logger.error(f"Error generating video titles: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error generating video titles: {str(e)}"
            )

    @router.post(
        "/content-ideas",
        response_model=ContentIdeaResponse,
        summary="Generate content ideas",
        description="Generate 5 personalized content ideas based on creator's niche and audience"
    )
    async def generate_content_ideas(request: ContentIdeaRequest):
        """
        Generate personalized content ideas
        
        Args:
            request: ContentIdeaRequest with niche, previous content, audience, trends
            
        Returns:
            ContentIdeaResponse with generated ideas
        """
        if not gemini_service:
            raise HTTPException(
                status_code=500,
                detail="Gemini AI Service is not initialized. Please configure a valid GEMINI_API_KEY."
            )
        try:
            ideas = await gemini_service.generate_content_ideas(
                niche=request.niche,
                previous_content=request.previous_content,
                target_audience=request.target_audience,
                current_trends=request.current_trends or ""
            )

            return ContentIdeaResponse(
                success=True,
                ideas=ideas,
                message="Content ideas generated successfully"
            )

        except Exception as e:
            logger.error(f"Error generating content ideas: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error generating content ideas: {str(e)}"
            )

    @router.post(
        "/thumbnail-suggestions",
        response_model=ThumbnailResponse,
        summary="Generate thumbnail suggestions",
        description="Generate 3 thumbnail design suggestions with text, colors, and layout"
    )
    async def generate_thumbnail_suggestions(request: ThumbnailRequest):
        """
        Generate thumbnail design suggestions
        
        Args:
            request: ThumbnailRequest with topic and category
            
        Returns:
            ThumbnailResponse with design suggestions
        """
        # Try generating via Fal.ai if available
        if fal_service and fal_service.api_key:
            try:
                import asyncio
                # Run the blocking Fal.ai network call in a separate thread
                image_url = await asyncio.to_thread(
                    fal_service.generate_thumbnail_image,
                    topic=request.topic,
                    category=request.category,
                    mood=request.mood
                )
                suggestions = [
                    {
                        "text": f"Generated Thumbnail for '{request.topic}'",
                        "imageUrl": image_url,
                        "layout": f"FLUX Dev generated landscape image ({request.category} niche)",
                        "colors": f"Mood: {request.mood or 'default'}"
                    }
                ]
                return ThumbnailResponse(
                    success=True,
                    suggestions=suggestions,
                    message="Thumbnail image generated successfully using Fal.ai"
                )
            except Exception as e:
                logger.warning(f"Fal.ai generation failed, falling back to Gemini suggestions: {str(e)}")

        if not gemini_service:
            raise HTTPException(
                status_code=500,
                detail="Neither Fal.ai nor Gemini AI Service is initialized. Please configure API keys."
            )
        try:
            suggestions = await gemini_service.generate_thumbnail_suggestions(
                topic=request.topic,
                category=request.category,
            )

            return ThumbnailResponse(
                success=True,
                suggestions=suggestions,
                message="Thumbnail suggestions generated successfully"
            )

        except Exception as e:
            logger.error(f"Error generating thumbnail suggestions: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error generating thumbnail suggestions: {str(e)}"
            )

    @router.get(
        "/health",
        summary="Health check",
        description="Check if the AI service is running"
    )
    async def health_check():
        """Health check endpoint"""
        return {
            "success": True,
            "message": "AI service is running",
            "service": "Drishya AI Generator"
        }

    return router
