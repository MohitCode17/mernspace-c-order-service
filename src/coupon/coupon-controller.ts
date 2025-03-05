import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import Coupon from "./coupon-model";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";

// TODO: ADD SERVICE LAYER FOR THIS CONTROLLER WITH DEPENDENCY INJECTION.

export class CouponController {
  createCoupon = async (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0].msg as string));
    }

    const { title, code, validUpto, discount, tenantId } = req.body;
    const { role, tenant: userTenant } = req.auth;

    // ROLE BASED AUTHENTICATION
    if (role !== "admin" && role !== "manager") {
      return next(createHttpError(401, "Access Denied"));
    }

    if (role === "manager" && tenantId !== userTenant) {
      return next(
        createHttpError(
          403,
          "Manager can only create coupon for their own tenant",
        ),
      );
    }

    const coupon = await Coupon.create({
      title,
      code: code.toUpperCase(),
      validUpto,
      discount,
      tenantId,
    });

    return res.status(201).json(coupon);
  };

  getCoupon = async (req: Request, res: Response, next: NextFunction) => {
    const { tenantId } = req.query;
    const { role, tenant: userTenant } = req.auth;

    // ROLE BASED AUTHENTICATION
    if (role !== "admin" && role !== "manager") {
      return next(createHttpError(401, "Access Denied"));
    }

    if (role === "manager" && Number(tenantId) !== userTenant) {
      return next(
        createHttpError(403, "Manager can access coupon for their own tenant"),
      );
    }
    const query = role === "admin" ? {} : { tenantId: Number(tenantId) };
    const coupons = await Coupon.find(query);
    return res.json(coupons);
  };

  verifyCoupon = async (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0].msg as string));
    }

    const { code, tenantId } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), tenantId });

    if (!coupon) {
      return next(createHttpError(400, "Coupon does not exists"));
    }

    // VALIDATE EXPIRY
    const currentDate = new Date();
    const couponDate = new Date(coupon.validUpto);

    if (currentDate >= couponDate) {
      return res.json({ valid: false, discount: 0 });
    }

    return res.json({ valid: true, discount: coupon.discount });
  };
}
