import { Router } from "express";
import {
  getAllOrders,
  createOrder,
  updateOrderStatus,
  getActiveOrders,
} from "../controllers/order.controller";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  ActiveOrdersParams,
  CreateOrderParams,
  UpdateOrderParams,
  UpdateOrderStatusBody,
} from "../validation/order.schema";

const router = Router();

router.get("/all", requireRole(["ADMIN", "SHOP"]), getAllOrders);

router.patch(
  "/:orderId",
  requireRole(["ADMIN", "SHOP"]),
  validate(UpdateOrderParams, "params"),
  validate(UpdateOrderStatusBody),
  updateOrderStatus,
);

router.get(
  "/:tableId/active",
  requireRole(["ADMIN", "SHOP", "USER"]),
  validate(ActiveOrdersParams, "params"),
  getActiveOrders,
);

router.post(
  "/create/:tableId",
  requireRole(["ADMIN", "SHOP", "USER"]),
  validate(CreateOrderParams, "params"),
  createOrder,
);

export default router;
