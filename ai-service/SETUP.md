# Drishya AI Service Setup Guide

## Overview

The AI Service is a FastAPI-based microservice that provides AI-powered content generation for creators.

### Features

- **Video Title Generator** - Generate 5 SEO-optimized YouTube titles
- **Content Idea Generator** - Generate personalized content ideas
- **Thumbnail Suggestions** - Generate thumbnail design suggestions
- **RAG Pipeline** - Retrieval-Augmented Generation for personalized recommendations

### Architecture

```
ai-service/
├── main.py                    # FastAPI application entry point
├── requirements.txt           # Python dependencies
├── .env.example              # Environment variables template
├── services/
│   └── gemini_service.py     # Google Gemini API integration
├── routes/
│   └── generator_routes.py   # FastAPI routes
├── prompts/
│   └── prompts.py            # Prompt templates
├── rag/
│   └── rag_service.py        # RAG service with FAISS
└── generators/               # Custom generators (extensible)
```

### Setup Instructions

#### 1. Create Virtual Environment (Python 3.9+)

```bash
cd ai-service
python -m venv venv

# On Windows
venv\Scripts\activate

# On Linux/Mac
source venv/bin/activate
```

#### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

#### 3. Setup Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Gemini API key
# Get API key from: https://makersuite.google.com/app/apikey
```

#### 4. Run the Service

```bash
python main.py

# Or with uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

The service will be available at:

- **API**: http://localhost:8001
- **Docs**: http://localhost:8001/api/docs
- **ReDoc**: http://localhost:8001/api/redoc

### API Endpoints

#### 1. Generate Video Titles

```
POST /api/v1/generate/video-titles

Request:
{
  "topic": "Machine Learning for Beginners",
  "niche": "Technology",
  "target_audience": "Students and professionals"
}

Response:
{
  "success": true,
  "titles": [
    "7 Machine Learning Concepts Every Beginner Must Know",
    "From Zero to Hero: Start Your ML Journey Today",
    ...
  ],
  "message": "Video titles generated successfully"
}
```

#### 2. Generate Content Ideas

```
POST /api/v1/generate/content-ideas

Request:
{
  "niche": "Web Development",
  "previous_content": "React tutorials, Node.js backends, REST APIs",
  "target_audience": "Junior developers",
  "current_trends": "NextJS, TypeScript, Vercel deployment"
}

Response:
{
  "success": true,
  "ideas": [
    {
      "title": "Building Full-Stack Apps with Next.js",
      "description": "Create modern full-stack applications..."
    },
    ...
  ],
  "message": "Content ideas generated successfully"
}
```

#### 3. Generate Thumbnail Suggestions

```
POST /api/v1/generate/thumbnail-suggestions

Request:
{
  "topic": "Cryptocurrency Investment Strategies",
  "category": "Finance"
}

Response:
{
  "success": true,
  "suggestions": [
    {
      "text": "CRYPTO 101",
      "colors": ["#FF6B35", "#004E89", "#FFFFFF"],
      "layout": "Bold text top, chart graphic bottom-right"
    },
    ...
  ],
  "message": "Thumbnail suggestions generated successfully"
}
```

#### 4. Health Check

```
GET /api/v1/generate/health

Response:
{
  "success": true,
  "message": "AI service is running",
  "service": "Drishya AI Generator"
}
```

### Integration with Node.js Backend

From your Express backend, call the AI service:

```javascript
// Example in Node.js controller
async function generateVideoTitles(topic, niche, audience) {
  const response = await axios.post(
    "http://localhost:8001/api/v1/generate/video-titles",
    {
      topic,
      niche,
      target_audience: audience,
    }
  );
  return response.data.titles;
}
```

### Technology Stack

- **FastAPI** - Modern, fast web framework for building APIs
- **Google Generative AI (Gemini)** - LLM for content generation
- **FAISS** - Facebook AI Similarity Search for vector indexing
- **Sentence Transformers** - Pre-trained models for text embeddings
- **LangChain** - (Ready for integration) Framework for LLM applications
- **Pydantic** - Data validation and settings management

### Key Features

✅ Async/await for high performance  
✅ Validation of all inputs using Pydantic  
✅ Global exception handling  
✅ CORS enabled for frontend integration  
✅ Interactive API documentation (Swagger)  
✅ RAG pipeline for personalized recommendations  
✅ Extensible architecture for custom generators

### Performance Considerations

- **Caching**: Consider adding Redis for caching similar requests
- **Rate Limiting**: Implement rate limiting to protect the API
- **Async Processing**: Use Celery/RQ for long-running generation tasks
- **Load Balancing**: Deploy multiple instances behind a load balancer

### Troubleshooting

**Issue**: `GEMINI_API_KEY not found`

- Solution: Ensure .env file exists and contains valid API key

**Issue**: FAISS import error on Windows

- Solution: Use `faiss-cpu` instead of `faiss`, or use WSL

**Issue**: Module not found errors

- Solution: Ensure virtual environment is activated

### Future Enhancements

- [ ] Add caching layer (Redis)
- [ ] Implement rate limiting
- [ ] Add async task queue (Celery)
- [ ] Custom generator plugins
- [ ] Analytics and usage tracking
- [ ] User-specific model training
- [ ] Multi-language support

### Support & Documentation

- FastAPI Docs: https://fastapi.tiangolo.com/
- Gemini API: https://ai.google.dev/tutorials/python_quickstart
- FAISS: https://github.com/facebookresearch/faiss
