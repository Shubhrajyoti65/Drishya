import { Router } from "express";
import {
  createTier,
  getCreatorTiers,
  updateTier,
  deleteTier,
  reorderTiers,
} from "../controllers/membershipTier.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public route to fetch creator's active membership tiers
router.route("/creator/:creatorId").get(getCreatorTiers);

// Protected creator routes
router.route("/").post(verifyJWT, createTier);
router.route("/reorder").patch(verifyJWT, reorderTiers);
router.route("/:tierId").put(verifyJWT, updateTier).delete(verifyJWT, deleteTier);

export default router;
