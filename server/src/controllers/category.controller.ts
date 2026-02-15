import { Response } from "express";
import { prisma } from "../lib/prisma";
import { TypedRequest } from "../types/request";
import {
  CreateCategoryBody,
  DeleteCategoryParams,
} from "../validation/category.schema";

export async function getAllCategories(_: TypedRequest, res: Response) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return res
      .status(200)
      .json({ message: "Fetched all categories", data: { categories } });
  } catch (error) {
    console.log("CATEGORY_GET_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function createCategory(
  req: TypedRequest<{}, CreateCategoryBody, {}>,
  res: Response,
) {
  try {
    let { name } = req.body;
    name = name.trim().toLocaleLowerCase();

    const newCategory = await prisma.category.create({
      data: {
        name,
      },
    });

    return res.status(201).json({
      message: "Category created successfully",
      data: { category: newCategory },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({ message: "Category already exists" });
    }

    console.log("CATEGORY_CREATE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteCategory(
  req: TypedRequest<DeleteCategoryParams, {}, {}>,
  res: Response,
) {
  try {
    const { id } = req.params;

    const itemCount = await prisma.menuItem.count({
      where: {
        categoryId: id,
      },
    });

    if (itemCount > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete category with items" });
    }

    await prisma.category.delete({ where: { id } });
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(409).json({ message: "Category not found" });
    }

    console.log("CATEGORY_DELETE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
