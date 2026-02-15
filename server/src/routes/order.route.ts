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

const router = Router();

router.get("/all", requireRole(["ADMIN", "SHOP"]), getAllOrders);

router.get("/active", requireRole(["USER"]), verifyTable, getActiveOrders);

router.patch(
  "/:orderId",
  requireRole(["ADMIN", "SHOP"]),
  validate(UpdateOrderParams, "params"),
  validate(UpdateOrderStatusBody),
  updateOrderStatus,
);

router.post("/create", requireRole(["USER"]), verifyTable, createOrder);

export default router;
