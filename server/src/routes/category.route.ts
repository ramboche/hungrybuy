import { Router } from "express";
import {
  getAllCategories,
  createCategory,
  deleteCategory,
} from "../controllers/category.controller";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  CreateCategoryBody,
  DeleteCategoryParams,
} from "../validation/category.schema";
import { upload } from "../utils/upload";
import { resolveTenant } from "../middlewares/restaurant.middleware";

const router = Router();

router.get(
  "/",
  requireRole(["PLATFORM_ADMIN", "RESTAURANT_OWNER", "CUSTOMER"]),
  resolveTenant,
  getAllCategories,
);

router.post(
  "/create",
  requireRole(["RESTAURANT_OWNER"]),
  upload.single("image"),
  validate(CreateCategoryBody),
  resolveTenant,
  createCategory,
);

router.delete(
  "/:id",
  requireRole(["RESTAURANT_OWNER"]),
  validate(DeleteCategoryParams, "params"),
  resolveTenant,
  deleteCategory,
);

export default router;
