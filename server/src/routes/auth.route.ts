import { Router } from "express";
import {
  loginUser,
  logout,
  refreshToken,
} from "../controllers/auth.controller";
import { sendOtp } from "../controllers/otp.controller";
import { validate } from "../middlewares/validate.middleware";
import { LoginUserBody, SendOtpBody } from "../validation/auth.schema";

const router = Router();

router.post("/login", validate(LoginUserBody), loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

router.post("/send-otp", validate(SendOtpBody), sendOtp);

export default router;
