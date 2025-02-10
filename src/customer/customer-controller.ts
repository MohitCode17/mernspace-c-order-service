import { Response } from "express";
import { Request } from "express-jwt";
import Customer from "./customer-model";

export class CustomerController {
  getCustomer = async (req: Request, res: Response) => {
    const { sub: userId, firstName, lastName, email } = req.auth;

    // TODO: ADD SERVICE LAYER
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
      // TODO: ADD LOGGER
      // console.log("New customer created", newCustomer);

      return res.status(201).json(newCustomer);
    }

    // TODO: ADD LOGGER
    // console.log("Existing customer", customer);
    return res.status(200).json(customer);
  };

  addAddresses = async (req: Request, res: Response) => {
    const { sub: userId } = req.auth;

    // TODO: ADD SERVICE LAYER
    const customer = await Customer.findOneAndUpdate(
      {
        _id: req.params.id,
        userId,
      },
      {
        $push: {
          addresses: {
            text: req.body.address,
            // TODO: IMPLEMENT IN FUUTURE
            isDefault: false,
          },
        },
      },
      {
        new: true,
      },
    );

    // TODO: ADD LOGGER

    return res.json(200).json(customer);
  };
}
