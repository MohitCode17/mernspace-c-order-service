import { Request, Response } from "express";
import { PaymentGW } from "./payment-types";
import orderModel from "../order/order-model";
import { OrderEvents, PaymentStatus } from "../order/order-type";
import { MessageBroker } from "../types/broker";
import customerModel from "../customer/customer-model";

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

      const customer = await customerModel.findOne({
        _id: updatedOrder.customerId,
      });

      // TODO: THINK ABOUT BROKER MESSAGE FAIL
      // KAFKA MESSAGE
      const brokerMessage = {
        event_type: OrderEvents.PAYMENT_STATUS_UPDATE,
        data: { ...updatedOrder.toObject(), customerId: customer },
      };

      await this.broker.sendMessage(
        "order",
        JSON.stringify(brokerMessage),
        updatedOrder._id.toString(),
      );
    }

    return res.json({ success: true });
  };
}
