import { Router } from "express";
import {
  adminLogin,
  getAllShops,
  createShop,
} from "../controllers/admin.controller";
import { validate } from "../middlewares/validate.middleware";
import { AdminLoginBody, CreateShopBody } from "../validation/auth.schema";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.post("/login", validate(AdminLoginBody), adminLogin);

router.get("/shops", requireRole(["ADMIN"]), getAllShops);

router.post(
  "/shops",
  requireRole(["ADMIN"]),
  validate(CreateShopBody),
  createShop,
);

export default router;
