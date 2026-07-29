import os
import logging
import urllib.parse
import fal_client

logger = logging.getLogger(__name__)

class FalAIService:
    def __init__(self):
        # fal-client automatically reads FAL_KEY from the environment
        self.api_key = os.getenv("FAL_KEY") or os.getenv("FAL_API_KEY")
        if not self.api_key:
            logger.warning("FAL_KEY or FAL_API_KEY environment variable not set. Will use free FLUX engine fallback.")
        else:
            # Ensure it is set in os.environ for the client
            os.environ["FAL_KEY"] = self.api_key

    def generate_thumbnail_image(self, topic: str, category: str, mood: str = None) -> str:
        """
        Generate a YouTube thumbnail image using fal.ai (FLUX.1 [dev]) or free FLUX fallback.
        
        Args:
            topic: Video topic
            category: Video niche/category
            mood: Video tone/mood (optional)
            
        Returns:
            The URL of the generated image.
        """
        mood_str = f" with a {mood} mood" if mood else ""
        prompt = (
            f"A high-quality, professional YouTube thumbnail design for a video on the topic: '{topic}' "
            f"in the '{category}' category{mood_str}. Modern layout, eye-catching bold typography, "
            f"vibrant colors, clean graphics, photorealistic, 8k resolution, cinematic lighting, "
            f"aspect ratio 16:9, designed to increase click-through rate."
        )
        
        # Try Fal.ai first if API key is set
        if self.api_key:
            try:
                logger.info(f"Generating image on Fal.ai with prompt: {prompt}")
                result = fal_client.subscribe(
                    "fal-ai/flux/dev",
                    arguments={
                        "prompt": prompt,
                        "image_size": "landscape_16_9",
                        "num_inference_steps": 28,
                        "guidance_scale": 3.5,
                        "sync_mode": True
                    }
                )
                
                images = result.get("images", [])
                if images and images[0].get("url"):
                    image_url = images[0].get("url")
                    logger.info(f"Fal.ai Image generated successfully: {image_url}")
                    return image_url
            except Exception as e:
                logger.warning(f"Fal.ai generation failed ({str(e)}). Falling back to free FLUX image generator...")

        # Fallback: Free FLUX Image Engine via Pollinations.ai (No key, no balance limits required)
        logger.info("Generating thumbnail image using free FLUX engine...")
        encoded_prompt = urllib.parse.quote(prompt)
        free_flux_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1280&height=720&model=flux&nologo=true"
        return free_flux_url
