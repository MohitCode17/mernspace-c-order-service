import mongoose from "mongoose";
import { Coupon } from "./coupon-type";

const couponSchema = new mongoose.Schema<Coupon>(
  {
    title: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    validUpto: {
      type: Date,
      required: true,
    },
    tenantId: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

// Create index for faster lookup
couponSchema.index({ tenantId: 1, code: 1 }, { unique: true });

export default mongoose.model("Coupon", couponSchema);
