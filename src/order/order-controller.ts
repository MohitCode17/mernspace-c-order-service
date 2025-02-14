import { Request, Response } from "express";
import {
  CartItem,
  ProductPricingCache,
  Topping,
  ToppingPriceCache,
} from "../types";
import productCacheModel from "../productCache/productCacheModel";
import toppingCacheModel from "../toppingCache/toppingCacheModel";
import couponModel from "../coupon/coupon-model";

export class OrderController {
  createOrder = async (req: Request, res: Response) => {
    // TODO: VALIDATE REQUEST DATA
    const totalPrice = await this.calculateTotal(req.body.cart);

    // CALCULATE DISCOUNT
    let discountPercentage = 0;
    const couponCode = req.body.couponCode;
    const tenantId = req.body.tenantId;

    if (couponCode) {
      discountPercentage = await this.getDiscountPercentage(
        couponCode,
        tenantId,
      );
    }

    const discountAmount = Math.round((totalPrice * discountPercentage) / 100);

    const priceAfterDiscount = totalPrice - discountAmount;
    // CALCULATE TAXES
    // TODO: MAY BE STORE IN DB FOR EACH TENANT
    const TAXES_PERCENT = 18;

    const taxes = Math.round((priceAfterDiscount * TAXES_PERCENT) / 100);

    return res.json({ taxes });
  };

  private calculateTotal = async (cart: CartItem[]) => {
    // GET THE PRODUCT IDS FROM CART
    const productIds = cart.map((item) => item._id);

    // TODO: ADD ERROR HANDLING
    const productPricings = await productCacheModel.find({
      productId: {
        $in: productIds,
      },
    });

    // TODO: WHAT WILL HAPPEN IF PRODUCT DOES NOT EXISTS IN THE CACHE
    // 1. CALL CATALOG SERVICE HERE.
    // 2. USE PRICE FROM CART -> BAD IDEA

    // GET THE TOPPINGS IDS FROM THE CART
    const cartToppingIds = cart.reduce((acc, item) => {
      return [
        ...acc,
        ...item.chosenConfiguration.selectedToppings.map(
          (topping) => topping.id,
        ),
      ];
    }, []);

    // TODO: ADD ERROR HANDLING
    const toppingPricings = await toppingCacheModel.find({
      toppingId: {
        $in: cartToppingIds,
      },
    });

    const totalPrice = cart.reduce((acc, curr) => {
      const cachedProductPrice = productPricings.find(
        (product) => product.productId === curr._id,
      );

      return (
        acc +
        curr.qty * this.getItemTotal(curr, cachedProductPrice, toppingPricings)
      );
    }, 0);

    return totalPrice;
  };

  private getItemTotal = (
    item: CartItem,
    cachedProductPrice: ProductPricingCache,
    toppingsPricings: ToppingPriceCache[],
  ) => {
    const toppingsTotal = item.chosenConfiguration.selectedToppings.reduce(
      (acc, curr) => {
        return acc + this.getCurrentToppingPrice(curr, toppingsPricings);
      },
      0,
    );

    const productTotal = Object.entries(
      item.chosenConfiguration.priceConfiguration,
    ).reduce((acc, [key, value]) => {
      const price =
        cachedProductPrice.priceConfiguration[key].availableOptions[value];
      return acc + price;
    }, 0);

    return productTotal + toppingsTotal;
  };

  private getCurrentToppingPrice = (
    topping: Topping,
    toppingPricings: ToppingPriceCache[],
  ) => {
    const currentTopping = toppingPricings.find(
      (current) => topping.id === current.toppingId,
    );

    if (!currentTopping) {
      // TODO: MAKE SURE THE ITEM IS IN THE CACHE ELSE, MAYBE CALL CATALOG SERVICE
      return topping.price;
    }

    return currentTopping.price;
  };

  private getDiscountPercentage = async (
    couponCode: string,
    tenantId: string,
  ) => {
    const code = await couponModel.findOne({ code: couponCode, tenantId });

    if (!code) {
      return 0;
    }

    const currentDate = new Date();
    const couponDate = new Date(code.validUpto);

    if (currentDate <= couponDate) {
      return code.discount;
    }

    return 0;
  };
}
