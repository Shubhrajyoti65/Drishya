import { Router } from "express";
import {
  toggleSubscription,
  getChannelSubscribers,
  getSubscribedChannels,
  isSubscribed,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protected routes
router.route("/toggle/:channelId").post(verifyJWT, toggleSubscription);
router.route("/:channelId/check").get(verifyJWT, isSubscribed);

// Public routes
router.route("/:channelId/subscribers").get(getChannelSubscribers);
router.route("/user/:subscriberId").get(getSubscribedChannels);

export default router;
