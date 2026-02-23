import { Response } from "express";
import { v4 as uuid } from "uuid";
import { prisma } from "../lib/prisma";
import { hashPassword, hashToken, verifyPassword } from "../utils/hash";
import { signAccessToken, signRefreshToken } from "../utils/jwt";
import { TypedRequest } from "../types/request";
import { AdminLoginBody, CreateShopBody } from "../validation/auth.schema";

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

    return res.status(200).json({
      message: "User logged in successfully",
      data: { user: { name: user.name, email: user.email } },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.log("ADMIN_LOGIN_ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getAllShops(_: TypedRequest, res: Response) {
  try {
    const shops = await prisma.user.findMany({
      where: {
        role: "SHOP",
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      message: "Shops fetched successfully",
      data: { shops },
    });
  } catch (error) {
    console.log("GET_SHOP_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function createShop(
  req: TypedRequest<{}, CreateShopBody, {}>,
  res: Response,
) {
  try {
    const { name, email, password } = req.body;

    const shop = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (shop) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const newShop = await prisma.user.create({
      data: {
        name: name ?? "Shop",
        email,
        password: hashedPassword,
        role: "SHOP",
      },
    });

    return res.status(201).json({
      message: "Shop created successfully",
      data: { user: { name: newShop.name, email: newShop.email } },
    });
  } catch (error) {
    console.log("SHOP_REGISTER_ERROR:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
