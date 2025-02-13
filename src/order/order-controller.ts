import { Request, Response } from "express";

export class OrderController {
  createOrder = async (req: Request, res: Response) => {
    res.json({ success: true });
  };
}
