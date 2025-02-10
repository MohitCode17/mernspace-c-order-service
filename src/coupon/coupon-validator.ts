import { body } from "express-validator";

export const validateCoupon = [
  body("title").notEmpty().withMessage("Title is required"),

  body("code")
    .notEmpty()
    .withMessage("Coupon code is required")
    .isString()
    .withMessage("Coupon code must be a string")
    .toUpperCase(),

  body("validUpto")
    .notEmpty()
    .withMessage("Valid Upto date is required")
    .isISO8601()
    .withMessage("Valid Upto must be a valid date.")
    .custom((value) => {
      const expiryDate = new Date(value);
      if (expiryDate < new Date()) {
        throw new Error("Valid Upto must be a future date.");
      }
      return true;
    }),

  body("discount")
    .notEmpty()
    .withMessage("Discount is required")
    .isNumeric()
    .withMessage("Discount must be a number")
    .isInt({ min: 1, max: 100 })
    .withMessage("Discount must be between 1 and 100"),

  body("tenantId")
    .notEmpty()
    .withMessage("Tenant ID is required")
    .isInt()
    .withMessage("Tenant ID must be a number"),
];
