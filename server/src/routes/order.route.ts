import { Router } from "express";
import { createOrder } from "../controllers/order.controller";

const router = Router();

router.post("/create/:tableId", createOrder); 

export default router;
