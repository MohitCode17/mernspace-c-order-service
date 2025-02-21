import express from "express";
import { asyncWrapper } from "../utils";
import authenticate from "../common/middleware/authenticate";
import { OrderController } from "./order-controller";
import { StripeGW } from "../payment/stripe";
import { createMessageBroker } from "../common/factories/brokerFactory";

const router = express.Router();
const paymentGw = new StripeGW();
const broker = createMessageBroker();

const orderController = new OrderController(paymentGw, broker);

// CREAE ORDER ROUTER
router.post("/", authenticate, asyncWrapper(orderController.createOrder));

// GET ALL ORDER
router.get("/", authenticate, asyncWrapper(orderController.getAll));

// GET MY ORDERS
router.get("/mine", authenticate, asyncWrapper(orderController.getMine));

// GET SINGLE ORDER
router.get("/:orderId", authenticate, asyncWrapper(orderController.getSingle));

export default router;
