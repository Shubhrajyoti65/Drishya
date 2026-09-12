import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Membership } from "../models/membership.model.js";
import { PaymentLog } from "../models/paymentLog.model.js";
import mongoose from "mongoose";

// Get user's active and historical memberships
const getMyMemberships = asyncHandler(async (req, res) => {
  const memberships = await Membership.find({ subscriber: req.user._id })
    .populate({
      path: "creator",
      select: "username fullname avatar coverImage",
    })
    .populate({
      path: "tier",
      select: "name price description benefits rank color icon",
    })
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, memberships, "User memberships fetched successfully"));
});

// Get specific membership details
const getMembershipById = asyncHandler(async (req, res) => {
  const { membershipId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(membershipId)) {
    throw new ApiError(400, "Invalid membership ID");
  }

  const membership = await Membership.findById(membershipId)
    .populate("creator", "username fullname avatar coverImage")
    .populate("tier", "name price description benefits rank color icon");

  if (!membership) {
    throw new ApiError(404, "Membership not found");
  }

  // Check ownership
  if (
    membership.subscriber.toString() !== req.user._id.toString() &&
    membership.creator.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You are not authorized to view this membership");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, membership, "Membership details fetched successfully"));
});

// Cancel a membership (disables auto-renew and sets status to CANCELLED)
const cancelMembership = asyncHandler(async (req, res) => {
  const { membershipId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(membershipId)) {
    throw new ApiError(400, "Invalid membership ID");
  }

  const membership = await Membership.findById(membershipId);

  if (!membership) {
    throw new ApiError(404, "Membership not found");
  }

  if (membership.subscriber.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to cancel this membership");
  }

  membership.status = "CANCELLED";
  membership.autoRenew = false;
  await membership.save();

  const updatedMembership = await Membership.findById(membershipId)
    .populate("creator", "username fullname avatar")
    .populate("tier", "name price color icon");

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedMembership,
      "Membership cancelled successfully. Access remains active until the end of your billing cycle."
    )
  );
});

// Creator: Get list of active and past channel members
const getCreatorMembers = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;

  const query = { creator: req.user._id };

  if (status) {
    query.status = status;
  }

  const members = await Membership.find(query)
    .populate({
      path: "subscriber",
      select: "username fullname avatar email",
    })
    .populate({
      path: "tier",
      select: "name price rank color icon",
    })
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const totalMembers = await Membership.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        members,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalMembers / limitNum),
          totalMembers,
          limit: limitNum,
        },
      },
      "Creator members list fetched successfully"
    )
  );
});

// Creator: Get membership statistics and financial metrics using MongoDB aggregation
const getCreatorMembershipStats = asyncHandler(async (req, res) => {
  const creatorObjectId = new mongoose.Types.ObjectId(req.user._id);

  // Active members breakdown by tier & MRR calculation
  const activeMembersAgg = await Membership.aggregate([
    {
      $match: {
        creator: creatorObjectId,
        status: "ACTIVE",
        expiryDate: { $gt: new Date() },
      },
    },
    {
      $lookup: {
        from: "membershiptiers",
        localField: "tier",
        foreignField: "_id",
        as: "tierDetails",
      },
    },
    {
      $unwind: "$tierDetails",
    },
    {
      $group: {
        _id: "$tierDetails._id",
        tierName: { $first: "$tierDetails.name" },
        tierPrice: { $first: "$tierDetails.price" },
        tierColor: { $first: "$tierDetails.color" },
        memberCount: { $sum: 1 },
        tierRevenue: { $sum: "$amount" },
      },
    },
  ]);

  // Overall active members count & MRR
  let totalActiveMembers = 0;
  let monthlyRecurringRevenue = 0;

  activeMembersAgg.forEach((tierStat) => {
    totalActiveMembers += tierStat.memberCount;
    monthlyRecurringRevenue += tierStat.tierRevenue;
  });

  // Total cumulative revenue from payment logs
  const totalRevenueAgg = await PaymentLog.aggregate([
    {
      $match: {
        creator: creatorObjectId,
        status: "SUCCESS",
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
      },
    },
  ]);

  const totalRevenue = totalRevenueAgg.length ? totalRevenueAgg[0].totalRevenue : 0;

  // New members in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newMembersCount = await Membership.countDocuments({
    creator: creatorObjectId,
    startDate: { $gte: thirtyDaysAgo },
  });

  // Cancelled memberships count
  const cancelledMembersCount = await Membership.countDocuments({
    creator: creatorObjectId,
    status: "CANCELLED",
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalActiveMembers,
        monthlyRecurringRevenue,
        totalRevenue,
        newMembersThisMonth: newMembersCount,
        cancelledMembersCount,
        membersByTier: activeMembersAgg,
      },
      "Creator membership statistics fetched successfully"
    )
  );
});

export {
  getMyMemberships,
  getMembershipById,
  cancelMembership,
  getCreatorMembers,
  getCreatorMembershipStats,
};
