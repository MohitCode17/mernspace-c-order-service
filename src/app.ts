import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import config from "config";
import { globalErrorHandler } from "./common/middleware/globalErrorHandler";
import customerRouter from "./customer/customer-router";
import couponRouter from "./coupon/coupon-router";
import orderRouter from "./order/order-router";
import paymentRouter from "./payment/payment-route";

const app = express();

const ALLOWED_DOMAINS = [
  config.get("frontend.clientUI"),
  config.get("frontend.adminUI"),
];

app.use(
  cors({
    origin: ALLOWED_DOMAINS as string[],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from order service service!" });
});

app.use("/customer", customerRouter);
app.use("/coupon", couponRouter);
app.use("/orders", orderRouter);
app.use("/payments", paymentRouter);

app.use(globalErrorHandler);

export default app;
