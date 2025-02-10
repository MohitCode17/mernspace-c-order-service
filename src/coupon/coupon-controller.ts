import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import Coupon from "./coupon-model";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";

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
}
