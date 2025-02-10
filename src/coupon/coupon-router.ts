import express from "express";
import { CouponController } from "./coupon-controller";
import authenticate from "../common/middleware/authenticate";
import { asyncWrapper } from "../utils";
import { validateCoupon } from "./coupon-validator";

const router = express.Router();
const couponController = new CouponController();

// CREATE COUPON
router.post(
  "/",
  authenticate,
  validateCoupon,
  asyncWrapper(couponController.createCoupon),
);

export default router;
