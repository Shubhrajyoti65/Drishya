import axios from "axios";

const AI_API_BASE_URL =
  import.meta.env.VITE_AI_API_URL || "http://localhost:8001/api/v1";

const aiAPI = axios.create({
  baseURL: AI_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const generatorAPI = {
  generateVideoTitles: (topic, niche, targetAudience) =>
    aiAPI.post("/generate/video-titles", {
      topic,
      niche,
      target_audience: targetAudience,
    }),

  generateContentIdeas: (
    niche,
    targetAudience,
    previousContent,
    currentTrends
  ) =>
    aiAPI.post("/generate/content-ideas", {
      niche,
      target_audience: targetAudience,
      previous_content: previousContent,
      current_trends: currentTrends,
    }),

  generateThumbnailSuggestions: (topic, category, mood) =>
    aiAPI.post("/generate/thumbnail-suggestions", {
      topic,
      category,
      mood,
    }),

  healthCheck: () => aiAPI.get("/generate/health"),
};

export default aiAPI;
