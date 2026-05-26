import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const like = await Like.findOne({
    video: videoId,
    likeBy: req.user._id,
  });

  if (like) {
    // Unlike
    await Like.deleteOne({
      video: videoId,
      likeBy: req.user._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { liked: false }, "Video unliked"));
  } else {
    // Like
    await Like.create({
      video: videoId,
      likeBy: req.user._id,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, { liked: true }, "Video liked"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  const like = await Like.findOne({
    tweet: tweetId,
    likeBy: req.user._id,
  });

  if (like) {
    // Unlike
    await Like.deleteOne({
      tweet: tweetId,
      likeBy: req.user._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { liked: false }, "Tweet unliked"));
  } else {
    // Like
    await Like.create({
      tweet: tweetId,
      likeBy: req.user._id,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, { liked: true }, "Tweet liked"));
  }
});

const getVideoLikes = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const likes = await Like.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "likeBy",
        foreignField: "_id",
        as: "likeBy",
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
        likeBy: {
          $first: "$likeBy",
        },
      },
    },
  ]);

  const likeCount = likes.length;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        likes,
        likeCount,
      },
      "Video likes fetched successfully"
    )
  );
});

const getTweetLikes = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  const likes = await Like.aggregate([
    {
      $match: {
        tweet: new mongoose.Types.ObjectId(tweetId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "likeBy",
        foreignField: "_id",
        as: "likeBy",
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
        likeBy: {
          $first: "$likeBy",
        },
      },
    },
  ]);

  const likeCount = likes.length;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        likes,
        likeCount,
      },
      "Tweet likes fetched successfully"
    )
  );
});

const isVideoLikedByUser = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const like = await Like.findOne({
    video: videoId,
    likeBy: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked: !!like }, "Like status checked"));
});

const isTweetLikedByUser = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const like = await Like.findOne({
    tweet: tweetId,
    likeBy: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked: !!like }, "Like status checked"));
});

export {
  toggleVideoLike,
  toggleTweetLike,
  getVideoLikes,
  getTweetLikes,
  isVideoLikedByUser,
  isTweetLikedByUser,
};
