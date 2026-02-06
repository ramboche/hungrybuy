import { Response } from "express";
import { prisma } from "../lib/prisma";
import { TypedRequest } from "../types/request";
import {
  CreateCategoryBody,
  DeleteCategoryParams,
} from "../validation/category.schema";

export async function createCategory(
  req: TypedRequest<{}, CreateCategoryBody, {}>,
  res: Response,
) {
  try {
    const { name } = req.body;

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

export async function deleteCategory(
  req: TypedRequest<DeleteCategoryParams, {}, {}>,
  res: Response,
) {
  try {
    const { id } = req.params;

    const hasItem = await prisma.menuItem.findFirst({
      where: {
        categoryId: id,
      },
    });

    if (hasItem) {
      return res
        .status(400)
        .json({ message: "Cannot delete category with items" });
    }

    await prisma.category.delete({ where: { id } });
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.log("CATEGORY_DELETE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
