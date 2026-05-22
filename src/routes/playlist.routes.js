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

const router = Router();

// Protected routes
router.route("/").post(verifyJWT, createPlaylist);

// Public routes
router.route("/:playlistId").get(getPlaylistById);
router.route("/user/:userId").get(getUserPlaylists);

// Protected routes
router.route("/:playlistId/add/:videoId").post(verifyJWT, addVideoToPlaylist);
router
  .route("/:playlistId/remove/:videoId")
  .delete(verifyJWT, removeVideoFromPlaylist);
router.route("/:playlistId").patch(verifyJWT, updatePlaylist);
router.route("/:playlistId").delete(verifyJWT, deletePlaylist);

export default router;
