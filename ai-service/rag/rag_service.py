import os
import json
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
import logging
from typing import List, Dict, Tuple

logger = logging.getLogger(__name__)


class RAGService:
    """
    RAG (Retrieval-Augmented Generation) Service
    Uses FAISS for vector similarity search and Sentence Transformers for embeddings
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize RAG service with embedding model
        
        Args:
            model_name: Sentence Transformer model name
        """
        self.embedding_model = SentenceTransformer(model_name)
        self.index = None
        self.documents = []
        self.metadata = []
        self.embedding_dim = self.embedding_model.get_sentence_embedding_dimension()

    def add_documents(self, documents: List[Dict]) -> None:
        """
        Add documents to the RAG index
        
        Args:
            documents: List of documents with 'content' and optional 'metadata'
        """
        try:
            contents = []
            for doc in documents:
                if isinstance(doc, dict):
                    contents.append(doc.get("content", ""))
                    self.metadata.append(doc.get("metadata", {}))
                else:
                    contents.append(str(doc))
                    self.metadata.append({})

            # Generate embeddings
            embeddings = self.embedding_model.encode(contents, show_progress_bar=True)
            embeddings = np.array(embeddings).astype("float32")

            # Create FAISS index
            self.index = faiss.IndexFlatL2(self.embedding_dim)
            self.index.add(embeddings)

            self.documents = contents
            logger.info(f"Added {len(documents)} documents to RAG index")

        except Exception as e:
            logger.error(f"Error adding documents to RAG: {str(e)}")
            raise

    def search(self, query: str, k: int = 5) -> List[Tuple[str, float]]:
        """
        Search for relevant documents using vector similarity
        
        Args:
            query: Search query
            k: Number of top results to return
            
        Returns:
            List of tuples (document, similarity_score)
        """
        try:
            if self.index is None:
                logger.warning("RAG index not initialized")
                return []

            # Encode query
            query_embedding = self.embedding_model.encode(query)
            query_embedding = np.array([query_embedding]).astype("float32")

            # Search
            distances, indices = self.index.search(query_embedding, min(k, len(self.documents)))

            results = []
            for idx, distance in zip(indices[0], distances[0]):
                if 0 <= idx < len(self.documents):
                    # Convert L2 distance to similarity score (0-1)
                    similarity = 1 / (1 + distance)
                    results.append((self.documents[idx], similarity, self.metadata[idx]))

            return results

        except Exception as e:
            logger.error(f"Error searching RAG: {str(e)}")
            raise

    def load_creator_knowledge_base(self, creator_id: str, creator_data: Dict) -> None:
        """
        Load creator-specific knowledge base for personalized recommendations
        
        Args:
            creator_id: Creator ID
            creator_data: Dict containing creator's previous videos, interests, niche
        """
        try:
            documents = []

            # Add creator's niche
            if "niche" in creator_data:
                documents.append({
                    "content": f"Creator niche: {creator_data['niche']}",
                    "metadata": {"type": "niche", "creator_id": creator_id}
                })

            # Add previous video titles and descriptions
            if "previous_videos" in creator_data:
                for video in creator_data["previous_videos"][:20]:  # Last 20 videos
                    content = f"{video.get('title', '')} {video.get('description', '')}"
                    documents.append({
                        "content": content,
                        "metadata": {
                            "type": "previous_video",
                            "video_id": video.get("id"),
                            "creator_id": creator_id
                        }
                    })

            # Add audience interests
            if "audience_interests" in creator_data:
                for interest in creator_data["audience_interests"]:
                    documents.append({
                        "content": f"Audience interest: {interest}",
                        "metadata": {"type": "audience_interest", "creator_id": creator_id}
                    })

            if documents:
                self.add_documents(documents)
                logger.info(f"Loaded knowledge base for creator {creator_id}")

        except Exception as e:
            logger.error(f"Error loading creator knowledge base: {str(e)}")
            raise

    def get_personalized_recommendations(
        self,
        query: str,
        creator_id: str,
        num_recommendations: int = 5
    ) -> List[Dict]:
        """
        Get personalized recommendations based on creator's knowledge base
        
        Args:
            query: Query or topic
            creator_id: Creator ID
            num_recommendations: Number of recommendations to return
            
        Returns:
            List of personalized recommendations
        """
        try:
            results = self.search(query, k=num_recommendations * 2)

            # Filter results for this creator and format
            recommendations = []
            for content, similarity, metadata in results:
                if metadata.get("creator_id") == creator_id and similarity > 0.3:
                    recommendations.append({
                        "content": content,
                        "similarity_score": float(similarity),
                        "type": metadata.get("type")
                    })

                if len(recommendations) >= num_recommendations:
                    break

            return recommendations

        except Exception as e:
            logger.error(f"Error getting personalized recommendations: {str(e)}")
            raise

    def save_index(self, filepath: str) -> None:
        """Save FAISS index to disk"""
        try:
            if self.index is not None:
                faiss.write_index(self.index, filepath)
                # Save documents and metadata
                metadata_path = filepath + ".metadata.json"
                with open(metadata_path, "w") as f:
                    json.dump({
                        "documents": self.documents,
                        "metadata": self.metadata
                    }, f)
                logger.info(f"Saved RAG index to {filepath}")
        except Exception as e:
            logger.error(f"Error saving RAG index: {str(e)}")

    def load_index(self, filepath: str) -> None:
        """Load FAISS index from disk"""
        try:
            if os.path.exists(filepath):
                self.index = faiss.read_index(filepath)
                # Load documents and metadata
                metadata_path = filepath + ".metadata.json"
                if os.path.exists(metadata_path):
                    with open(metadata_path, "r") as f:
                        data = json.load(f)
                        self.documents = data.get("documents", [])
                        self.metadata = data.get("metadata", [])
                logger.info(f"Loaded RAG index from {filepath}")
        except Exception as e:
            logger.error(f"Error loading RAG index: {str(e)}")
