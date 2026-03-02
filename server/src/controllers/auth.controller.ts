import { Response } from "express";
import { v4 as uuid } from "uuid";
import { prisma } from "../lib/prisma";
import { verifyOtp } from "../utils/otpStore";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
} from "../utils/jwt";
import { TypedRequest } from "../types/request";
import { LoginUserBody } from "../validation/auth.schema";
import { hashToken } from "../utils/hash";
import { deleteSession } from "../lib/session";

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

    const sessionId = uuid();

    const accessToken = signAccessToken({
      id: user.id,
      role: user.role,
      sessionId,
      restaurantId: undefined,
    });

    const refreshToken = signRefreshToken({
      id: user.id,
      role: user.role,
      sessionId,
      restaurantId: undefined,
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

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/auth/refresh",
      maxAge: 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      data: { user: { name: user.name, phone: user.phone } },
      accessToken,
    });
  } catch (error) {
    console.log("AUTH_LOGIN_ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function refreshToken(req: TypedRequest, res: Response) {
  try {
    const refreshToken = req.cookies?.refreshToken;

    const session = await prisma.authSession.findFirst({
      where: {
        refreshTokenHash: hashToken(refreshToken),
        revoked: false,
        refreshExpiry: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!session) {
      return res.status(401).json({ message: "Session expired" });
    }

    await prisma.authSession.update({
      where: { id: session.id },
      data: { revoked: true },
    });

    await deleteSession(session.id);

    const newSessionId = uuid();

    const newAccessToken = signAccessToken({
      id: session.user.id,
      role: session.user.role,
      sessionId: newSessionId,
      restaurantId: undefined,
    });

    const newRefreshToken = signRefreshToken({
      id: session.user.id,
      role: session.user.role,
      sessionId: newSessionId,
      restaurantId: undefined,
    });

    await prisma.authSession.create({
      data: {
        id: newSessionId,
        userId: session.user.id,
        accessTokenHash: hashToken(newAccessToken),
        refreshTokenHash: hashToken(newRefreshToken),
        accessExpiry: new Date(Date.now() + 15 * 50 * 1000),
        refreshExpiry: new Date(Date.now() + 7 * 24 * 40 * 60 * 1000),
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
      },
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/auth/refresh",
      maxAge: 7 * 24 * 40 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Token refreshed successfully",
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    console.log("AUTH_REFRESH_TOKEN_ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function logout(req: TypedRequest, res: Response) {
  try {
    const token = req.headers.authorization!.split(" ")[1];
    const payload = verifyAccessToken(token);

    await deleteSession(payload.sessionId);

    await prisma.authSession.updateMany({
      where: {
        accessTokenHash: hashToken(token),
      },
      data: {
        revoked: true,
      },
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("AUTH_LOGOUT_ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
