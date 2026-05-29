import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (formData) =>
    api.post("/users/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  login: (email, password) => api.post("/users/login", { email, password }),

  logout: () => api.post("/users/logout"),

  refreshToken: () => api.post("/users/refresh-token"),

  getCurrentUser: () => api.get("/users/current-user"),

  getChannelProfile: (username) => api.get(`/users/c/${username}`),

  updateProfile: (data) => api.patch("/users/update-account", data),

  updateAvatar: (formData) =>
    api.patch("/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateCoverImage: (formData) =>
    api.patch("/users/cover-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  changePassword: (oldPassword, newPassword) =>
    api.post("/users/change-password", { oldPassword, newPassword }),
};

// Video API
export const videoAPI = {
  uploadVideo: (formData) =>
    api.post("/videos/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getVideos: (
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortType = "desc",
    userId = ""
  ) =>
    api.get("/videos", {
      params: { page, limit, sortBy, sortType, userId },
    }),

  getVideoById: (videoId) => api.get(`/videos/${videoId}`),

  updateVideo: (videoId, data) => api.patch(`/videos/${videoId}/update`, data),

  deleteVideo: (videoId) => api.delete(`/videos/${videoId}/delete`),

  togglePublish: (videoId) => api.patch(`/videos/${videoId}/toggle-publish`),

  getWatchHistory: () => api.get("/users/history"),
};

// Comment API
export const commentAPI = {
  addComment: (videoId, content) =>
    api.post(`/comments/${videoId}`, { content }),

  getComments: (videoId, page = 1, limit = 10) =>
    api.get(`/comments/${videoId}`, { params: { page, limit } }),

  updateComment: (commentId, content) =>
    api.patch(`/comments/${commentId}`, { content }),

  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};

// Like API
export const likeAPI = {
  toggleVideoLike: (videoId) => api.post(`/likes/toggle/video/${videoId}`),

  getVideoLikes: (videoId) => api.get(`/likes/video/${videoId}`),

  checkVideoLike: (videoId) => api.get(`/likes/video/${videoId}/check`),

  toggleTweetLike: (tweetId) => api.post(`/likes/toggle/tweet/${tweetId}`),

  getTweetLikes: (tweetId) => api.get(`/likes/tweet/${tweetId}`),

  checkTweetLike: (tweetId) => api.get(`/likes/tweet/${tweetId}/check`),
};

// Tweet API
export const tweetAPI = {
  createTweet: (content) => api.post("/tweets", { content }),

  getUserTweets: (userId, page = 1, limit = 10) =>
    api.get(`/tweets/user/${userId}`, { params: { page, limit } }),

  updateTweet: (tweetId, content) =>
    api.patch(`/tweets/${tweetId}`, { content }),

  deleteTweet: (tweetId) => api.delete(`/tweets/${tweetId}`),
};

// Subscription API
export const subscriptionAPI = {
  toggleSubscription: (channelId) =>
    api.post(`/subscriptions/toggle/${channelId}`),

  checkSubscription: (channelId) =>
    api.get(`/subscriptions/${channelId}/check`),

  getChannelSubscribers: (channelId, page = 1, limit = 10) =>
    api.get(`/subscriptions/${channelId}/subscribers`, {
      params: { page, limit },
    }),

  getSubscribedChannels: (subscriberId, page = 1, limit = 10) =>
    api.get(`/subscriptions/user/${subscriberId}`, { params: { page, limit } }),
};

// Playlist API
export const playlistAPI = {
  createPlaylist: (name, description) =>
    api.post("/playlists", { name, description }),

  getPlaylist: (playlistId) => api.get(`/playlists/${playlistId}`),

  getUserPlaylists: (userId, page = 1, limit = 10) =>
    api.get(`/playlists/user/${userId}`, { params: { page, limit } }),

  addVideoToPlaylist: (playlistId, videoId) =>
    api.post(`/playlists/${playlistId}/add/${videoId}`),

  removeVideoFromPlaylist: (playlistId, videoId) =>
    api.delete(`/playlists/${playlistId}/remove/${videoId}`),

  updatePlaylist: (playlistId, data) =>
    api.patch(`/playlists/${playlistId}`, data),

  deletePlaylist: (playlistId) => api.delete(`/playlists/${playlistId}`),
};

export default api;
