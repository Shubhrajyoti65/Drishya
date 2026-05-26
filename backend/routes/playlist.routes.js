import { Router } from "express";
import {
  createPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getPlaylistById,
  getUserPlaylists,
  updatePlaylist,
  deletePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  validateCreatePlaylist,
  validateUpdatePlaylist,
  validatePlaylistId,
  validatePlaylistVideo,
  validateUserId,
  validatePagination,
} from "../middlewares/validation.middleware.js";

const router = Router();

// Protected routes
router.route("/").post(verifyJWT, validateCreatePlaylist, createPlaylist);

// Public routes
router.route("/:playlistId").get(validatePlaylistId, getPlaylistById);
router
  .route("/user/:userId")
  .get(validateUserId, validatePagination, getUserPlaylists);

// Protected routes
router
  .route("/:playlistId/add/:videoId")
  .post(verifyJWT, validatePlaylistVideo, addVideoToPlaylist);
router
  .route("/:playlistId/remove/:videoId")
  .delete(verifyJWT, validatePlaylistVideo, removeVideoFromPlaylist);
router
  .route("/:playlistId")
  .patch(verifyJWT, validateUpdatePlaylist, updatePlaylist);
router
  .route("/:playlistId")
  .delete(verifyJWT, validatePlaylistId, deletePlaylist);

export default router;
