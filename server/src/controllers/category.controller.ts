import { Response } from "express";
import { prisma } from "../lib/prisma";
import { TypedRequest } from "../types/request";
import {
  CreateCategoryBody,
  DeleteCategoryParams,
} from "../validation/category.schema";
import { deleteFileByUrl } from "../utils/file";

export async function getAllCategories(req: TypedRequest, res: Response) {
  try {
    const { id: restaurantId } = req.restaurant!;

    const categories = await prisma.category.findMany({
      where: { restaurantId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        image: true,
      },
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
    const { id: restaurantId } = req.restaurant!;

    let { name } = req.body;
    name = name.trim().toLocaleLowerCase();

    let image: string | null = null;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        image,
        restaurantId,
      },
      select: {
        id: true,
        name: true,
        image: true,
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
    const { id: restaurantId } = req.restaurant!;

    const deletedCategory = await prisma.$transaction(async (tx) => {
      const category = await tx.category.findFirst({
        where: {
          id,
          restaurantId,
        },
        select: {
          id: true,
          image: true,
        },
      });

      if (!category) {
        throw new Error("CATEGORY_NOT_FOUND");
      }

      const itemCount = await tx.menuItem.count({
        where: {
          categoryId: id,
          restaurantId,
        },
      });

      if (itemCount > 0) {
        throw new Error("HAS_ITEMS");
      }

      await tx.category.delete({
        where: { id },
      });

      return category;
    });

    if (deletedCategory.image) {
      deleteFileByUrl(deletedCategory.image);
    }

    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error: any) {
    if (error instanceof Error && error.message === "HAS_ITEMS") {
      return res
        .status(400)
        .json({ message: "Cannot delete category with items" });
    }

    if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({ message: "Category not found" });
    }

    console.error("CATEGORY_DELETE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
