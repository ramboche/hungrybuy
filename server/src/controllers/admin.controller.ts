import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../utils/hash";
import { signJwt } from "../utils/jwt";

export async function adminLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

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

    const token = signJwt({ id: user.id, role: user.role });

    return res.status(200).json({
      message: "User logged in successfully",
      data: { user: { name: user.name, email: user.email } },
      token,
    });
  } catch (error) {
    console.log("ADMIN_LOGIN_ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function createShop(req: AuthenticatedRequest, res: Response) {
  try {
    const userRole = req.headers["x-user-role"];

    if (!userRole || userRole !== "ADMIN") {
      return res.status(401).json({ message: "Forbidden" });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

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
        name: "Shop",
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
