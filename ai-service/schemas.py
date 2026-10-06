from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# ==========================================
# Core Unified RAG Generation Schemas
# ==========================================

class GenerateRequest(BaseModel):
    creator_id: Optional[str] = Field("public", description="Creator identifier for personalized style retrieval")
    niche: str = Field(..., min_length=2, max_length=100, description="Content niche (e.g. Tech, Finance, Gaming, Fitness, Education)")
    topic: str = Field(..., min_length=2, max_length=250, description="Specific topic or angle for the video")
    tone: Optional[str] = Field("engaging", max_length=100, description="Tone of voice (e.g., energetic, educational, provocative, analytical)")
    target_audience: Optional[str] = Field(None, max_length=200, description="Target demographic or viewer persona")

class ThumbnailConcept(BaseModel):
    title: str = Field(..., description="Short concept headline")
    text_overlay: str = Field(..., description="Bold 2-4 word high-CTR text overlay for the thumbnail")
    visual_elements: str = Field(..., description="Key visual focal point, subject expression, and background composition")
    color_palette: str = Field(..., description="High contrast color palette recommendations")
    layout_description: str = Field(..., description="Composition and placement (e.g., Rule of thirds, Split-screen)")

class ContentIdea(BaseModel):
    title: str = Field(..., description="Working title for the video")
    hook: str = Field(..., description="0-5 second opening hook script")
    description: str = Field(..., description="Core angle, key value proposition, and storyline outline")
    target_format: Optional[str] = Field("Long-form YouTube Video", description="Target video format (e.g., Long-form, Short, Masterclass)")

class GenerateResponse(BaseModel):
    success: bool = True
    titles: List[str] = Field(..., min_length=5, max_length=5, description="5 optimized viral video titles")
    thumbnails: List[ThumbnailConcept] = Field(..., min_length=3, max_length=3, description="3 structured thumbnail concepts")
    content_ideas: List[ContentIdea] = Field(..., min_length=5, max_length=5, description="5 personalized content ideas")
    context_used: Optional[List[str]] = Field(default_factory=list, description="References from retrieval context utilized")
    message: str = "Content generated successfully using RAG workflow"

# ==========================================
# Feedback Schema for Re-Ingestion Loop
# ==========================================

class FeedbackRequest(BaseModel):
    creator_id: str = Field(..., description="Creator identifier")
    niche: str = Field(..., description="Content niche")
    topic: str = Field(..., description="Topic of generated content")
    selected_title: str = Field(..., description="Title chosen by creator")
    rating: Optional[int] = Field(5, ge=1, le=5, description="Quality rating (1-5)")
    notes: Optional[str] = Field(None, description="Creator notes or adaptations")

class FeedbackResponse(BaseModel):
    success: bool = True
    message: str = "Feedback received and saved for creator personalization"

# ==========================================
# Legacy Schemas for Full Backward Compatibility
# ==========================================

class VideoTitleRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=200)
    niche: str = Field(..., min_length=2, max_length=100)
    target_audience: Optional[str] = Field(None, max_length=200)
    creator_id: Optional[str] = Field("public", max_length=100)
    tone: Optional[str] = Field("engaging", max_length=100)

class ContentIdeaRequest(BaseModel):
    niche: str = Field(..., min_length=2, max_length=100)
    previous_content: Optional[str] = Field(None, max_length=500)
    target_audience: Optional[str] = Field(None, max_length=200)
    current_trends: Optional[str] = Field(None, max_length=300)
    creator_id: Optional[str] = Field("public", max_length=100)

class ThumbnailRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=200)
    category: str = Field(..., min_length=2, max_length=100)
    mood: Optional[str] = Field(None, max_length=100)

class VideoTitleResponse(BaseModel):
    success: bool
    titles: List[str]
    message: str

class ContentIdeaResponse(BaseModel):
    success: bool
    ideas: List[Dict[str, Any]]
    message: str

class ThumbnailResponse(BaseModel):
    success: bool
    suggestions: List[Dict[str, Any]]
    message: str
