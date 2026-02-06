import { Request } from "express";
import { AuthenticatedRequest } from "./auth";

export type TypedRequest<
  P = unknown,
  B = unknown,
  Q = unknown,
> = AuthenticatedRequest & Request<P, any, B, Q>;
