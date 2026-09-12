import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { Membership } from "../models/membership.model.js";
import mongoose from "mongoose";

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const comment = await Comment.create({
    content: content.trim(),
    video: videoId,
    owner: req.user._id,
  });

  const createdComment = await Comment.findById(comment._id).populate({
    path: "owner",
    select: "username fullname avatar",
  });

  // Attach member badge info if user is an active member of the video creator channel
  const activeMembership = await Membership.findOne({
    subscriber: req.user._id,
    creator: video.owner,
    status: "ACTIVE",
    expiryDate: { $gt: new Date() },
  }).populate("tier", "name color icon rank");

  const commentObj = createdComment.toObject();
  if (activeMembership) {
    commentObj.owner.memberBadge = {
      isMember: true,
      tierName: activeMembership.tier?.name || "Member",
      color: activeMembership.tier?.color || "#3B82F6",
      icon: activeMembership.tier?.icon || "star",
      rank: activeMembership.tier?.rank || 1,
    };
  }

  return res
    .status(201)
    .json(new ApiResponse(201, commentObj, "Comment added successfully"));
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;

  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
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
              username: 1,
              fullname: 1,
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
        createdAt: -1,
      },
    },
    {
      $skip: (pageNum - 1) * limitNum,
    },
    {
      $limit: limitNum,
    },
  ]);

  // Lookup active memberships for all comment authors against the video owner
  const commenterIds = comments.map((c) => c.owner?._id).filter(Boolean);
  const activeMemberships = await Membership.find({
    subscriber: { $in: commenterIds },
    creator: video.owner,
    status: "ACTIVE",
    expiryDate: { $gt: new Date() },
  }).populate("tier", "name color icon rank");

  const membershipMap = new Map();
  activeMemberships.forEach((m) => {
    membershipMap.set(m.subscriber.toString(), {
      isMember: true,
      tierName: m.tier?.name || "Member",
      color: m.tier?.color || "#3B82F6",
      icon: m.tier?.icon || "star",
      rank: m.tier?.rank || 1,
    });
  });

  const commentsWithBadges = comments.map((comment) => {
    const subscriberId = comment.owner?._id?.toString();
    if (subscriberId && membershipMap.has(subscriberId)) {
      comment.owner.memberBadge = membershipMap.get(subscriberId);
    }
    return comment;
  });

  const totalComments = await Comment.countDocuments({ video: videoId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        comments: commentsWithBadges,
        docs: commentsWithBadges,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalComments / limitNum),
          totalComments,
          limit: limitNum,
        },
      },
      "Comments fetched successfully"
    )
  );
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Check ownership
  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this comment");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { content: content.trim() },
    { new: true }
  ).populate({
    path: "owner",
    select: "username fullname avatar",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Check ownership
  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { addComment, getVideoComments, updateComment, deleteComment };
