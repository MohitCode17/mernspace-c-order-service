import { Request, Response } from "express";
import { PaymentGW } from "./payment-types";
import orderModel from "../order/order-model";
import { PaymentStatus } from "../order/order-type";
import { MessageBroker } from "../types/broker";

// stripe listen --forward-to localhost:8000/api/order/payments/webhook

export class PaymentController {
  constructor(
    private paymentGw: PaymentGW,
    private broker: MessageBroker,
  ) {}

  handleWebhook = async (req: Request, res: Response) => {
    const webhookBody = req.body;

    if (webhookBody.type === "checkout.session.completed") {
      const verifiedSession = await this.paymentGw.getSession(
        webhookBody.data.object.id,
      );

      const isPaymentSuccess = verifiedSession.paymentStatus === "paid";

      const updatedOrder = await orderModel.findOneAndUpdate(
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

      // TODO: THINK ABOUT BROKER MESSAGE FAIL
      await this.broker.sendMessage("order", JSON.stringify(updatedOrder));
    }

    return res.json({ success: true });
  };
}
