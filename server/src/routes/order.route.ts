import { Router } from "express";
import {
  getAllOrders,
  createOrder,
  updateOrderStatus,
  getActiveOrders,
} from "../controllers/order.controller";

const router = Router();

router.get("/all", getAllOrders);
router.patch("/:orderId", updateOrderStatus);

router.get("/:tableId/active", getActiveOrders);
router.post("/create/:tableId", createOrder);

export default router;
