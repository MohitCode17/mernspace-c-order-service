import Stripe from "stripe";
import config from "config";

import { PaymentGW, PaymentOptions } from "./payment-types";

export class StripeGW implements PaymentGW {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(config.get("stripe.secretKey"));
  }

  async createSession(options: PaymentOptions) {
    // CREATE SESSION
    const session = await this.stripe.checkout.sessions.create(
      {
        metadata: {
          orderId: options.orderId,
        },
        billing_address_collection: "required",
        // TODO: WE'LL CAPTURE STRUCTURED ADDRESS FROM FRONTEND THEN IMPLMENTN THIS FEATURE
        // payment_intent_data: {
        //   shipping: {
        //     name: "Rohit Sharma",
        //     address: {
        //       line1: "New Lane",
        //       city: "Mumbai",
        //       country: "India",
        //       postal_code: "1178774",
        //     },
        //   },
        // },
        line_items: [
          {
            price_data: {
              unit_amount: options.amount * 100,
              product_data: {
                name: "Online Pizza Order",
                description: "Total amount to be paid",
                images: ["https://placehold.jp/150x150.png"],
              },
              currency: options.currency || "inr",
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `http://localhost:3000/payment?success=true&orderId=${options.orderId}`,
        cancel_url: `http://localhost:3000/payment?success=false&orderId=${options.orderId}`,
      },
      { idempotencyKey: options.idempotencyKey },
    );

    return {
      id: session.id,
      paymentUrl: session.url,
      paymentStatus: session.payment_status,
    };
  }

  async getSession() {
    return null;
  }
}
