import express from "express";
import { PaymentController } from "./payment-controller";
import { StripeGW } from "./stripe";
import { asyncWrapper } from "../utils";
import { createMessageBroker } from "../common/factories/brokerFactory";

const router = express.Router();
const paymentGw = new StripeGW();
const broker = createMessageBroker();

const paymentController = new PaymentController(paymentGw, broker);

router.post("/webhook", asyncWrapper(paymentController.handleWebhook));

export default router;
