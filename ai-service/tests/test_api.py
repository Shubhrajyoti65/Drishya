import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure ai-service root is in python path
service_root = Path(__file__).resolve().parent.parent
if str(service_root) not in sys.path:
    sys.path.insert(0, str(service_root))

from main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health_endpoint(client):
    """Test /health endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "healthy"
    assert "service" in data

def test_generate_endpoint_schema_and_validation(client):
    """Test POST /generate endpoint returns 5 titles, 3 thumbnails, 5 content ideas"""
    payload = {
        "creator_id": "creator_test",
        "niche": "Tech",
        "topic": "Mastering LangChain in 2026",
        "tone": "educational and energetic",
        "target_audience": "Developers"
    }
    
    response = client.post("/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data.get("success") is True
    
    # 5 Titles
    titles = data.get("titles", [])
    assert len(titles) == 5, f"Expected 5 titles, got {len(titles)}"
    assert all(isinstance(t, str) and len(t) > 3 for t in titles)
    
    # 3 Thumbnails with structured fields
    thumbnails = data.get("thumbnails", [])
    assert len(thumbnails) == 3, f"Expected 3 thumbnails, got {len(thumbnails)}"
    for thumb in thumbnails:
        assert "text_overlay" in thumb and len(thumb["text_overlay"]) > 0
        assert "visual_elements" in thumb and len(thumb["visual_elements"]) > 0
        assert "color_palette" in thumb and len(thumb["color_palette"]) > 0
        assert "layout_description" in thumb and len(thumb["layout_description"]) > 0
        
    # 5 Content Ideas with hooks and descriptions
    ideas = data.get("content_ideas", [])
    assert len(ideas) == 5, f"Expected 5 content ideas, got {len(ideas)}"
    for idea in ideas:
        assert "title" in idea and len(idea["title"]) > 0
        assert "hook" in idea and len(idea["hook"]) > 0
        assert "description" in idea and len(idea["description"]) > 0

def test_feedback_endpoint(client):
    """Test POST /feedback endpoint"""
    payload = {
        "creator_id": "creator_test",
        "niche": "Tech",
        "topic": "Mastering LangChain",
        "selected_title": "How to Master LangChain in 15 Minutes",
        "rating": 5,
        "notes": "Good actionable title"
    }
    
    response = client.post("/feedback", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data.get("success") is True
