import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  if (channelId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const subscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (subscription) {
    // Unsubscribe
    await Subscription.deleteOne({
      subscriber: req.user._id,
      channel: channelId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully")
      );
  } else {
    // Subscribe
    await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, { subscribed: true }, "Subscribed successfully")
      );
  }
});

const getChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
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
        subscriber: {
          $first: "$subscriber",
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

  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        subscribers,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalSubscribers / limitNum),
          totalSubscribers,
          limit: limitNum,
        },
      },
      "Subscribers fetched successfully"
    )
  );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  const subscriber = await User.findById(subscriberId);
  if (!subscriber) {
    throw new ApiError(404, "User not found");
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;

  const channels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
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
        channel: {
          $first: "$channel",
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

  const totalSubscriptions = await Subscription.countDocuments({
    subscriber: subscriberId,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        channels,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalSubscriptions / limitNum),
          totalSubscriptions,
          limit: limitNum,
        },
      },
      "Subscribed channels fetched successfully"
    )
  );
});

const isSubscribed = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const subscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isSubscribed: !!subscription },
        "Subscription status checked"
      )
    );
});

export {
  toggleSubscription,
  getChannelSubscribers,
  getSubscribedChannels,
  isSubscribed,
};
