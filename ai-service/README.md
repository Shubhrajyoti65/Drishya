# Drishya AI Creator Assistant — LangChain & FAISS RAG Service

Production-ready AI Creator Assistant and FastAPI service leveraging **LangChain**, **FAISS**, and **LLM APIs** to generate high-CTR video titles, visual thumbnail suggestions, and personalized content roadmaps with RAG-based context injection.

---

## 🌟 Architecture & Key Features

1. **RAG Workflow with FAISS**:
   - Persisted FAISS vector index loaded into memory once at application startup.
   - Embeddings powered locally by `sentence-transformers` (`all-MiniLM-L6-v2`) or configurable via environment variables.
   - Per-creator and category-based metadata filtering with graceful fallback.
2. **Context-Injected LangChain Prompting**:
   - `ChatPromptTemplate` dynamically injects top-performing video patterns, hook formulas, and thumbnail concepts into the LLM system context.
   - Built-in anti-plagiarism guidelines ensure the LLM adopts structural psychology without copying titles verbatim.
3. **Pydantic Validation**:
   - Strict output schema enforcing 5 titles, 3 structured thumbnail concepts (`text_overlay`, `visual_elements`, `color_palette`, `layout_description`), and 5 content ideas (`hook`, `description`, `target_format`).
4. **Creator Personalization & Feedback Loop**:
   - `POST /feedback` endpoint stores preferred titles and dynamically re-ingests them into the FAISS index.
5. **Real Dataset Ingestion**:
   - Offline ingestion pipeline (`scripts/ingest.py`) parses real trending YouTube datasets (`INvideos.csv` / `USvideos.csv`), category mappings, 25+ curated hook formulas, and 40+ thumbnail design patterns.

---

## 🚀 Quick Start Guide

### 1. Environment Setup
```bash
# Navigate to ai-service directory
cd ai-service

# Create and activate virtual environment (if not already created)
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure your API keys:
```bash
cp .env.example .env
```
Set your `GEMINI_API_KEY`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Ingestion Pipeline (Build FAISS Index)
```bash
python scripts/ingest.py
```
This will:
- Download the trending dataset if not present in `data/`.
- Filter top ~2000 videos per category by views.
- Bundle 25+ curated viral hook formulas and 40+ thumbnail design patterns.
- Chunk text with `RecursiveCharacterTextSplitter`.
- Build and save the FAISS vector index to `faiss_index/`.

### 4. Run the FastAPI Server
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Interactive API documentation will be available at: `http://localhost:8001/api/docs`.

---

## 📡 API Endpoints

### 1. Unified Content Generation (`POST /generate`)
**Request Body:**
```json
{
  "creator_id": "creator_123",
  "niche": "Tech & AI",
  "topic": "Building Autonomous AI Agents with LangChain",
  "tone": "enthusiastic and educational",
  "target_audience": "Software Developers"
}
```

**Response:**
```json
{
  "success": true,
  "titles": [
    "5 Autonomous AI Agent Frameworks You Need to Know (2026)",
    "How to Build AI Agents from Scratch in 15 Minutes",
    "Why LangChain AI Agents are Replacing Traditional Bots",
    "I Built an Autonomous AI Assistant (Here is What Happened)",
    "The Ultimate Guide to LangChain RAG in 2026"
  ],
  "thumbnails": [
    {
      "title": "Neon Hologram AI Agent Showcase",
      "text_overlay": "AGENTS ARE HERE",
      "visual_elements": "Creator looking shocked next to glowing futuristic hologram UI",
      "color_palette": "Neon Cyan & Dark Navy Obsidian",
      "layout_description": "Rule of thirds with subject on right and bold text on left"
    }
  ],
  "content_ideas": [
    {
      "title": "Zero to Hero: Autonomous AI Agent Tutorial",
      "hook": "Traditional bots are dead — here is how to build true autonomous agents in 2026.",
      "description": "Step-by-step masterclass covering state machines, tools, and memory.",
      "target_format": "Long-form YouTube Video"
    }
  ],
  "context_used": [
    "[formula] The Extreme Curiosity Gap Formula",
    "[thumbnail] The Glowing Graph of Exponential Growth"
  ],
  "message": "Successfully generated personalized content using LangChain RAG workflow"
}
```

### 2. Creator Feedback Loop (`POST /feedback`)
```json
{
  "creator_id": "creator_123",
  "niche": "Tech & AI",
  "topic": "Building Autonomous AI Agents",
  "selected_title": "How to Build AI Agents from Scratch in 15 Minutes",
  "rating": 5,
  "notes": "Fast-paced tutorial format"
}
```

### 3. Health Check (`GET /health`)
```json
{
  "status": "healthy",
  "service": "Drishya AI Creator Assistant",
  "rag_index_loaded": true
}
```

---

## 🧪 Running Automated Tests
```bash
pytest tests/ -v
```
