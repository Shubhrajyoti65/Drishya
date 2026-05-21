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

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Video likes
router.route("/toggle/video/:videoId").post(toggleVideoLike);
router.route("/video/:videoId").get(getVideoLikes);
router.route("/video/:videoId/check").get(isVideoLikedByUser);

// Tweet likes
router.route("/toggle/tweet/:tweetId").post(toggleTweetLike);
router.route("/tweet/:tweetId").get(getTweetLikes);
router.route("/tweet/:tweetId/check").get(isTweetLikedByUser);

export default router;
