import { Router } from "express";
import {
  addToCart,
  deleteCartItem,
  getCart,
  updateCart,
} from "../controllers/cart.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  AddCartBody,
  DeleteCartParams,
  UpdateCartBody,
  UpdateCartParams,
} from "../validation/cart.schema";
import { requireRole } from "../middlewares/role.middleware";
import { verifyTable } from "../middlewares/table.middleware";

const router = Router();

router.get("/", requireRole(["ADMIN", "SHOP", "USER"]), verifyTable, getCart);

router.post(
  "/add",
  requireRole(["USER"]),
  verifyTable,
  validate(AddCartBody),
  addToCart,
);

router.patch(
  "/:cartId",
  requireRole(["USER"]),
  verifyTable,
  validate(UpdateCartParams, "params"),
  validate(UpdateCartBody),
  updateCart,
);

router.delete(
  "/:cartId",
  requireRole(["USER"]),
  verifyTable,
  validate(DeleteCartParams, "params"),
  deleteCartItem,
);

export default router;
