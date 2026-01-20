import { Request, Response } from "express";
import { canRequestOtp, generateOtp, saveOtp } from "../utils/otpStore";

export async function sendOtp(req: Request, res: Response) {
  try {
    // -- -- -- -- -- validate phone -- -- -- -- --
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone is required" });
    }

    // -- -- -- -- -- rate limit otp -- -- -- -- --
    if (!canRequestOtp) {
      return res.status(429).json({ message: "Too many requests" });
    }

    // -- -- -- -- -- generate otp -- -- -- -- --
    const otp = generateOtp();
    saveOtp(phone, otp);

    // -- -- -- -- -- send otp -- -- -- -- --
    return res.status(200).json({ message: "OTP sent succesfully" });
  } catch (error) {
    console.log("AUTH_SEND_OTP_ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
