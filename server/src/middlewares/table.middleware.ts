import { NextFunction, Response } from "express";
import { TypedRequest } from "../types/request";
import { verifyTableToken } from "../utils/jwt";

export function verifyTable(
  req: TypedRequest,
  res: Response,
  next: NextFunction,
) {
  const tableHeader = req.headers["x-table-token"] as string;
  if (!tableHeader) {
    return res.status(401).json({ message: "Table session token invalid" });
  }

  try {
    const payload = verifyTableToken(tableHeader);
    req.table = {
      id: payload.id,
      number: payload.number,
      restaurantId: payload.restaurantId,
    };

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired table session token" });
  }
}
