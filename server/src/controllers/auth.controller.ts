import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { verifyOtp } from "../utils/otpStore";
import { signJwt } from "../utils/jwt";
import { TypedRequest } from "../types/request";
import { LoginUserBody, RegisterUserBody } from "../validation/auth.schema";

export async function registerUser(
  req: TypedRequest<{}, RegisterUserBody, {}>,
  res: Response,
) {
  try {
    const { name, phone, otp } = req.body;

    if (verifyOtp(phone, otp) === false) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // -- -- -- -- -- check if user exists -- -- -- -- --
    const user = await prisma.user.findUnique({
      where: {
        phone,
      },
    });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // -- -- -- -- -- create the user -- -- -- -- --
    const newUser = await prisma.user.create({
      data: {
        name: name ?? "world",
        phone,
      },
    });

    // -- -- -- -- -- sign jwt -- -- -- -- --
    const token = signJwt({ id: newUser.id, role: newUser.role });

    return res.status(201).json({
      message: "User created successfully",
      data: { user: { name: newUser.name, phone: newUser.phone } },
      token,
    });
  } catch (error) {
    console.log("AUTH_REGISTER_ERROR:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function loginUser(
  req: TypedRequest<{}, LoginUserBody, {}>,
  res: Response,
) {
  try {
    const { phone, otp } = req.body;

    // -- -- -- -- -- check if user exists -- -- -- -- --
    const user = await prisma.user.findUnique({
      where: {
        phone,
      },
    });

    if (!user) {
      return registerUser(req, res);
    }

    // -- -- -- -- -- verify otp -- -- -- -- --
    if (verifyOtp(phone, otp) === false) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // -- -- -- -- -- sign jwt -- -- -- -- --
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
