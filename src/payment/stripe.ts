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
