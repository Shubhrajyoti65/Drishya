import { Router } from "express";
import {
  toggleSubscription,
  getChannelSubscribers,
  getSubscribedChannels,
  isSubscribed,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  validateChannelId,
  validateSubscriberId,
  validatePagination,
} from "../middlewares/validation.middleware.js";

const router = Router();

// Protected routes
router
  .route("/toggle/:channelId")
  .post(verifyJWT, validateChannelId, toggleSubscription);
router
  .route("/:channelId/check")
  .get(verifyJWT, validateChannelId, isSubscribed);

// Public routes
router
  .route("/:channelId/subscribers")
  .get(validateChannelId, validatePagination, getChannelSubscribers);
router
  .route("/user/:subscriberId")
  .get(validateSubscriberId, validatePagination, getSubscribedChannels);

export default router;
