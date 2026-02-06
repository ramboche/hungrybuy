import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller";
import { sendOtp } from "../controllers/otp.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  LoginUserBody,
  OtpRequestBody,
  RegisterUserBody,
} from "../validation/auth.schema";

const router = Router();

router.post("/register", validate(RegisterUserBody), registerUser);
router.post("/login", validate(LoginUserBody), loginUser);

router.post("/send-otp", validate(OtpRequestBody), sendOtp);

export default router;
