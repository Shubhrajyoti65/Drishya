import os
import sys
import json
import asyncio
from pathlib import Path

# Add current directory to path
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from rag.rag_service import get_rag_service
from schemas import GenerateRequest

def run_retrieval_samples():
    print("\n" + "="*60)
    print("STEP 5.1: VERIFY RETRIEVAL (3 Sample Queries)")
    print("="*60)
    rag = get_rag_service()
    
    queries = [
        ("Building Autonomous AI Agents with LangChain", "Science & Technology"),
        ("Passive income strategies and dividend portfolio breakdown", "Finance & Business"),
        ("Fixing rounded shoulders and posture for software engineers", "Howto & Style")
    ]
    
    for i, (q, niche) in enumerate(queries, 1):
        print(f"\n--- [Query {i}] Topic: '{q}' | Niche: '{niche}' ---")
        docs = rag.retrieve_context(q, niche=niche, k=3)
        for j, doc in enumerate(docs, 1):
            doc_type = doc.metadata.get("type", "knowledge")
            title = doc.metadata.get("title", "N/A")
            cat = doc.metadata.get("category", "General")
            print(f"  Result #{j} [Type: {doc_type} | Category: {cat} | Title: {title}]")
            preview = doc.page_content.replace('\n', ' ')[:130]
            print(f"    Snippet: \"{preview}...\"\n")

async def run_generate_samples_async():
    print("\n" + "="*60)
    print("STEP 5.2: VERIFY POST /generate FOR 2 DIFFERENT NICHES")
    print("="*60)
    rag = get_rag_service()
    
    # Niche 1: Tech & AI
    req1 = GenerateRequest(
        creator_id="creator_tech_pro",
        niche="Tech & AI",
        topic="Building Autonomous Multi-Agent AI Systems with LangGraph",
        tone="enthusiastic, insightful and educational",
        target_audience="Software Engineers & AI Developers"
    )
    
    print("\n>>> Calling RAG Content Generation for Niche 1: Tech & AI...")
    resp1 = await rag.generate_content_rag(req1)
    print(f"Success: {resp1.success}")
    print(json.dumps(resp1.model_dump(), indent=2))
    
    # Niche 2: Personal Finance
    req2 = GenerateRequest(
        creator_id="creator_finance_101",
        niche="Personal Finance",
        topic="How I Built a $5,000/Month Dividend Portfolio from Scratch",
        tone="transparent, analytical and motivating",
        target_audience="Beginner Investors & Young Professionals"
    )
    
    print("\n>>> Calling RAG Content Generation for Niche 2: Personal Finance...")
    resp2 = await rag.generate_content_rag(req2)
    print(f"Success: {resp2.success}")
    print(json.dumps(resp2.model_dump(), indent=2))

if __name__ == "__main__":
    run_retrieval_samples()
    asyncio.run(run_generate_samples_async())
