import { NextFunction, Request, Response } from "express";
import {
  CartItem,
  ProductPricingCache,
  Topping,
  ToppingPriceCache,
} from "../types";
import productCacheModel from "../productCache/productCacheModel";
import toppingCacheModel from "../toppingCache/toppingCacheModel";
import couponModel from "../coupon/coupon-model";
import orderModel from "./order-model";
import { OrderStatus, PaymentMode, PaymentStatus } from "./order-type";
import mongoose from "mongoose";
import idempotencyModel from "../idempotency/idempotency-model";
import createHttpError from "http-errors";
import { PaymentGW } from "../payment/payment-types";
import { MessageBroker } from "../types/broker";

export class OrderController {
  constructor(
    private paymentGw: PaymentGW,
    private broker: MessageBroker,
  ) {}

  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    // TODO: VALIDATE REQUEST DATA
    const {
      cart,
      couponCode,
      tenantId,
      paymentMode,
      customerId,
      comment,
      address,
    } = req.body;

    // CALCULATE THE TOTAL PRICE OF PRODUCT IN THE CART
    const totalPrice = await this.calculateTotal(cart);

    // CALCULATE DISCOUNT
    let discountPercentage = 0;

    if (couponCode) {
      discountPercentage = await this.getDiscountPercentage(
        couponCode,
        tenantId,
      );
    }

    const discountAmount = Math.round((totalPrice * discountPercentage) / 100);

    // PRICE AFTER DISCOUNT AVAILED
    const priceAfterDiscount = totalPrice - discountAmount;

    // CALCULATE TAXES
    // TODO: MAY BE STORE IN DB FOR EACH TENANT
    const TAXES_PERCENT = 18;

    const taxes = Math.round((priceAfterDiscount * TAXES_PERCENT) / 100);

    // CALCULATE DELIVERY CHARGES
    const DELIVERY_CHARGES = 50;

    const finalTotal = priceAfterDiscount + taxes + DELIVERY_CHARGES;

    // GET IDEMPOTENCY KEY FROM HEADERS
    const idempotencyKey = req.headers["idempotency-key"];

    const idempotency = await idempotencyModel.findOne({ key: idempotencyKey });

    let newOrder = idempotency ? [idempotency.response] : [];

    if (!idempotency) {
      // CREATE A NEW ORDER IF NO IDEMPOTENCY KEY IS EXISTS.

      // USING DATABASE TRANSACTION
      const session = await mongoose.startSession();
      await session.startTransaction();

      try {
        newOrder = await orderModel.create(
          [
            {
              cart,
              address,
              comment,
              customerId,
              deliveryCharges: DELIVERY_CHARGES,
              discount: discountAmount,
              taxes,
              tenantId,
              total: finalTotal,
              paymentMode,
              orderStatus: OrderStatus.RECEIVED,
              paymentStatus: PaymentStatus.PENDING,
            },
          ],
          { session },
        );

        await idempotencyModel.create(
          [{ key: idempotencyKey, response: newOrder[0] }],
          { session },
        );

        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        await session.endSession();

        return next(createHttpError(500, err.message));
      } finally {
        await session.endSession();
      }
    }

    // PAYMENT PROCESSING
    if (paymentMode === PaymentMode.CARD) {
      const session = await this.paymentGw.createSession({
        amount: finalTotal,
        orderId: newOrder[0]._id.toString(),
        tenantId: tenantId,
        currency: "inr",
        idempotencyKey: idempotencyKey as string,
      });

      await this.broker.sendMessage("order", JSON.stringify(newOrder));

      return res.json({ paymentUrl: session.paymentUrl });
    }

    // SEND MESSAGE TO BROKER
    await this.broker.sendMessage("order", JSON.stringify(newOrder));

    return res.json({ paymentUrl: null }); // COD
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
