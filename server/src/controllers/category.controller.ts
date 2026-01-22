import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../types/auth";

export async function createCategory(req: AuthenticatedRequest, res: Response) {
  try {
    const userRole = req.headers["x-user-role"];
    if (userRole !== "ADMIN") {
      return res.status(401).json({ message: "Forbidden" });
    }

    const { name } = req.body;
    if (!name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const category = await prisma.category.findUnique({ where: { name } });
    if (category) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
      },
    });

    return res.status(201).json({
      message: "Category created successfully",
      data: { category: newCategory },
    });
  } catch (error) {
    console.log("CATEGORY_CREATE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
