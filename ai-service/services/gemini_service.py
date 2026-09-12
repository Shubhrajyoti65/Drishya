import json
import os
import asyncio
import google.generativeai as genai
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)


class GeminiAIService:
    """Service for interacting with Google Gemini API"""

    def __init__(self):
        """Initialize Gemini AI with API key from environment"""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        genai.configure(api_key=api_key)
        self.primary_model = genai.GenerativeModel("gemini-2.5-flash")
        self.fallback_model = genai.GenerativeModel("gemini-3.5-flash-lite")

    async def _generate_with_fallback(self, prompt: str) -> str:
        """Generate content using primary model without blocking event loop, with automatic fallback"""
        try:
            response = await asyncio.wait_for(
                asyncio.to_thread(self.primary_model.generate_content, prompt),
                timeout=3.5
            )
            return response.text
        except Exception as e:
            logger.warning(f"Primary Gemini model failed or timed out ({str(e)}). Attempting fallback model gemini-2.5-flash-lite...")
            try:
                response = await asyncio.wait_for(
                    asyncio.to_thread(self.fallback_model.generate_content, prompt),
                    timeout=3.5
                )
                return response.text
            except Exception as fallback_err:
                logger.error(f"Fallback model also failed: {str(fallback_err)}")
                raise fallback_err

    async def generate_video_titles(
        self,
        topic: str,
        niche: str,
        target_audience: str,
    ) -> List[str]:
        """
        Generate 5 optimized video titles using Gemini AI
        
        Args:
            topic: Video topic/subject
            niche: Creator's niche/category
            target_audience: Target audience description
            
        Returns:
            List of 5 generated video titles
        """
        try:
            from prompts.prompts import VIDEO_TITLE_SYSTEM_PROMPT, VIDEO_TITLE_USER_TEMPLATE

            audience = target_audience or "General YouTube Audience"
            user_message = VIDEO_TITLE_USER_TEMPLATE.format(
                topic=topic,
                niche=niche,
                target_audience=audience,
            )

            prompt = f"{VIDEO_TITLE_SYSTEM_PROMPT}\n\n{user_message}"

            response_text = await self._generate_with_fallback(prompt)

            # Parse JSON response
            json_str = self._extract_json(response_text)
            data = json.loads(json_str)

            titles = data.get("titles", [])
            return titles[:5]  # Return top 5 titles

        except Exception as e:
            logger.error(f"Error generating video titles: {str(e)}")
            logger.info("Returning topic-customized fallback template titles.")
            aud = target_audience or "Viewers"
            return [
                f"Mastering {topic}: The Complete Guide for {aud}",
                f"10 Essential Things You MUST Know About {topic}",
                f"How to Get Started with {topic} ({niche}) - Step-by-Step",
                f"The Ultimate Strategy for {topic} in 2026",
                f"Why Every {aud} Needs to Learn {topic} Today"
            ]

    async def generate_content_ideas(
        self,
        niche: str,
        previous_content: str,
        target_audience: str,
        current_trends: str = "",
    ) -> List[Dict]:
        """
        Generate 5 personalized content ideas using Gemini AI
        
        Args:
            niche: Creator's niche
            previous_content: Brief description of previous videos
            target_audience: Target audience description
            current_trends: Current trending topics (optional)
            
        Returns:
            List of 5 content ideas with title and description
        """
        try:
            from prompts.prompts import (
                CONTENT_IDEA_SYSTEM_PROMPT,
                CONTENT_IDEA_USER_TEMPLATE,
            )

            prev_content = previous_content or "Brand new channel, no previous content uploaded yet"
            audience = target_audience or "General audience interested in this niche"
            trends = current_trends or "Popular topics in tech and entertainment"

            user_message = CONTENT_IDEA_USER_TEMPLATE.format(
                niche=niche,
                previous_content=prev_content,
                target_audience=audience,
                current_trends=trends,
            )

            prompt = f"{CONTENT_IDEA_SYSTEM_PROMPT}\n\n{user_message}"

            response_text = await self._generate_with_fallback(prompt)

            # Parse JSON response
            json_str = self._extract_json(response_text)
            data = json.loads(json_str)

            ideas = data.get("ideas", [])
            return ideas[:5]  # Return top 5 ideas

        except Exception as e:
            logger.error(f"Error generating content ideas: {str(e)}")
            logger.info("Returning niche-customized fallback template content ideas.")
            aud = target_audience or "your audience"
            return [
                {
                    "title": f"Complete Beginner's Roadmap to {niche}",
                    "description": f"A comprehensive step-by-step breakdown covering essential {niche} principles tailored for {aud}."
                },
                {
                    "title": f"5 Major Mistakes to Avoid in {niche}",
                    "description": f"Identify key errors and actionable strategies to help {aud} succeed faster in {niche}."
                },
                {
                    "title": f"Deep Dive: Top Trends and Tools in {niche} for 2026",
                    "description": f"An insightful analysis of the latest tools and industry shifts every {niche} creator should know."
                },
                {
                    "title": f"Hands-On Masterclass: Building a Real-World {niche} Project",
                    "description": f"A practical walkthrough demonstrating how to take ideas from concept to completion."
                },
                {
                    "title": f"The Future of {niche}: What's Next?",
                    "description": f"Forward-looking predictions and expert insights into upcoming developments in {niche}."
                }
            ]

    async def generate_thumbnail_suggestions(
        self,
        topic: str,
        category: str,
    ) -> List[Dict]:
        """
        Generate 3 thumbnail design suggestions using Gemini AI
        
        Args:
            topic: Video topic
            category: Video category
            
        Returns:
            List of 3 thumbnail suggestions with text, colors, and layout
        """
        try:
            from prompts.prompts import (
                THUMBNAIL_SYSTEM_PROMPT,
                THUMBNAIL_USER_TEMPLATE,
            )

            user_message = THUMBNAIL_USER_TEMPLATE.format(
                topic=topic,
                category=category,
            )

            prompt = f"{THUMBNAIL_SYSTEM_PROMPT}\n\n{user_message}"

            response_text = await self._generate_with_fallback(prompt)

            # Parse JSON response
            json_str = self._extract_json(response_text)
            data = json.loads(json_str)

            suggestions = data.get("suggestions", [])
            return suggestions[:3]  # Return top 3 suggestions

        except Exception as e:
            logger.error(f"Error generating thumbnail suggestions: {str(e)}")
            logger.info("Returning category-customized fallback thumbnail suggestions.")
            return [
                {
                    "text": f"MASTER {topic.upper()} NOW!",
                    "colors": "Bold Neon Blue & Dark Navy background",
                    "layout": "High-contrast text on left, close-up subject visual on right"
                },
                {
                    "text": "THE SECRET REVEALED",
                    "colors": "Vibrant Yellow text on Dark Purple gradient",
                    "layout": "Centered bold typography with dynamic background element"
                },
                {
                    "text": f"STOP DOING THIS ({category})",
                    "colors": "Bright Red warning banner with White text",
                    "layout": "Split-screen comparison layout with directional arrow"
                }
            ]

    @staticmethod
    def _extract_json(text: str) -> str:
        """
        Extract JSON from text response
        Handles cases where JSON is wrapped in markdown code blocks
        """
        # Try to find JSON in markdown code blocks
        if "```json" in text:
            start = text.find("```json") + 7
            end = text.find("```", start)
            if end != -1:
                return text[start:end].strip()
        elif "```" in text:
            start = text.find("```") + 3
            end = text.find("```", start)
            if end != -1:
                return text[start:end].strip()

        # Try to find JSON directly
        start = text.find("{")
        if start != -1:
            # Find matching closing brace
            count = 0
            for i, char in enumerate(text[start:], start):
                if char == "{":
                    count += 1
                elif char == "}":
                    count -= 1
                    if count == 0:
                        return text[start : i + 1]

        return text
