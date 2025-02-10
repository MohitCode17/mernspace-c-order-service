import express from "express";
import { CouponController } from "./coupon-controller";
import authenticate from "../common/middleware/authenticate";
import { asyncWrapper } from "../utils";
import { createValidCoupon } from "./create-coupon-validator";
import { verifyCouponValidator } from "./verify-coupon-validator";

const router = express.Router();
const couponController = new CouponController();

// CREATE COUPON
router.post(
  "/",
  authenticate,
  createValidCoupon,
  asyncWrapper(couponController.createCoupon),
);

// VERIFY COUPON
router.post(
  "/verify",
  authenticate,
  verifyCouponValidator,
  asyncWrapper(couponController.verifyCoupon),
);

export default router;
