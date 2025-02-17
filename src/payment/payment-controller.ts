import { Request, Response } from "express";
import { PaymentGW } from "./payment-types";
import orderModel from "../order/order-model";
import { PaymentStatus } from "../order/order-type";

// stripe listen --forward-to localhost:8000/api/order/payments/webhook

export class PaymentController {
  constructor(private paymentGw: PaymentGW) {}

  handleWebhook = async (req: Request, res: Response) => {
    const webhookBody = req.body;
    console.log("webhookBody", webhookBody);

    if (webhookBody.type === "checkout.session.completed") {
      const verifiedSession = await this.paymentGw.getSession(
        webhookBody.data.object.id,
      );

      const isPaymentSuccess = verifiedSession.paymentStatus === "paid";

      const updatedOrder = await orderModel.updateOne(
        {
          _id: verifiedSession.metadata.orderId,
        },
        {
          paymentStatus: isPaymentSuccess
            ? PaymentStatus.PAID
            : PaymentStatus.FAILED,
        },
        { new: true },
      );

      // TODO: SEND UPDATED ORDER DATA TO KAFKA BROKER
    }

    return res.json({ success: true });
  };
}
