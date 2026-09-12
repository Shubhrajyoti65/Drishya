import mongoose, { Schema } from "mongoose";

const paymentLogSchema = new Schema(
  {
    eventId: {
      type: String,
      unique: true,
      sparse: true,
    },
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tier: {
      type: Schema.Types.ObjectId,
      ref: "MembershipTier",
      required: true,
    },
    membership: {
      type: Schema.Types.ObjectId,
      ref: "Membership",
    },
    razorpayOrderId: {
      type: String,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      index: true,
    },
    razorpaySignature: {
      type: String,
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
      enum: ["CREATED", "SUCCESS", "FAILED"],
      default: "CREATED",
    },
    event: {
      type: String,
      default: "payment.initiated",
    },
    payload: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export const PaymentLog = mongoose.model("PaymentLog", paymentLogSchema);
