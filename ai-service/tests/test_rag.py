import sys
from pathlib import Path

# Ensure ai-service root is in python path
service_root = Path(__file__).resolve().parent.parent
if str(service_root) not in sys.path:
    sys.path.insert(0, str(service_root))

from rag.rag_service import get_rag_service
from schemas import FeedbackRequest

def test_rag_retrieval_returns_results():
    """Test that RAG retriever retrieves relevant context documents"""
    rag_service = get_rag_service()
    
    # Test query
    docs = rag_service.retrieve_context(
        query="building high-performance machine learning models",
        niche="Science & Technology",
        creator_id="public",
        k=3
    )
    
    assert len(docs) > 0, "Retriever should return at least one document"
    first_doc = docs[0]
    assert hasattr(first_doc, "page_content") and len(first_doc.page_content) > 0
    assert hasattr(first_doc, "metadata")
    assert "type" in first_doc.metadata

def test_rag_feedback_storage_and_personalization():
    """Test that feedback endpoint successfully records and updates personalization"""
    rag_service = get_rag_service()
    
    fb_req = FeedbackRequest(
        creator_id="test_creator_999",
        niche="Education",
        topic="Python Data Structures",
        selected_title="Python Data Structures in 10 Minutes (Complete Guide)",
        rating=5,
        notes="High-paced tutorial"
    )
    
    fb_resp = rag_service.store_feedback(fb_req)
    assert fb_resp.success is True
    assert "test_creator_999" in fb_resp.message

def test_rag_graceful_fallback_without_index():
    """Test that retriever provides best practice fallback docs if vector store has no matches"""
    rag_service = get_rag_service()
    fallback_docs = rag_service._get_default_fallback_docs("Gaming", "speedrunning")
    
    assert len(fallback_docs) >= 3
    assert any("Formula" in d.page_content for d in fallback_docs)
    assert any(d.metadata.get("type") == "thumbnail" for d in fallback_docs)
