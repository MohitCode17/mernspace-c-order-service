import { body } from "express-validator";

export const verifyCouponValidator = [
  body("code").trim().notEmpty().withMessage("Coupon code is required"),

  body("tenantId")
    .notEmpty()
    .withMessage("Tenant ID is required")
    .isNumeric()
    .withMessage("Tenant ID must be a number"),
];
