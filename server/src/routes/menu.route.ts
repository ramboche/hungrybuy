import { Router } from "express";
import {
  createMenuItem,
  createVariant,
  deleteMenuItem,
  deleteVariant,
  getAllVariants,
  getMenu,
  updateMenuItem,
  updateVariant,
} from "../controllers/menu.controller";
import { upload } from "../utils/upload";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  CreateVariantBody,
  CreateVariantParams,
  DeleteMenuItemParams,
  DeleteVariantParams,
  GetMenuQuery,
  GetVariantParams,
  UpdateMenuItemParams,
  UpdateMenuItemsBody,
  UpdateVariantBody,
  UpdateVariantParams,
} from "../validation/menu.schema";

const router = Router();

router.get(
  "/",
  requireRole(["ADMIN", "SHOP", "USER"]),
  validate(GetMenuQuery, "query"),
  getMenu,
);

router.post(
  "/create",
  requireRole(["ADMIN", "SHOP"]),
  upload.single("image"),
  validate(CreateVariantBody),
  createMenuItem,
);

router.patch(
  "/:id",
  requireRole(["ADMIN", "SHOP"]),
  upload.single("image"),
  validate(UpdateMenuItemParams, "params"),
  validate(UpdateMenuItemsBody),
  updateMenuItem,
);

router.delete(
  "/:id",
  requireRole(["ADMIN", "SHOP"]),
  validate(DeleteMenuItemParams, "params"),
  deleteMenuItem,
);

router.get(
  "/:menuItemId/variants",
  requireRole(["ADMIN", "SHOP", "USER"]),
  validate(GetVariantParams, "params"),
  getAllVariants,
);

router.post(
  "/:menuItemId/variants",
  requireRole(["ADMIN", "SHOP"]),
  validate(CreateVariantParams, "params"),
  validate(CreateVariantBody),
  createVariant,
);

router.patch(
  "/:menuItemId/variants/:variantId",
  requireRole(["ADMIN", "SHOP"]),
  validate(UpdateVariantParams, "params"),
  validate(UpdateVariantBody),
  updateVariant,
);

router.delete(
  "/:menuItemId/variants/:variantId",
  requireRole(["ADMIN", "SHOP"]),
  validate(DeleteVariantParams, "params"),
  deleteVariant,
);

export default router;
