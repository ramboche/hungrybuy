import { Router } from "express";
import {
  getAllOrders,
  createOrder,
  updateOrderStatus,
} from "../controllers/order.controller";

const router = Router();

router.get("/all", getAllOrders);
router.post("/create/:tableId", createOrder);
router.patch("/:orderId", updateOrderStatus);

export default router;
