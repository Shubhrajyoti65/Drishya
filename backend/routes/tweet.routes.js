import { Router } from "express";
import {
  createTweet,
  getUserTweets,
  getAllTweets,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  validateCreateTweet,
  validateUpdateTweet,
  validateTweetId,
  validateUserId,
  validatePagination,
} from "../middlewares/validation.middleware.js";

const router = Router();

// Routes
router
  .route("/")
  .get(validatePagination, getAllTweets)
  .post(verifyJWT, validateCreateTweet, createTweet);

// Public route
router
  .route("/user/:userId")
  .get(validateUserId, validatePagination, getUserTweets);

// Protected routes
router.route("/:tweetId").patch(verifyJWT, validateUpdateTweet, updateTweet);
router.route("/:tweetId").delete(verifyJWT, validateTweetId, deleteTweet);

export default router;
