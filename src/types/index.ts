import { Request } from "express";

export type AuthCookie = {
  accessToken: string;
};

export interface AuthRequest extends Request {
  auth: {
    sub: string;
    role: string;
    id?: string;
    tenant: string;
  };
}

export interface ProductConfiguration {
  priceType: "base" | "aditional";
  availableOptions: {
    [key: string]: number;
  };
}

export interface ProductPricingCache {
  productId: string;
  priceConfiguration: ProductConfiguration;
}

export interface ProductMessage {
  id: string;
  priceConfiguration: ProductConfiguration;
}

export interface ToppingPriceCache {
  toppingId: string;
  price: number;
  tenantId: string;
}

export interface ToppingMessage {
  id: string;
  price: number;
  tenantId: string;
}

export interface ProductPriceConfiguration {
  [key: string]: {
    priceType: "base" | "aditional";
    availableOptions: {
      [key: string]: number;
    };
  };
}

export type Product = {
  _id: string;
  name: string;
  image: string;
  description: string;
  priceConfiguration: ProductPriceConfiguration;
};

export type Topping = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export interface CartItem
  extends Pick<Product, "_id" | "name" | "image" | "priceConfiguration"> {
  chosenConfiguration: {
    priceConfiguration: {
      [key: string]: string;
    };
    selectedToppings: Topping[];
  };
  qty: number;
}

export enum ROLES {
  ADMIN = "admin",
  MANAGER = "manager",
  CUSTOMER = "customer",
}
