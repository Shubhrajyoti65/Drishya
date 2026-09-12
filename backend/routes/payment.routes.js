import { Router } from "express";
import {
  createOrder,
  verifyPayment,
  handleWebhook,
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protected payment endpoints
router.route("/create-order").post(verifyJWT, createOrder);
router.route("/verify").post(verifyJWT, verifyPayment);

// Razorpay Webhook endpoint (Public)
router.route("/webhook").post(handleWebhook);

export default router;
