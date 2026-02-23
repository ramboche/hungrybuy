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

const router = Router();

router.get("/", requireRole(["ADMIN", "SHOP", "USER"]), getAllCategories);

router.post(
  "/create",
  requireRole(["ADMIN", "SHOP"]),
  upload.single("image"),
  validate(CreateCategoryBody),
  createCategory,
);

router.delete(
  "/:id",
  requireRole(["ADMIN", "SHOP"]),
  validate(DeleteCategoryParams, "params"),
  deleteCategory,
);

export default router;
