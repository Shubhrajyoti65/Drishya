import mongoose, { Schema } from "mongoose";

const membershipSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tier: {
      type: Schema.Types.ObjectId,
      ref: "MembershipTier",
      required: true,
    },
    razorpayCustomerId: {
      type: String,
      default: "",
    },
    razorpayOrderId: {
      type: String,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      index: true,
    },
    razorpaySubscriptionId: {
      type: String,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "CANCELLED", "EXPIRED", "PAYMENT_FAILED", "PENDING"],
      default: "PENDING",
      index: true,
    },
    startDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

membershipSchema.index({ subscriber: 1, creator: 1 });
membershipSchema.index({ expiryDate: 1, status: 1 });

export const Membership = mongoose.model("Membership", membershipSchema);
