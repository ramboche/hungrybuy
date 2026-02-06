import { Response } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { deleteFileByUrl } from "../utils/file";
import { TypedRequest } from "../types/request";
import {
  CreateMenuBody,
  CreateVariantBody,
  CreateVariantParams,
  DeleteMenuItemParams,
  DeleteVariantParams,
  GetMenuQuery,
  GetVariantParams,
  UpdateMenuItemParams,
  UpdateMenuItemsBody,
  UpdateVariantBody,
  UpdateVariantParams,
} from "../validation/menu.schema";

export async function createMenuItem(
  req: TypedRequest<{}, CreateMenuBody, {}>,
  res: Response,
) {
  try {
    const { name, price, foodType, categoryId, description } = req.body;

    let image: string | null = null;
    if (req.file) {
      image = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;
    }

    const item = await prisma.menuItem.create({
      data: {
        name,
        description: description ?? "",
        price: price !== undefined ? new Prisma.Decimal(price) : null,
        foodType,
        categoryId,
        image,
      },
    });

    return res
      .status(201)
      .json({ message: "Menu item created successfully", data: { item } });
  } catch (error) {
    console.log("MENU_ITEM_CREATE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMenu(
  req: TypedRequest<{}, {}, GetMenuQuery>,
  res: Response,
) {
  try {
    const { categoryId, foodType, search } = req.query;

    const items = await prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        ...(categoryId && { categoryId: String(categoryId) }),
        ...(foodType && { foodType: foodType as any }),
        ...(search && {
          name: { contains: String(search).trim(), mode: "insensitive" },
        }),
      },
      include: { category: true, variants: true },
    });

    return res
      .status(200)
      .json({ message: "Fetched all menu items", data: { items } });
  } catch (error) {
    console.log("MENU_GET_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateMenuItem(
  req: TypedRequest<UpdateMenuItemParams, UpdateMenuItemsBody, {}>,
  res: Response,
) {
  try {
    const { id } = req.params;
    const { name, description, price, foodType, categoryId, isAvailable } =
      req.body;

    const item = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    let newImage: string | undefined = undefined;
    if (req.file) {
      deleteFileByUrl(item.image);

      newImage = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(foodType !== undefined && { foodType }),
        ...(categoryId !== undefined && { categoryId }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(newImage !== undefined && { image: newImage }),
      },
    });

    return res
      .status(200)
      .json({ message: "Updated successfully", data: { item: updatedItem } });
  } catch (error) {
    console.log("UPDATE_MENU_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteMenuItem(
  req: TypedRequest<DeleteMenuItemParams, {}, {}>,
  res: Response,
) {
  try {
    const { id } = req.params;

    const item = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    deleteFileByUrl(item.image);

    await prisma.menuItem.delete({ where: { id } });
    return res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.log("DELETE_MENU_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function createVariant(
  req: TypedRequest<CreateVariantParams, CreateVariantBody, {}>,
  res: Response,
) {
  try {
    const { menuItemId } = req.params;
    const { label, price } = req.body;

    const variant = await prisma.menuVariant.findFirst({
      where: {
        menuItemId,
        label,
      },
    });

    if (variant) {
      return res.status(409).json({ message: "Variant already exists" });
    }

    const newVariant = await prisma.menuVariant.create({
      data: {
        label,
        price: new Prisma.Decimal(price),
        menuItemId,
      },
    });

    return res.status(201).json({
      message: "Variant created successfully",
      data: { variant: newVariant },
    });
  } catch (error) {
    console.log("CREATE_VARIANT_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getAllVariants(
  req: TypedRequest<GetVariantParams, {}, {}>,
  res: Response,
) {
  try {
    const { menuItemId } = req.params;

    const variants = await prisma.menuVariant.findMany({
      where: { menuItemId },
      orderBy: { price: "asc" },
    });

    return res
      .status(200)
      .json({ message: "Fetched all variants", data: { variants } });
  } catch (error) {
    console.log("GET_VARIANTS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateVariant(
  req: TypedRequest<UpdateVariantParams, UpdateVariantBody, {}>,
  res: Response,
) {
  try {
    const { menuItemId, variantId } = req.params;

    const { label, price } = req.body;

    const updatedVariant = await prisma.menuVariant.update({
      where: { id: variantId, menuItemId },
      data: {
        ...(label !== undefined && { label }),
        ...(price !== undefined && { price: Number(price) }),
      },
    });

    return res.status(200).json({
      message: "Updated successfully",
      data: { variant: updatedVariant },
    });
  } catch (error) {
    console.log("UPDATE_VARIANT_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteVariant(
  req: TypedRequest<DeleteVariantParams, {}, {}>,
  res: Response,
) {
  try {
    const { menuItemId, variantId } = req.params;

    await prisma.menuVariant.delete({
      where: { id: variantId, menuItemId },
    });

    return res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.log("DELETE_VARIANT_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
