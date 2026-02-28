import { Router } from "express";
import { adminLogin } from "../controllers/admin.controller";
import { validate } from "../middlewares/validate.middleware";
import { AdminLoginBody } from "../validation/auth.schema";

const router = Router();

router.post("/login", validate(AdminLoginBody), adminLogin);

export default router;
