import express from "express";
import { PaymentController } from "./payment-controller";
import { StripeGW } from "./stripe";
import { asyncWrapper } from "../utils";

const router = express.Router();
const paymentGw = new StripeGW();
const paymentController = new PaymentController(paymentGw);

router.post("/webhook", asyncWrapper(paymentController.handleWebhook));

export default router;
