import { Router } from "express";
import {
  getMyMemberships,
  getMembershipById,
  cancelMembership,
  getCreatorMembers,
  getCreatorMembershipStats,
} from "../controllers/membership.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// User membership routes
router.route("/my-memberships").get(verifyJWT, getMyMemberships);
router.route("/:membershipId").get(verifyJWT, getMembershipById);
router.route("/:membershipId/cancel").patch(verifyJWT, cancelMembership);

// Creator membership dashboard routes
router.route("/creator/members").get(verifyJWT, getCreatorMembers);
router.route("/creator/stats").get(verifyJWT, getCreatorMembershipStats);

export default router;
