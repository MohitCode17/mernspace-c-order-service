import express from "express";
import { asyncWrapper } from "../utils";
import authenticate from "../common/middleware/authenticate";
import { OrderController } from "./order-controller";

const router = express.Router();
const orderController = new OrderController();

// CREAE ORDER ROUTER
router.post("/", authenticate, asyncWrapper(orderController.createOrder));

export default router;
