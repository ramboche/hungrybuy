import { Request } from "express";
import { AuthenticatedRequest } from "./auth";

export interface TableContext {
  id: string;
  number: number;
  restaurantId: string;
}

interface Restaurant {
  id: string;
  name: string;
  isActive: boolean;
}

export type TypedRequest<
  P = unknown,
  B = unknown,
  Q = unknown,
> = AuthenticatedRequest &
  Request<P, any, B, Q> & {
    restaurant?: Restaurant;
  } & {
    table?: TableContext;
  };
