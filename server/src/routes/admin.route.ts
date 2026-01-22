import { Router } from "express";
import { adminLogin, createShop } from "../controllers/admin.controller";

const router = Router();

router.post("/login", adminLogin);

router.post("/shops", createShop);

export default router;
