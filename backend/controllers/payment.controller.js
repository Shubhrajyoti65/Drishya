import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { MembershipTier } from "../models/membershipTier.model.js";
import { Membership } from "../models/membership.model.js";
import { PaymentLog } from "../models/paymentLog.model.js";
import { User } from "../models/user.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";

// Lazy initialization helper for Razorpay SDK
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_dummy_key_id";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "dummy_key_secret";
  return new Razorpay({
    key_id,
    key_secret,
  });
};

// Create a Razorpay Order for Membership Subscription
const createOrder = asyncHandler(async (req, res) => {
  const { creatorId, tierId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(creatorId) || !mongoose.Types.ObjectId.isValid(tierId)) {
    throw new ApiError(400, "Invalid creator ID or tier ID");
  }

  if (req.user._id.toString() === creatorId.toString()) {
    throw new ApiError(400, "You cannot join your own channel membership");
  }

  // Fetch creator and tier directly from database
  const creator = await User.findById(creatorId).select("username fullname avatar");
  if (!creator) {
    throw new ApiError(404, "Creator channel not found");
  }

  const tier = await MembershipTier.findOne({ _id: tierId, creator: creatorId, isActive: true });
  if (!tier) {
    throw new ApiError(404, "Active membership tier not found for this creator");
  }

  // Check for existing active membership for this creator
  const existingActiveMembership = await Membership.findOne({
    subscriber: req.user._id,
    creator: creatorId,
    status: "ACTIVE",
    expiryDate: { $gt: new Date() },
  });

  if (existingActiveMembership) {
    if (existingActiveMembership.tier.toString() === tierId.toString()) {
      throw new ApiError(400, "You already have an active membership for this tier");
    }
  }

  // Calculate amount in paise (1 INR = 100 paise)
  const amountInPaise = Math.round(tier.price * 100);
  const currency = "INR";
  const receipt = `mb_${req.user._id.toString().slice(-6)}_${Date.now()}`;

  let razorpayOrder;
  const razorpay = getRazorpayInstance();

  try {
    razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      notes: {
        subscriberId: req.user._id.toString(),
        creatorId: creatorId.toString(),
        tierId: tierId.toString(),
        tierName: tier.name,
      },
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    // Development fallback mock order if Razorpay credentials are test placeholders
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes("dummy")) {
      razorpayOrder = {
        id: `order_mock_${Date.now()}`,
        entity: "order",
        amount: amountInPaise,
        currency,
        receipt,
        status: "created",
      };
    } else {
      throw new ApiError(500, `Failed to create payment order: ${error.message}`);
    }
  }

  // Create or update pending membership record
  const membership = await Membership.create({
    subscriber: req.user._id,
    creator: creatorId,
    tier: tier._id,
    razorpayOrderId: razorpayOrder.id,
    amount: tier.price,
    currency,
    status: "PENDING",
    autoRenew: true,
  });

  // Log payment attempt
  await PaymentLog.create({
    subscriber: req.user._id,
    creator: creatorId,
    tier: tier._id,
    membership: membership._id,
    razorpayOrderId: razorpayOrder.id,
    amount: tier.price,
    currency,
    status: "CREATED",
    event: "order.created",
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orderId: razorpayOrder.id,
        amount: amountInPaise,
        currency,
        key: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy_key_id",
        membershipId: membership._id,
        tier: {
          _id: tier._id,
          name: tier.name,
          price: tier.price,
          color: tier.color,
          icon: tier.icon,
        },
        creator: {
          _id: creator._id,
          username: creator.username,
          fullname: creator.fullname,
          avatar: creator.avatar,
        },
      },
      "Payment order created successfully"
    )
  );
});

// Server-side Payment Signature Verification & Membership Activation
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, membershipId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id) {
    throw new ApiError(400, "Razorpay order ID and payment ID are required");
  }

  let membership;
  if (membershipId && mongoose.Types.ObjectId.isValid(membershipId)) {
    membership = await Membership.findById(membershipId);
  } else {
    membership = await Membership.findOne({ razorpayOrderId: razorpay_order_id });
  }

  if (!membership) {
    throw new ApiError(404, "Corresponding membership record not found");
  }

  // Ensure logged in user owns this payment request
  if (membership.subscriber.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized payment verification request");
  }

  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || "dummy_key_secret";
  const isMockMode = !process.env.RAZORPAY_KEY_SECRET || razorpaySecret.includes("dummy");

  let isValidSignature = false;

  if (isMockMode) {
    // In mock mode without live keys, signature check automatically succeeds for testing
    isValidSignature = true;
  } else {
    // HMAC-SHA256 Signature Verification
    const generatedSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    isValidSignature = crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(razorpay_signature || "")
    );
  }

  if (!isValidSignature) {
    // Mark payment log as failed
    await PaymentLog.create({
      subscriber: req.user._id,
      creator: membership.creator,
      tier: membership.tier,
      membership: membership._id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      amount: membership.amount,
      currency: membership.currency,
      status: "FAILED",
      event: "payment.signature_verification_failed",
    });

    membership.status = "PAYMENT_FAILED";
    await membership.save();

    throw new ApiError(400, "Invalid Razorpay payment signature");
  }

  // Calculate 30-day membership validity
  const startDate = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);

  // Deactivate any existing active memberships for this user & creator
  await Membership.updateMany(
    {
      subscriber: req.user._id,
      creator: membership.creator,
      _id: { $ne: membership._id },
      status: "ACTIVE",
    },
    { status: "EXPIRED" }
  );

  // Activate membership
  membership.status = "ACTIVE";
  membership.razorpayPaymentId = razorpay_payment_id;
  membership.startDate = startDate;
  membership.expiryDate = expiryDate;
  membership.autoRenew = true;
  await membership.save();

  // Log successful payment
  await PaymentLog.create({
    subscriber: req.user._id,
    creator: membership.creator,
    tier: membership.tier,
    membership: membership._id,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
    amount: membership.amount,
    currency: membership.currency,
    status: "SUCCESS",
    event: "payment.verified_and_activated",
  });

  const populatedMembership = await Membership.findById(membership._id)
    .populate("tier", "name price color icon benefits rank")
    .populate("creator", "username fullname avatar");

  return res.status(200).json(
    new ApiResponse(
      200,
      populatedMembership,
      "Payment verified and membership activated successfully!"
    )
  );
});

// Razorpay Webhook Handler (Idempotent)
const handleWebhook = asyncHandler(async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "dummy_webhook_secret";
  const signature = req.headers["x-razorpay-signature"];

  const rawBody = JSON.stringify(req.body);

  // Verify webhook signature if secret is provided
  if (process.env.RAZORPAY_WEBHOOK_SECRET) {
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new ApiError(400, "Invalid webhook signature");
    }
  }

  const event = req.body;
  const eventId = event.event_id || `${event.event}_${Date.now()}`;

  // Idempotency check: verify if event has already been processed
  const existingLog = await PaymentLog.findOne({ eventId });
  if (existingLog) {
    return res.status(200).json({ status: "already_processed", eventId });
  }

  const payload = event.payload || {};
  const paymentEntity = payload.payment?.entity;
  const orderId = paymentEntity?.order_id || payload.order?.entity?.id;

  if (orderId) {
    const membership = await Membership.findOne({ razorpayOrderId: orderId });
    if (membership) {
      if (event.event === "payment.captured" || event.event === "order.paid") {
        if (membership.status !== "ACTIVE") {
          const startDate = new Date();
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);

          membership.status = "ACTIVE";
          membership.razorpayPaymentId = paymentEntity?.id || membership.razorpayPaymentId;
          membership.startDate = startDate;
          membership.expiryDate = expiryDate;
          await membership.save();
        }
      } else if (event.event === "payment.failed") {
        membership.status = "PAYMENT_FAILED";
        await membership.save();
      } else if (event.event === "subscription.cancelled") {
        membership.status = "CANCELLED";
        membership.autoRenew = false;
        await membership.save();
      }

      await PaymentLog.create({
        eventId,
        subscriber: membership.subscriber,
        creator: membership.creator,
        tier: membership.tier,
        membership: membership._id,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentEntity?.id,
        amount: membership.amount,
        currency: membership.currency,
        status: event.event.includes("failed") ? "FAILED" : "SUCCESS",
        event: event.event,
        payload: event,
      });
    }
  }

  return res.status(200).json({ status: "success", eventId });
});

export { createOrder, verifyPayment, handleWebhook };
