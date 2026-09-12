import mongoose, { Schema } from "mongoose";

const membershipTierSchema = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: [1, "Price must be at least ₹1"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    benefits: [
      {
        type: String,
        trim: true,
      },
    ],
    rank: {
      type: Number,
      required: true,
      default: 1, // 1 = Bronze, 2 = Silver, 3 = Gold, etc.
    },
    color: {
      type: String,
      default: "#3B82F6", // Default hex color
    },
    icon: {
      type: String,
      default: "star", // star, shield, crown, etc.
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

membershipTierSchema.index({ creator: 1, rank: 1 });

export const MembershipTier = mongoose.model(
  "MembershipTier",
  membershipTierSchema
);
