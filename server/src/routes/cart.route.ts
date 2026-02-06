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
  AddCartParams,
  DeleteCartParams,
  GetCartParams,
  UpdateCartBody,
  UpdateCartParams,
} from "../validation/cart.schema";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/:tableId",
  requireRole(["ADMIN", "SHOP", "USER"]),
  validate(GetCartParams, "params"),
  getCart,
);

router.post(
  "/add-to-cart/:tableId",
  requireRole(["ADMIN", "SHOP", "USER"]),
  validate(AddCartParams, "params"),
  validate(AddCartBody),
  addToCart,
);

router.patch(
  "/:cartId",
  requireRole(["ADMIN", "SHOP", "USER"]),
  validate(UpdateCartParams, "params"),
  validate(UpdateCartBody),
  updateCart,
);

router.delete(
  "/:cartId",
  requireRole(["ADMIN", "SHOP", "USER"]),
  validate(DeleteCartParams, "params"),
  deleteCartItem,
);

export default router;
