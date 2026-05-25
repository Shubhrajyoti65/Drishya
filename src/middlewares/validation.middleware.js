import { body, param, query, validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    throw new ApiError(400, errorMessages.join(", "));
  }
  next();
};

// ============= USER VALIDATORS =============

export const validateUserRegister = [
  body("fullname")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2 })
    .withMessage("Full name must be at least 2 characters"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      "Username can only contain letters, numbers, underscores and hyphens"
    ),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  handleValidationErrors,
];

export const validateUserLogin = [
  body("email")
    .if(() => !body("username").exists())
    .optional()
    .isEmail()
    .withMessage("Please provide valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

export const validateChangePassword = [
  body("oldPassword").notEmpty().withMessage("Old password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
  handleValidationErrors,
];

export const validateUpdateAccount = [
  body("fullname")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Full name must be at least 2 characters"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email"),
  handleValidationErrors,
];

// ============= VIDEO VALIDATORS =============

export const validateVideoUpload = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Video title is required")
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Video description is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),
  handleValidationErrors,
];

export const validateVideoUpdate = [
  param("videoId").isMongoId().withMessage("Invalid video ID"),
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),
  handleValidationErrors,
];

export const validateVideoId = [
  param("videoId").isMongoId().withMessage("Invalid video ID"),
  handleValidationErrors,
];

export const validateVideoQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("sortBy")
    .optional()
    .isIn(["createdAt", "views", "duration"])
    .withMessage("Invalid sort field"),
  query("sortType")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort type must be asc or desc"),
  handleValidationErrors,
];

// ============= COMMENT VALIDATORS =============

export const validateAddComment = [
  param("videoId").isMongoId().withMessage("Invalid video ID"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment cannot be empty")
    .isLength({ min: 1, max: 500 })
    .withMessage("Comment must be between 1 and 500 characters"),
  handleValidationErrors,
];

export const validateUpdateComment = [
  param("commentId").isMongoId().withMessage("Invalid comment ID"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment cannot be empty")
    .isLength({ min: 1, max: 500 })
    .withMessage("Comment must be between 1 and 500 characters"),
  handleValidationErrors,
];

export const validateCommentId = [
  param("commentId").isMongoId().withMessage("Invalid comment ID"),
  handleValidationErrors,
];

export const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  handleValidationErrors,
];

// ============= LIKE VALIDATORS =============

export const validateLikeId = [
  param("videoId")
    .optional()
    .if(() => param("videoId").exists())
    .isMongoId()
    .withMessage("Invalid video ID"),
  param("tweetId")
    .optional()
    .if(() => param("tweetId").exists())
    .isMongoId()
    .withMessage("Invalid tweet ID"),
  handleValidationErrors,
];

// ============= TWEET VALIDATORS =============

export const validateCreateTweet = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Tweet content is required")
    .isLength({ min: 1, max: 280 })
    .withMessage("Tweet must be between 1 and 280 characters"),
  handleValidationErrors,
];

export const validateUpdateTweet = [
  param("tweetId").isMongoId().withMessage("Invalid tweet ID"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Tweet content is required")
    .isLength({ min: 1, max: 280 })
    .withMessage("Tweet must be between 1 and 280 characters"),
  handleValidationErrors,
];

export const validateTweetId = [
  param("tweetId").isMongoId().withMessage("Invalid tweet ID"),
  handleValidationErrors,
];

export const validateUserId = [
  param("userId").isMongoId().withMessage("Invalid user ID"),
  handleValidationErrors,
];

// ============= SUBSCRIPTION VALIDATORS =============

export const validateChannelId = [
  param("channelId").isMongoId().withMessage("Invalid channel ID"),
  handleValidationErrors,
];

export const validateSubscriberId = [
  param("subscriberId").isMongoId().withMessage("Invalid subscriber ID"),
  handleValidationErrors,
];

// ============= PLAYLIST VALIDATORS =============

export const validateCreatePlaylist = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Playlist name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Playlist name must be between 1 and 100 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Playlist description is required")
    .isLength({ min: 1, max: 500 })
    .withMessage("Playlist description must be between 1 and 500 characters"),
  handleValidationErrors,
];

export const validateUpdatePlaylist = [
  param("playlistId").isMongoId().withMessage("Invalid playlist ID"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Playlist name must be between 1 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Playlist description must be between 1 and 500 characters"),
  handleValidationErrors,
];

export const validatePlaylistId = [
  param("playlistId").isMongoId().withMessage("Invalid playlist ID"),
  handleValidationErrors,
];

export const validatePlaylistVideo = [
  param("playlistId").isMongoId().withMessage("Invalid playlist ID"),
  param("videoId").isMongoId().withMessage("Invalid video ID"),
  handleValidationErrors,
];
