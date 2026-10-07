import json
import logging
import asyncio
from pathlib import Path
from typing import List, Dict, Any, Optional

from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
import google.generativeai as genai

from config import settings
from schemas import (
    GenerateRequest,
    GenerateResponse,
    ThumbnailConcept,
    ContentIdea,
    FeedbackRequest,
    FeedbackResponse
)

logger = logging.getLogger("RAGService")

# ==========================================
# Prompt Templates with RAG Context Injection
# ==========================================

RAG_SYSTEM_PROMPT = """You are an elite YouTube Content Strategist and AI Creator Assistant.
Your mission is to generate high-CTR video titles, visual thumbnail concepts, and complete content ideas based on the provided creator inputs and the retrieved contextual knowledge.

CRITICAL INSTRUCTIONS:
1. Contextual Adaptation: Analyze the retrieved high-performing video patterns, title/hook formulas, and thumbnail designs in the CONTEXT section. Use their structural psychology, cadence, curiosity gap, and visual layouts to inspire your output.
2. Anti-Plagiarism / Originality Rule: DO NOT copy any retrieved title, tags, or concepts verbatim. Craft 100% original, fresh concepts tailored specifically to the user's topic, niche, tone, and audience.
3. Strict Output Format: You MUST output ONLY valid JSON matching the exact schema requested below, with NO extra conversational text or Markdown surrounding formatting outside the JSON block.

JSON Structure Expected:
{{
  "titles": [
    "Title 1",
    "Title 2",
    "Title 3",
    "Title 4",
    "Title 5"
  ],
  "thumbnails": [
    {{
      "title": "Short concept 1",
      "text_overlay": "2-4 BOLD WORDS",
      "visual_elements": "Focal subject, facial expression, and primary foreground/background objects",
      "color_palette": "High-contrast color scheme (e.g. Neon Yellow on Obsidian Black)",
      "layout_description": "Composition and placement (e.g. Rule of thirds, Split-screen, 3D float)"
    }},
    {{
      "title": "Short concept 2",
      "text_overlay": "2-4 BOLD WORDS",
      "visual_elements": "Focal subject and scenery details",
      "color_palette": "Color recommendations",
      "layout_description": "Layout recommendations"
    }},
    {{
      "title": "Short concept 3",
      "text_overlay": "2-4 BOLD WORDS",
      "visual_elements": "Focal subject and scenery details",
      "color_palette": "Color recommendations",
      "layout_description": "Layout recommendations"
    }}
  ],
  "content_ideas": [
    {{
      "title": "Working title 1",
      "hook": "Opening 0-5 second visual and verbal hook",
      "description": "Core angle, value breakdown, and narrative pacing",
      "target_format": "Long-form YouTube Video"
    }},
    {{
      "title": "Working title 2",
      "hook": "Opening hook",
      "description": "Content roadmap outline",
      "target_format": "Long-form YouTube Video"
    }},
    {{
      "title": "Working title 3",
      "hook": "Opening hook",
      "description": "Content roadmap outline",
      "target_format": "Step-by-Step Tutorial"
    }},
    {{
      "title": "Working title 4",
      "hook": "Opening hook",
      "description": "Content roadmap outline",
      "target_format": "Case Study / Breakdown"
    }},
    {{
      "title": "Working title 5",
      "hook": "Opening hook",
      "description": "Content roadmap outline",
      "target_format": "Challenge / Documentary"
    }}
  ]
}}
"""

RAG_USER_TEMPLATE = """=== CREATOR REQUEST ===
Topic: {topic}
Niche / Category: {niche}
Tone of Voice: {tone}
Target Audience: {target_audience}
Creator ID: {creator_id}

=== RETRIEVED RELEVANT CONTEXT (Top Patterns, Formulas & Thumbnails) ===
{context_text}

Generate 5 high-converting video titles, 3 distinct thumbnail concepts (with text_overlay, visual_elements, color_palette, layout_description), and 5 structured content ideas (with opening hooks and descriptions). Return ONLY valid JSON."""


class RAGService:
    """Production-grade RAG Service with FAISS and LLM Integration"""

    def __init__(self):
        self.vector_store: Optional[FAISS] = None
        self.embeddings: Optional[HuggingFaceEmbeddings] = None
        self.feedback_file: Path = Path(settings.INDEX_DIR) / "feedback_store.json"
        
        # Configure LLM
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.primary_model = genai.GenerativeModel(settings.GEMINI_MODEL)
            self.fallback_model = genai.GenerativeModel(settings.GEMINI_FALLBACK_MODEL)
        else:
            self.primary_model = None
            self.fallback_model = None

        # Load FAISS index at startup
        self._load_index()

    def _get_embeddings(self) -> HuggingFaceEmbeddings:
        """Get or initialize embeddings singleton"""
        if self.embeddings is None:
            logger.info("Initializing HuggingFaceEmbeddings ('all-MiniLM-L6-v2')...")
            self.embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL_NAME)
        return self.embeddings

    def _load_index(self):
        """Load persisted FAISS index once at startup"""
        index_path = Path(settings.INDEX_DIR)
        
        # Also check fallback locations
        alt_paths = [
            index_path,
            Path(__file__).resolve().parent.parent / "faiss_index",
            Path(__file__).resolve().parent.parent.parent / "faiss_index"
        ]

        for p in alt_paths:
            if p.exists() and (p / "index.faiss").exists():
                try:
                    emb = self._get_embeddings()
                    logger.info(f"Loading runtime FAISS index from {p}...")
                    self.vector_store = FAISS.load_local(
                        str(p),
                        emb,
                        allow_dangerous_deserialization=True
                    )
                    logger.info(f"FAISS index loaded successfully from {p}")
                    return
                except Exception as e:
                    logger.error(f"Error loading FAISS index from {p}: {e}")

        logger.warning(
            f"No FAISS index found at {index_path}. "
            f"RAG service will use robust curated fallback context until ingestion is executed."
        )

    def retrieve_context(
        self,
        query: str,
        niche: Optional[str] = None,
        creator_id: Optional[str] = "public",
        k: Optional[int] = None,
        fetch_k: Optional[int] = None
    ) -> List[Document]:
        """
        Retrieve relevant context documents using FAISS:
        - Filters by creator_id if specific creator history exists
        - Falls back to general/niche best practices if no creator-specific documents match
        - Safe graceful fallback when vector store is missing
        """
        k = k or settings.RETRIEVAL_K
        fetch_k = fetch_k or settings.RETRIEVAL_FETCH_K
        
        if self.vector_store is None:
            self._load_index()

        if self.vector_store is None:
            logger.info("Vector store unavailable. Providing default best-practice context.")
            return self._get_default_fallback_docs(niche, query)

        try:
            # 1. Check if creator-specific filter is requested and matches
            if creator_id and creator_id != "public":
                try:
                    creator_filter = lambda metadata: metadata.get("creator_id") == creator_id
                    creator_docs = self.vector_store.similarity_search(
                        query,
                        k=k,
                        filter=creator_filter
                    )
                    if creator_docs:
                        logger.info(f"Retrieved {len(creator_docs)} creator-specific documents for '{creator_id}'")
                        return creator_docs
                except Exception as cf_err:
                    logger.debug(f"Per-creator filter search skipped or not supported: {cf_err}")

            # 2. Search broad relevant knowledge across video trends, formulas, and thumbnails
            search_query = f"{query} {niche or ''}".strip()
            retriever = self.vector_store.as_retriever(
                search_type="similarity",
                search_kwargs={"k": k, "fetch_k": fetch_k}
            )
            docs = retriever.get_relevant_documents(search_query)
            
            if docs:
                logger.info(f"Retrieved {len(docs)} documents for query: '{search_query}'")
                return docs
            else:
                logger.info("Retriever returned 0 documents; using fallback guidelines.")
                return self._get_default_fallback_docs(niche, query)

        except Exception as e:
            logger.error(f"Error during retrieval: {e}")
            return self._get_default_fallback_docs(niche, query)

    def _get_default_fallback_docs(self, niche: Optional[str], query: str) -> List[Document]:
        """Graceful fallback documents when retrieval index is empty or offline"""
        return [
            Document(
                page_content="High-Performing Title Formula: 'How to [Achieve Desirable Goal] in [Timeframe] (Without [Major Pain Point])'. Focuses on speed and eliminating obstacles.",
                metadata={"type": "formula", "category": niche or "General", "creator_id": "public"}
            ),
            Document(
                page_content="Curiosity Gap Formula: 'The Real Reason [Entity/Topic] is Changing in 2026 (Brutally Honest Breakdown)'. Builds suspense and challenges common assumptions.",
                metadata={"type": "formula", "category": niche or "General", "creator_id": "public"}
            ),
            Document(
                page_content="High-CTR Thumbnail Pattern: 16:9 Split-Screen composition. Left side shows dark moody 'Before/Problem', right side displays vibrant neon 'After/Solution'. 3-word bold punchy text overlay.",
                metadata={"type": "thumbnail", "category": niche or "General", "creator_id": "public"}
            )
        ]

    async def _generate_with_llm(self, prompt: str) -> str:
        """Generate content from Gemini LLM with non-blocking thread execution and automatic fallback"""
        if not self.primary_model:
            raise ValueError("GEMINI_API_KEY environment variable not set or LLM model not configured.")

        try:
            response = await asyncio.wait_for(
                asyncio.to_thread(self.primary_model.generate_content, prompt),
                timeout=15.0
            )
            return response.text
        except Exception as e:
            logger.warning(f"Primary LLM model call failed ({e}). Attempting fallback model...")
            try:
                response = await asyncio.wait_for(
                    asyncio.to_thread(self.fallback_model.generate_content, prompt),
                    timeout=15.0
                )
                return response.text
            except Exception as fallback_err:
                logger.error(f"Fallback LLM also failed: {fallback_err}")
                raise fallback_err

    async def generate_content_rag(self, request: GenerateRequest) -> GenerateResponse:
        """
        Full End-to-End RAG Generation Pipeline:
        1. Retrieve top-k contextual documents from FAISS
        2. Format prompt template with injected context
        3. Call LLM asynchronously
        4. Validate structured Pydantic output
        5. Graceful fallback on parsing errors
        """
        # Step 1: Retrieval
        query = f"{request.topic} {request.niche}"
        retrieved_docs = self.retrieve_context(
            query=query,
            niche=request.niche,
            creator_id=request.creator_id,
            k=settings.RETRIEVAL_K,
            fetch_k=settings.RETRIEVAL_FETCH_K
        )

        # Build context strings
        context_snippets = []
        for i, doc in enumerate(retrieved_docs, 1):
            doc_type = doc.metadata.get("type", "knowledge")
            title_meta = doc.metadata.get("title", "")
            header = f"[Doc {i} | Type: {doc_type}" + (f" | {title_meta}]" if title_meta else "]")
            snippet = f"{header}\n{doc.page_content.strip()}"
            context_snippets.append(snippet)
        
        context_text = "\n\n".join(context_snippets) if context_snippets else "No prior creator data available; using standard high-performance creator templates."

        # Step 2: LangChain ChatPromptTemplate assembly
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", RAG_SYSTEM_PROMPT),
            ("human", RAG_USER_TEMPLATE)
        ])
        
        formatted_messages = prompt_template.format_messages(
            topic=request.topic,
            niche=request.niche,
            tone=request.tone or "engaging",
            target_audience=request.target_audience or "General YouTube Audience",
            creator_id=request.creator_id or "public",
            context_text=context_text
        )

        full_prompt = f"{formatted_messages[0].content}\n\n{formatted_messages[1].content}"

        # Step 3: LLM Generation
        try:
            response_text = await self._generate_with_llm(full_prompt)
            data = self._extract_json_data(response_text)
            
            # Step 4: Validate Pydantic Models
            titles = data.get("titles", [])
            raw_thumbs = data.get("thumbnails", [])
            raw_ideas = data.get("content_ideas", [])

            # Ensure minimum counts
            if len(titles) < 5:
                # Pad with generated templates if short
                titles.extend([
                    f"Why {request.topic} Changes Everything in {request.niche}",
                    f"The Complete {request.topic} Roadmap for 2026",
                    f"5 Huge {request.topic} Mistakes You Must Avoid",
                    f"Mastering {request.topic}: From Beginner to Pro",
                    f"I Tested {request.topic} for 30 Days (Real Results)"
                ])
            titles = titles[:5]

            thumbnails: List[ThumbnailConcept] = []
            for t in raw_thumbs:
                try:
                    thumbnails.append(ThumbnailConcept(
                        title=t.get("title", f"Thumbnail for {request.topic}"),
                        text_overlay=t.get("text_overlay", f"MASTER {request.topic.upper()[:15]}"),
                        visual_elements=t.get("visual_elements", "High contrast focal subject with modern studio lighting"),
                        color_palette=t.get("color_palette", "Bold Yellow & Deep Charcoal"),
                        layout_description=t.get("layout_description", "Rule of Thirds with subject on right and bold text on left")
                    ))
                except Exception:
                    pass
            
            # Ensure 3 thumbnails
            while len(thumbnails) < 3:
                idx = len(thumbnails) + 1
                thumbnails.append(ThumbnailConcept(
                    title=f"Concept #{idx}: {request.topic}",
                    text_overlay=f"THE TRUTH ABOUT {request.topic.upper()[:12]}",
                    visual_elements="Dramatic expressive subject with vibrant background element",
                    color_palette="Cyan & Dark Navy",
                    layout_description="Split screen high-contrast layout"
                ))
            thumbnails = thumbnails[:3]

            content_ideas: List[ContentIdea] = []
            for idea in raw_ideas:
                try:
                    content_ideas.append(ContentIdea(
                        title=idea.get("title", f"Ultimate Guide to {request.topic}"),
                        hook=idea.get("hook", f"If you're still doing {request.topic} the old way, stop immediately."),
                        description=idea.get("description", f"A comprehensive, step-by-step breakdown tailored for {request.niche}."),
                        target_format=idea.get("target_format", "Long-form YouTube Video")
                    ))
                except Exception:
                    pass

            # Ensure 5 ideas
            while len(content_ideas) < 5:
                idx = len(content_ideas) + 1
                content_ideas.append(ContentIdea(
                    title=f"Masterclass #{idx}: Advanced {request.topic} Tactics",
                    hook=f"In this video, I'm revealing the exact step-by-step framework for {request.topic}.",
                    description=f"Actionable strategies and real-world case studies in {request.niche}.",
                    target_format="Step-by-Step Tutorial"
                ))
            content_ideas = content_ideas[:5]

            used_refs = [f"[{doc.metadata.get('type', 'ref')}] {doc.metadata.get('title', doc.page_content[:50])}" for doc in retrieved_docs[:3]]

            return GenerateResponse(
                success=True,
                titles=titles,
                thumbnails=thumbnails,
                content_ideas=content_ideas,
                context_used=used_refs,
                message="Successfully generated personalized content using LangChain RAG workflow"
            )

        except Exception as e:
            logger.error(f"Generation error, activating resilient fallback: {e}")
            return self._build_fallback_response(request, retrieved_docs)

    def _build_fallback_response(self, request: GenerateRequest, retrieved_docs: List[Document]) -> GenerateResponse:
        """Deterministic high-quality fallback adhering strictly to Pydantic schema"""
        top = request.topic
        nich = request.niche
        aud = request.target_audience or "viewers"
        
        titles = [
            f"Why {top} is the Future of {nich} (2026 Guide)",
            f"How to Master {top} in 15 Minutes: Step-by-Step for {aud}",
            f"5 Massive {top} Mistakes Everyone is Making Right Now",
            f"I Tested {top} for 30 Days — Here's the Brutal Truth",
            f"The Only {top} Strategy You'll Ever Need in {nich}"
        ]

        thumbnails = [
            ThumbnailConcept(
                title=f"High Contrast Split-Screen for {top}",
                text_overlay=f"DON'T DO THIS!",
                visual_elements="Distressed expression on left side with red 'X', confident smiling creator on right with green checkmark",
                color_palette="Emergency Red & Electric Lime over Dark Navy",
                layout_description="Vertical 50/50 split-screen with glowing central separation bar"
            ),
            ThumbnailConcept(
                title=f"Extreme Close-Up Curiosity Hook",
                text_overlay="IT FINALLY HAPPENED",
                visual_elements=f"Subject holding key {nich} item with wide-eyed shocked expression and directional rim lighting",
                color_palette="Vibrant Yellow on Charcoal Obsidian",
                layout_description="Subject on right third, bold high-contrast text on left third"
            ),
            ThumbnailConcept(
                title=f"Clean Minimalist Tech Aesthetic",
                text_overlay=f"{top.upper()[:15]} SECRETS",
                visual_elements=f"Floating glassmorphism UI card displaying glowing graph and metrics for {top}",
                color_palette="Cyberpunk Cyan & Deep Purple gradient",
                layout_description="Centered hero element with subtle drop shadow and clean sans-serif typography"
            )
        ]

        content_ideas = [
            ContentIdea(
                title=f"Complete Beginner to Pro Roadmap: {top}",
                hook=f"Most people learn {top} completely backwards. Today, I'm showing you the 3-step roadmap that changes everything.",
                description=f"A complete actionable guide breaking down key tools, foundational principles, and common beginner traps in {nich}.",
                target_format="Long-form YouTube Video"
            ),
            ContentIdea(
                title=f"The 1 Habit That Made Me 10x Better at {top}",
                hook=f"I spent 6 months struggling with {top} until I discovered this one single technique.",
                description=f"Personal story arc detailing before-and-after breakthrough with actionable takeaways for {aud}.",
                target_format="Storytelling Video"
            ),
            ContentIdea(
                title=f"Ranking the Top 5 {top} Tools for 2026",
                hook=f"Are you wasting money on the wrong software? Here is the brutally honest ranking of every major tool.",
                description=f"Comprehensive tier list comparing features, pricing, and real workflow efficiency.",
                target_format="Tier List & Review"
            ),
            ContentIdea(
                title=f"Building a Real-World {top} Project from Scratch",
                hook=f"Don't just watch tutorials — let's actually build something live in the next 20 minutes.",
                description=f"Hands-on masterclass showing exact screen walkthrough and practical implementation.",
                target_format="Masterclass Tutorial"
            ),
            ContentIdea(
                title=f"The Death of Traditional {top}? What Comes Next",
                hook=f"Industry experts are quietly abandoning this method. Here is what is replacing it in 2026.",
                description=f"Forward-looking trend analysis examining AI integration and future market shifts.",
                target_format="Analysis & Essay"
            )
        ]

        used_refs = [f"[{doc.metadata.get('type', 'ref')}] {doc.page_content[:40]}..." for doc in retrieved_docs[:3]]

        return GenerateResponse(
            success=True,
            titles=titles,
            thumbnails=thumbnails,
            content_ideas=content_ideas,
            context_used=used_refs,
            message="Content generated using fallback creator intelligence"
        )

    def store_feedback(self, request: FeedbackRequest) -> FeedbackResponse:
        """
        Store creator feedback and selected title:
        Appends to local feedback store and dynamically adds to FAISS vector index
        """
        feedback_entry = {
            "creator_id": request.creator_id,
            "niche": request.niche,
            "topic": request.topic,
            "selected_title": request.selected_title,
            "rating": request.rating,
            "notes": request.notes
        }

        # 1. Save to JSON store
        self.feedback_file.parent.mkdir(parents=True, exist_ok=True)
        existing_data = []
        if self.feedback_file.exists():
            try:
                with open(self.feedback_file, "r", encoding="utf-8") as f:
                    existing_data = json.load(f)
            except Exception:
                existing_data = []
        
        existing_data.append(feedback_entry)
        with open(self.feedback_file, "w", encoding="utf-8") as f:
            json.dump(existing_data, f, indent=2)

        # 2. Add to active FAISS index for personalized re-ingestion
        if self.vector_store is not None:
            try:
                content = f"Creator Preferred Title: {request.selected_title}\nTopic: {request.topic}\nNiche: {request.niche}\nNotes: {request.notes or 'Selected by creator'}"
                metadata = {
                    "type": "creator_feedback",
                    "creator_id": request.creator_id,
                    "niche": request.niche,
                    "rating": request.rating,
                    "title": request.selected_title
                }
                doc = Document(page_content=content, metadata=metadata)
                self.vector_store.add_documents([doc])
                logger.info(f"Dynamically indexed creator feedback for {request.creator_id}")
            except Exception as idx_err:
                logger.warning(f"Could not add feedback directly to FAISS: {idx_err}")

        return FeedbackResponse(
            success=True,
            message=f"Feedback for '{request.selected_title}' successfully recorded for creator {request.creator_id}"
        )

    @staticmethod
    def _extract_json_data(text: str) -> Dict[str, Any]:
        """Extract clean JSON dictionary from LLM response"""
        text = text.strip()
        
        # Check markdown blocks
        if "```json" in text:
            start = text.find("```json") + 7
            end = text.find("```", start)
            if end != -1:
                text = text[start:end].strip()
        elif "```" in text:
            start = text.find("```") + 3
            end = text.find("```", start)
            if end != -1:
                text = text[start:end].strip()

        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1:
            json_str = text[start : end + 1]
            return json.loads(json_str)

        return json.loads(text)


# Global singleton instance
_rag_service_instance: Optional[RAGService] = None

def get_rag_service() -> RAGService:
    """Get or create singleton RAG service instance"""
    global _rag_service_instance
    if _rag_service_instance is None:
        _rag_service_instance = RAGService()
    return _rag_service_instance
