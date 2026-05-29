import { create } from "zustand";

export const useVideoStore = create((set) => ({
  videos: [],
  selectedVideo: null,
  loading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0 },

  setVideos: (videos) => set({ videos }),
  setSelectedVideo: (video) => set({ selectedVideo: video }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPagination: (pagination) => set({ pagination }),

  addVideo: (video) =>
    set((state) => ({
      videos: [video, ...state.videos],
    })),

  removeVideo: (videoId) =>
    set((state) => ({
      videos: state.videos.filter((v) => v._id !== videoId),
    })),

  updateVideo: (videoId, updatedData) =>
    set((state) => ({
      videos: state.videos.map((v) =>
        v._id === videoId ? { ...v, ...updatedData } : v
      ),
    })),

  clearError: () => set({ error: null }),
}));
