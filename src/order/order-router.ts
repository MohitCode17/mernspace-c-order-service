import express from "express";
import { asyncWrapper } from "../utils";
import authenticate from "../common/middleware/authenticate";
import { OrderController } from "./order-controller";
import { StripeGW } from "../payment/stripe";

const router = express.Router();
const paymentGw = new StripeGW();

const orderController = new OrderController(paymentGw);

// CREAE ORDER ROUTER
router.post("/", authenticate, asyncWrapper(orderController.createOrder));

export default router;
