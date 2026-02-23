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
import { LoginUserBody, RefreshTokenBody } from "../validation/auth.schema";
import { hashToken } from "../utils/hash";
import { deleteSession, storeSession } from "../lib/session";

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
    });

    const refreshToken = signRefreshToken({
      id: user.id,
      role: user.role,
      sessionId,
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

    await storeSession(sessionId, user.id, user.role);

    return res.status(200).json({
      message: "Login successful",
      data: { user: { name: user.name, phone: user.phone } },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.log("AUTH_LOGIN_ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function refreshToken(
  req: TypedRequest<{}, RefreshTokenBody, {}>,
  res: Response,
) {
  try {
    const { refreshToken } = req.body;

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

    const newAccessToken = signAccessToken({
      id: session.user.id,
      role: session.user.role,
      sessionId: session.id,
    });

    const newRefreshToken = signRefreshToken({
      id: session.user.id,
      role: session.user.role,
      sessionId: session.id,
    });

    await prisma.authSession.create({
      data: {
        userId: session.user.id,
        accessTokenHash: hashToken(newAccessToken),
        refreshTokenHash: hashToken(newRefreshToken),
        accessExpiry: new Date(Date.now() + 15 * 50 * 1000),
        refreshExpiry: new Date(Date.now() + 7 * 24 * 40 * 60 * 1000),
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
      },
    });

    return res.status(200).json({
      message: "Token refreshed successfully",
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
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
