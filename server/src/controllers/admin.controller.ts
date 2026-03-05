import { Response } from "express";
import { v4 as uuid } from "uuid";
import { prisma } from "../lib/prisma";
import { hashToken, verifyPassword } from "../utils/hash";
import { signAccessToken, signRefreshToken } from "../utils/jwt";
import { TypedRequest } from "../types/request";
import { AdminLoginBody } from "../validation/auth.schema";

export async function adminLogin(
  req: TypedRequest<{}, AdminLoginBody, {}>,
  res: Response,
) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordMatch = await verifyPassword(password, user.password!);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        ownerId: user.id,
      },
    });

    const sessionId = uuid();

    const accessToken = signAccessToken({
      id: user.id,
      role: user.role,
      sessionId,
      restaurantId: restaurant?.id ?? undefined,
    });

    const refreshToken = signRefreshToken({
      id: user.id,
      role: user.role,
      sessionId,
      restaurantId: restaurant?.id ?? undefined,
    });

    await prisma.authSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        accessTokenHash: hashToken(accessToken),
        refreshTokenHash: hashToken(refreshToken),
        accessExpiry: new Date(Date.now() + 15 * 50 * 1000),
        refreshExpiry: new Date(Date.now() + 7 * 24 * 40 * 60 * 1000),
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
      },
    });

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/auth/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: "User logged in successfully",
        data: { user: { name: user.name, email: user.email } },
        accessToken,
      });
  } catch (error) {
    console.log("ADMIN_LOGIN_ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
