import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";

const router = express.Router();

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

/**
 * 1️⃣ CREATE ORDER
 */
router.post("/create-order", async (req, res) => {
  try {
    const { amount, bookingId } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100, // rupees → paise
      currency: "INR",
      receipt: `receipt_${bookingId}`,
    });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

/**
 * 2️⃣ VERIFY PAYMENT
 */
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // ✅ Payment verified (interview level)
      return res.json({
        success: true,
        message: "Payment verified",
        bookingId,
        paymentId: razorpay_payment_id,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

export default router;
