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
  UpdateOrderParams,
  UpdateOrderStatusBody,
} from "../validation/order.schema";
import { verifyTable } from "../middlewares/table.middleware";
import { resolveTenant } from "../middlewares/restaurant.middleware";

const router = Router();

router.get(
  "/all",
  requireRole(["RESTAURANT_OWNER"]),
  resolveTenant,
  getAllOrders,
);

router.get("/active", requireRole(["CUSTOMER"]), verifyTable, getActiveOrders);

router.patch(
  "/:orderId",
  requireRole(["RESTAURANT_OWNER"]),
  validate(UpdateOrderParams, "params"),
  validate(UpdateOrderStatusBody),
  resolveTenant,
  updateOrderStatus,
);

router.post("/create", requireRole(["CUSTOMER"]), verifyTable, createOrder);

export default router;
