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
