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
  CreateMenuBody,
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
import { resolveTenant } from "../middlewares/restaurant.middleware";

const router = Router();

router.get(
  "/",
  requireRole(["PLATFORM_ADMIN", "RESTAURANT_OWNER", "CUSTOMER"]),
  validate(GetMenuQuery, "query"),
  resolveTenant,
  getMenu,
);

router.post(
  "/create",
  requireRole(["RESTAURANT_OWNER"]),
  upload.single("image"),
  validate(CreateMenuBody),
  resolveTenant,
  createMenuItem,
);

router.patch(
  "/:id",
  requireRole(["RESTAURANT_OWNER"]),
  upload.single("image"),
  validate(UpdateMenuItemParams, "params"),
  validate(UpdateMenuItemsBody),
  resolveTenant,
  updateMenuItem,
);

router.delete(
  "/:id",
  requireRole(["RESTAURANT_OWNER"]),
  validate(DeleteMenuItemParams, "params"),
  resolveTenant,
  deleteMenuItem,
);

router.get(
  "/:menuItemId/variants",
  requireRole(["PLATFORM_ADMIN", "RESTAURANT_OWNER", "CUSTOMER"]),
  validate(GetVariantParams, "params"),
  resolveTenant,
  getAllVariants,
);

router.post(
  "/:menuItemId/variants",
  requireRole(["RESTAURANT_OWNER"]),
  validate(CreateVariantParams, "params"),
  validate(CreateVariantBody),
  resolveTenant,
  createVariant,
);

router.patch(
  "/:menuItemId/variants/:variantId",
  requireRole(["RESTAURANT_OWNER"]),
  validate(UpdateVariantParams, "params"),
  validate(UpdateVariantBody),
  resolveTenant,
  updateVariant,
);

router.delete(
  "/:menuItemId/variants/:variantId",
  requireRole(["RESTAURANT_OWNER"]),
  validate(DeleteVariantParams, "params"),
  resolveTenant,
  deleteVariant,
);

export default router;
