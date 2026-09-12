import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { MembershipTier } from "../models/membershipTier.model.js";
import mongoose from "mongoose";

// Create a new membership tier (Creator only)
const createTier = asyncHandler(async (req, res) => {
  const { name, price, description, benefits, rank, color, icon } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "Tier name is required");
  }

  const numericPrice = Number(price);
  if (isNaN(numericPrice) || numericPrice < 1) {
    throw new ApiError(400, "Monthly price must be at least ₹1");
  }

  // Calculate default rank if not provided
  let tierRank = Number(rank);
  if (isNaN(tierRank) || tierRank < 1) {
    const highestRankTier = await MembershipTier.findOne({ creator: req.user._id })
      .sort({ rank: -1 })
      .select("rank");
    tierRank = highestRankTier ? highestRankTier.rank + 1 : 1;
  }

  // Parse benefits array if sent as string
  let benefitsArray = benefits;
  if (typeof benefits === "string") {
    try {
      benefitsArray = JSON.parse(benefits);
    } catch (e) {
      benefitsArray = benefits.split(",").map((b) => b.trim()).filter(Boolean);
    }
  }

  const tier = await MembershipTier.create({
    creator: req.user._id,
    name: name.trim(),
    price: numericPrice,
    description: description?.trim() || "",
    benefits: Array.isArray(benefitsArray) ? benefitsArray : [],
    rank: tierRank,
    color: color?.trim() || "#3B82F6",
    icon: icon?.trim() || "star",
    isActive: true,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, tier, "Membership tier created successfully"));
});

// Get all active membership tiers for a creator (Public)
const getCreatorTiers = asyncHandler(async (req, res) => {
  const { creatorId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(creatorId)) {
    throw new ApiError(400, "Invalid creator ID");
  }

  const tiers = await MembershipTier.find({
    creator: creatorId,
    isActive: true,
  }).sort({ rank: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, tiers, "Membership tiers fetched successfully"));
});

// Update a membership tier (Creator only)
const updateTier = asyncHandler(async (req, res) => {
  const { tierId } = req.params;
  const { name, price, description, benefits, rank, color, icon, isActive } = req.body;

  if (!mongoose.Types.ObjectId.isValid(tierId)) {
    throw new ApiError(400, "Invalid tier ID");
  }

  const tier = await MembershipTier.findById(tierId);
  if (!tier) {
    throw new ApiError(404, "Membership tier not found");
  }

  if (tier.creator.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to edit this membership tier");
  }

  if (name?.trim()) tier.name = name.trim();
  if (price !== undefined) {
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 1) {
      throw new ApiError(400, "Monthly price must be at least ₹1");
    }
    tier.price = numericPrice;
  }
  if (description !== undefined) tier.description = description.trim();
  if (benefits !== undefined) {
    let benefitsArray = benefits;
    if (typeof benefits === "string") {
      try {
        benefitsArray = JSON.parse(benefits);
      } catch (e) {
        benefitsArray = benefits.split(",").map((b) => b.trim()).filter(Boolean);
      }
    }
    tier.benefits = Array.isArray(benefitsArray) ? benefitsArray : tier.benefits;
  }
  if (rank !== undefined && !isNaN(Number(rank))) tier.rank = Number(rank);
  if (color?.trim()) tier.color = color.trim();
  if (icon?.trim()) tier.icon = icon.trim();
  if (isActive !== undefined) tier.isActive = Boolean(isActive);

  await tier.save();

  return res
    .status(200)
    .json(new ApiResponse(200, tier, "Membership tier updated successfully"));
});

// Delete or deactivate a membership tier (Creator only)
const deleteTier = asyncHandler(async (req, res) => {
  const { tierId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tierId)) {
    throw new ApiError(400, "Invalid tier ID");
  }

  const tier = await MembershipTier.findById(tierId);
  if (!tier) {
    throw new ApiError(404, "Membership tier not found");
  }

  if (tier.creator.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this tier");
  }

  // Soft delete by setting isActive to false
  tier.isActive = false;
  await tier.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Membership tier deactivated successfully"));
});

// Reorder membership tiers (Creator only)
const reorderTiers = asyncHandler(async (req, res) => {
  const { tiers } = req.body; // Array of { _id, rank }

  if (!Array.isArray(tiers)) {
    throw new ApiError(400, "Tiers array is required for reordering");
  }

  const updatePromises = tiers.map(async (item) => {
    if (mongoose.Types.ObjectId.isValid(item._id) && !isNaN(Number(item.rank))) {
      await MembershipTier.findOneAndUpdate(
        { _id: item._id, creator: req.user._id },
        { rank: Number(item.rank) }
      );
    }
  });

  await Promise.all(updatePromises);

  const updatedTiers = await MembershipTier.find({
    creator: req.user._id,
    isActive: true,
  }).sort({ rank: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTiers, "Tiers reordered successfully"));
});

export {
  createTier,
  getCreatorTiers,
  updateTier,
  deleteTier,
  reorderTiers,
};
