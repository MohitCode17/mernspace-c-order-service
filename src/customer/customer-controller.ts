import { Response } from "express";
import { Request } from "express-jwt";
import Customer from "./customer-model";

export class CustomerController {
  getCustomer = async (req: Request, res: Response) => {
    const { sub: userId, firstName, lastName, email } = req.auth;

    const customer = await Customer.findOne({ userId });

    if (!customer) {
      const newCustomer = new Customer({
        userId,
        firstName,
        lastName,
        email,
        addresses: [],
      });

      await newCustomer.save();
      console.log("New customer created", newCustomer);

      return res.status(201).json(newCustomer);
    }

    console.log("Existing customer", customer);
    return res.status(200).json(customer);
  };
}
