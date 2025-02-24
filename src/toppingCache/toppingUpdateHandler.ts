import { ToppingMessage } from "../types";
import toppingCacheModel from "./toppingCacheModel";

export const handleToppingUpdate = async (value: string) => {
  // TODO: ADD TRY AND CATCH WRAPPER WHILE PARSING THIS
  const topping: ToppingMessage = JSON.parse(value);

  return await toppingCacheModel.updateOne(
    {
      toppingId: topping.data.id,
    },
    {
      $set: {
        price: topping.data.price,
        tenantId: topping.data.tenantId,
      },
    },
    {
      upsert: true,
    },
  );
};
