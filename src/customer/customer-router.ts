import express from "express";
import { asyncWrapper } from "../utils";
import { CustomerController } from "./customer-controller";
import authenticate from "../common/middleware/authenticate";

const router = express.Router();
const customerController = new CustomerController();

// GET CUSTOMER
router.get("/", authenticate, asyncWrapper(customerController.getCustomer));

export default router;
