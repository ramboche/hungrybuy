import { Response } from "express";
import { prisma } from "../lib/prisma";
import { verifyOtp } from "../utils/otpStore";
import { signJwt } from "../utils/jwt";
import { TypedRequest } from "../types/request";
import { LoginUserBody } from "../validation/auth.schema";

export async function loginUser(
  req: TypedRequest<{}, LoginUserBody, {}>,
  res: Response,
) {
  try {
    const { phone, otp } = req.body;

    if (verifyOtp(phone, otp) === false) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    let user = await prisma.user.findUnique({
      where: {
        phone,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "world",
          phone,
        },
      });
    }

    const token = signJwt({ id: user.id, role: user.role });

    return res.status(200).json({
      message: "Login successful",
      data: { user: { name: user.name, phone: user.phone } },
      token,
    });
  } catch (error) {
    console.log("AUTH_LOGIN_ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
