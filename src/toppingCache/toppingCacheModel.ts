import mongoose from "mongoose";
import { ToppingPriceCache } from "../types";

const toppingCacheSchema = new mongoose.Schema<ToppingPriceCache>(
  {
    tenantId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    toppingId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

toppingCacheSchema.index({ toppingId: 1 }, { unique: true });

export default mongoose.model(
  "ToppingPricingCache",
  toppingCacheSchema,
  "toppingCache",
);
