import { Router } from "express";
import { loginUser } from "../controllers/auth.controller";
import { sendOtp } from "../controllers/otp.controller";
import { validate } from "../middlewares/validate.middleware";
import { LoginUserBody } from "../validation/auth.schema";
import { SendOtpBody } from "../validation/otp.schema";

const router = Router();

router.post("/login", validate(LoginUserBody), loginUser);

router.post("/send-otp", validate(SendOtpBody), sendOtp);

export default router;
