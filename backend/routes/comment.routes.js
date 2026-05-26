import { Router } from "express";
import {
  addComment,
  getVideoComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  validateAddComment,
  validateUpdateComment,
  validateCommentId,
  validatePagination,
} from "../middlewares/validation.middleware.js";

const router = Router();

// Public routes
router
  .route("/:videoId")
  .get(validateAddComment, validatePagination, getVideoComments);

// Protected routes
router.route("/:videoId").post(verifyJWT, validateAddComment, addComment);
router
  .route("/:commentId")
  .patch(verifyJWT, validateUpdateComment, updateComment);
router.route("/:commentId").delete(verifyJWT, validateCommentId, deleteComment);

export default router;
