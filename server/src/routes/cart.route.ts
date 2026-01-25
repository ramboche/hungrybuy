import { Router } from "express";
import { addToCart, getCart } from "../controllers/cart.controller";

const router = Router();

router.get("/:tableId", getCart);
router.post("/add-to-cart/:tableId", addToCart);

export default router;
