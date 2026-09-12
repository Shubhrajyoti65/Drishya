import { Router } from "express";
import {
  uploadVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js";
import {
  validateVideoUpload,
  validateVideoUpdate,
  validateVideoId,
  validateVideoQuery,
} from "../middlewares/validation.middleware.js";

const router = Router();

// Public / Optionally Authenticated routes
router.route("/").get(optionalVerifyJWT, validateVideoQuery, getAllVideos);
router.route("/:videoId").get(optionalVerifyJWT, validateVideoId, getVideoById);

// Protected routes (require authentication)
router.route("/upload").post(
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  validateVideoUpload,
  uploadVideo
);

router
  .route("/:videoId/update")
  .patch(verifyJWT, upload.single("thumbnail"), validateVideoUpdate, updateVideo);
router
  .route("/:videoId/delete")
  .delete(verifyJWT, validateVideoId, deleteVideo);
router
  .route("/:videoId/toggle-publish")
  .patch(verifyJWT, validateVideoId, togglePublishStatus);

export default router;
