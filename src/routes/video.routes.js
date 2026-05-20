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
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllVideos);
router.route("/:videoId").get(getVideoById);

// Protected routes (require authentication)
router.route("/upload").post(
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadVideo
);

router.route("/:videoId/update").patch(verifyJWT, updateVideo);
router.route("/:videoId/delete").delete(verifyJWT, deleteVideo);
router.route("/:videoId/toggle-publish").patch(verifyJWT, togglePublishStatus);

export default router;
