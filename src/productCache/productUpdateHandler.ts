import { ProductMessage } from "../types";
import productCacheModel from "./productCacheModel";

export const handleProductUpdate = async (value: string) => {
  // TODO: MAKE SURE TO WRAPE THIS PARSING IN TRY AND CATCH
  const product: ProductMessage = JSON.parse(value);

  return await productCacheModel.updateOne(
    {
      productId: product.id,
    },
    {
      $set: {
        priceConfiguration: product.priceConfiguration,
      },
    },
    {
      upsert: true, // When true, creates a new document if no document matches the query
    },
  );
};
