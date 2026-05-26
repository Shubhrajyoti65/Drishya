import { Router } from "express";
import {
  toggleVideoLike,
  toggleTweetLike,
  getVideoLikes,
  getTweetLikes,
  isVideoLikedByUser,
  isTweetLikedByUser,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  validateVideoId,
  validateTweetId,
  validatePagination,
} from "../middlewares/validation.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Video likes
router.route("/toggle/video/:videoId").post(validateVideoId, toggleVideoLike);
router
  .route("/video/:videoId")
  .get(validateVideoId, validatePagination, getVideoLikes);
router.route("/video/:videoId/check").get(validateVideoId, isVideoLikedByUser);

// Tweet likes
router.route("/toggle/tweet/:tweetId").post(validateTweetId, toggleTweetLike);
router
  .route("/tweet/:tweetId")
  .get(validateTweetId, validatePagination, getTweetLikes);
router.route("/tweet/:tweetId/check").get(validateTweetId, isTweetLikedByUser);

export default router;
