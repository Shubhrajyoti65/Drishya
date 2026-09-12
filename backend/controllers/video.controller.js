import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Membership } from "../models/membership.model.js";
import { MembershipTier } from "../models/membershipTier.model.js";
import { Subscription } from "../models/subscription.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import fs from "fs";

const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description, visibility, minimumTier } = req.body;

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  const cleanupLocalFiles = () => {
    if (videoLocalPath && fs.existsSync(videoLocalPath)) {
      fs.unlinkSync(videoLocalPath);
    }
    if (thumbnailLocalPath && fs.existsSync(thumbnailLocalPath)) {
      fs.unlinkSync(thumbnailLocalPath);
    }
  };

  // Validate inputs
  if (!title?.trim() || !description?.trim()) {
    cleanupLocalFiles();
    throw new ApiError(400, "Title and description are required");
  }

  if (!videoLocalPath) {
    cleanupLocalFiles();
    throw new ApiError(400, "Video file is required");
  }

  if (!thumbnailLocalPath) {
    cleanupLocalFiles();
    throw new ApiError(400, "Thumbnail file is required");
  }

  const validVisibilities = ["PUBLIC", "MEMBERS_ONLY", "TIER_ONLY"];
  const videoVisibility = validVisibilities.includes(visibility) ? visibility : "PUBLIC";

  let tierId = null;
  if (videoVisibility === "TIER_ONLY" && minimumTier) {
    if (!mongoose.Types.ObjectId.isValid(minimumTier)) {
      cleanupLocalFiles();
      throw new ApiError(400, "Invalid minimum tier ID");
    }
    const tier = await MembershipTier.findById(minimumTier);
    if (!tier || tier.creator.toString() !== req.user._id.toString()) {
      cleanupLocalFiles();
      throw new ApiError(400, "Minimum tier does not belong to creator channel");
    }
    tierId = tier._id;
  }

  try {
    // Upload video to Cloudinary
    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const videoUrl = videoFile?.url || videoFile?.secure_url;
    if (!videoUrl) {
      cleanupLocalFiles();
      throw new ApiError(400, "Failed to upload video file");
    }

    // Upload thumbnail to Cloudinary
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    const thumbnailUrl = thumbnail?.url || thumbnail?.secure_url;
    if (!thumbnailUrl) {
      cleanupLocalFiles();
      throw new ApiError(400, "Failed to upload thumbnail");
    }

    // Create video document
    const video = await Video.create({
      title: title.trim(),
      description: description.trim(),
      videoFile: videoUrl,
      thumbnail: thumbnailUrl,
      duration: videoFile.duration || 0,
      owner: req.user._id,
      isPublished: true,
      visibility: videoVisibility,
      minimumTier: tierId,
    });

    const createdVideo = await Video.findById(video._id).populate("minimumTier", "name price rank color icon");

    return res
      .status(201)
      .json(new ApiResponse(201, createdVideo, "Video uploaded successfully"));
  } catch (error) {
    cleanupLocalFiles();
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
      $lookup: {
        from: "membershiptiers",
        localField: "minimumTier",
        foreignField: "_id",
        as: "minimumTier",
        pipeline: [
          {
            $project: {
              name: 1,
              price: 1,
              rank: 1,
              color: 1,
              icon: 1,
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
        minimumTier: {
          $first: "$minimumTier",
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

  const videoList = await Video.aggregate([
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
      $lookup: {
        from: "membershiptiers",
        localField: "minimumTier",
        foreignField: "_id",
        as: "minimumTier",
        pipeline: [
          {
            $project: {
              name: 1,
              price: 1,
              rank: 1,
              color: 1,
              icon: 1,
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
        minimumTier: {
          $first: "$minimumTier",
        },
      },
    },
  ]);

  if (!videoList.length) {
    throw new ApiError(404, "Video not found");
  }

  const video = videoList[0];

  // Exclusive Content Access Verification
  let isAuthorized = true;
  let accessReason = "Public video";

  const isOwner = req.user && req.user._id.toString() === video.owner._id.toString();

  if (!isOwner && (video.visibility === "MEMBERS_ONLY" || video.visibility === "TIER_ONLY")) {
    if (!req.user) {
      isAuthorized = false;
      accessReason = "Authentication required for members-only content";
    } else {
      // Find active membership for this creator
      const activeMembership = await Membership.findOne({
        subscriber: req.user._id,
        creator: video.owner._id,
        status: "ACTIVE",
        expiryDate: { $gt: new Date() },
      }).populate("tier");

      if (!activeMembership) {
        isAuthorized = false;
        accessReason = "Active channel membership required to watch this video";
      } else if (video.visibility === "TIER_ONLY" && video.minimumTier) {
        // Compare tier rank
        const userTierRank = activeMembership.tier?.rank || 1;
        const requiredTierRank = video.minimumTier?.rank || 1;

        if (userTierRank < requiredTierRank) {
          isAuthorized = false;
          accessReason = `Requires ${video.minimumTier.name} tier membership or higher`;
        }
      }
    }
  }

  // Obscure video file URL if user is unauthorized
  const videoData = { ...video, isAuthorized, accessReason };
  
  if (video.owner?._id) {
    const subscribersCount = await Subscription.countDocuments({ channel: video.owner._id });
    videoData.owner.subscribersCount = subscribersCount;
  }

  if (!isAuthorized) {
    videoData.videoFile = null; // Backend protection prevents streaming/downloading URL
  } else {
    // Unique view incrementing per user (1 view per user)
    if (req.user) {
      const alreadyViewed = await Video.findOne({
        _id: videoId,
        viewedBy: req.user._id,
      });

      if (!alreadyViewed) {
        await Video.findByIdAndUpdate(videoId, {
          $addToSet: { viewedBy: req.user._id },
          $inc: { views: 1 },
        });
        videoData.views = (video.views || 0) + 1;
      }

      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { watchHistory: videoId },
      });
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoData, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description, visibility, minimumTier } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
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
  if (visibility) {
    const validVisibilities = ["PUBLIC", "MEMBERS_ONLY", "TIER_ONLY"];
    if (validVisibilities.includes(visibility)) {
      updateData.visibility = visibility;
    }
  }
  if (minimumTier !== undefined) {
    if (!minimumTier) {
      updateData.minimumTier = null;
    } else if (mongoose.Types.ObjectId.isValid(minimumTier)) {
      updateData.minimumTier = minimumTier;
    }
  }

  if (req.file?.path) {
    const thumbnail = await uploadOnCloudinary(req.file.path);
    if (thumbnail?.url) {
      updateData.thumbnail = thumbnail.url;
    }
  }

  const updatedVideo = await Video.findByIdAndUpdate(videoId, updateData, {
    new: true,
  }).populate("minimumTier", "name price rank color icon");

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
