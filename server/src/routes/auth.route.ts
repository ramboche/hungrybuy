import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller";
import { sendOtp } from "../controllers/otp.controller";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/send-otp", sendOtp);

export default router;
