import { Router } from "express";
import {
  adminLogin,
  getAllShops,
  createShop,
} from "../controllers/admin.controller";

const router = Router();

router.post("/login", adminLogin);

router.get("/shops", getAllShops);
router.post("/shops", createShop);

export default router;
