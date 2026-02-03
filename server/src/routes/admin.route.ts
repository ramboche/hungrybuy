import { Router } from "express";
import {
  adminLogin,
  getAllShops,
  createShop,
} from "../controllers/admin.controller";
import { validate } from "../middlewares/validate.middleware";
import { AdminLoginSchema, CreateShopSchema } from "../validation/auth.schema";
import { requireRole } from "../middlewares/role.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/login", validate(AdminLoginSchema), adminLogin);

router.get("/shops", authMiddleware, requireRole(["ADMIN"]), getAllShops);
router.post(
  "/shops",
  authMiddleware,
  requireRole(["ADMIN"]),
  validate(CreateShopSchema),
  createShop,
);

export default router;
