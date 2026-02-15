import { Response } from "express";
import { canRequestOtp, generateOtp, saveOtp } from "../utils/otpStore";
import { TypedRequest } from "../types/request";
import { SendOtpBody } from "../validation/auth.schema";

export async function sendOtp(
  req: TypedRequest<{}, SendOtpBody, {}>,
  res: Response,
) {
  try {
    const { phone } = req.body;

    if (!canRequestOtp(phone)) {
      return res.status(429).json({ message: "Too many requests" });
    }

    const otp = generateOtp();
    saveOtp(phone, otp);

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.log("AUTH_SEND_OTP_ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
