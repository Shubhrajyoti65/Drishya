import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  // Validate inputs
  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file is required");
  }

  try {
    // Upload video to Cloudinary
    const videoFile = await uploadOnCloudinary(videoLocalPath);
    if (!videoFile || !videoFile.url) {
      throw new ApiError(400, "Failed to upload video file");
    }

    // Upload thumbnail to Cloudinary
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail || !thumbnail.url) {
      throw new ApiError(400, "Failed to upload thumbnail");
    }

    // Create video document
    const video = await Video.create({
      title: title.trim(),
      description: description.trim(),
      videoFile: videoFile.url,
      thumbnail: thumbnail.url,
      duration: videoFile.duration || 0,
      owner: req.user._id,
      isPublished: true,
    });

    const createdVideo = await Video.findById(video._id);

    return res
      .status(201)
      .json(new ApiResponse(201, createdVideo, "Video uploaded successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Error uploading video");
  }
});

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;

  // Build match stage for filtering
  const matchStage = {
    isPublished: true,
  };

  if (userId) {
    matchStage.owner = new mongoose.Types.ObjectId(userId);
  }

  // Validate sortBy field
  const validSortFields = ["createdAt", "views", "duration"];
  const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sortOrder = sortType === "asc" ? 1 : -1;

  const videos = await Video.aggregate([
    {
      $match: matchStage,
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullname: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $sort: {
        [sortField]: sortOrder,
      },
    },
    {
      $skip: (pageNum - 1) * limitNum,
    },
    {
      $limit: limitNum,
    },
  ]);

  // Get total count for pagination
  const totalVideos = await Video.countDocuments(matchStage);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        docs: videos,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalVideos / limitNum),
          totalVideos,
          limit: limitNum,
        },
      },
      "Videos fetched successfully"
    )
  );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullname: 1,
              username: 1,
              avatar: 1,
              _id: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  if (!video.length) {
    throw new ApiError(404, "Video not found");
  }

  // Increment views
  await Video.findByIdAndUpdate(
    videoId,
    {
      $inc: {
        views: 1,
      },
    },
    { new: true }
  );

  // Add video to watch history
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: {
        watchHistory: videoId,
      },
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  if (!title?.trim() && !description?.trim()) {
    throw new ApiError(400, "At least one field is required to update");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check ownership
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  const updateData = {};
  if (title?.trim()) updateData.title = title.trim();
  if (description?.trim()) updateData.description = description.trim();

  const updatedVideo = await Video.findByIdAndUpdate(videoId, updateData, {
    new: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check ownership
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  // Delete from Cloudinary (optional, requires additional setup)
  // For now, just delete the document
  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check ownership
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to toggle publish status");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isPublished: video.isPublished },
        `Video ${video.isPublished ? "published" : "unpublished"} successfully`
      )
    );
});

export {
  uploadVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
