import { Response } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { AuthenticatedRequest } from "../types/auth";
import { deleteFileByUrl } from "../utils/file";

export async function createMenuItem(req: AuthenticatedRequest, res: Response) {
  try {
    const userRole = req.headers["x-user-role"];
    if (userRole !== "ADMIN" && userRole !== "SHOP") {
      return res.status(401).json({ message: "Forbidden" });
    }

    const { name, price, foodType, categoryId, description } = req.body;
    if (!name || !foodType || !categoryId) {
      return res.status(400).json({ message: "Missing required " });
    }

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

export async function getMenu(req: AuthenticatedRequest, res: Response) {
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

export async function updateMenuItem(req: AuthenticatedRequest, res: Response) {
  try {
    const userRole = req.headers["x-user-role"];
    if (userRole !== "ADMIN" && userRole !== "SHOP") {
      return res.status(500).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

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
        ...(isAvailable !== undefined && { isAvailable: String(isAvailable) === 'true' }),
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

export async function deleteMenuItem(req: AuthenticatedRequest, res: Response) {
  try {
    const userRole = req.headers["x-user-role"];
    if (userRole !== "ADMIN" && userRole !== "SHOP") {
      return res.status(401).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

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

export async function createVariant(req: AuthenticatedRequest, res: Response) {
  try {
    const userRole = req.headers["x-user-role"];
    if (userRole !== "ADMIN" && userRole !== "SHOP") {
      return res.status(401).json({ message: "Forbidden" });
    }

    const { menuItemId } = req.params;
    if (!menuItemId || Array.isArray(menuItemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const { label, price } = req.body;
    if (!label || !price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

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

export async function getAllVariants(req: AuthenticatedRequest, res: Response) {
  try {
    const userRole = req.headers["x-user-role"];
    if (userRole !== "ADMIN" && userRole !== "SHOP") {
      return res.status(401).json({ message: "Forbidden" });
    }

    const { menuItemId } = req.params;
    if (!menuItemId || Array.isArray(menuItemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

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

export async function updateVariant(req: AuthenticatedRequest, res: Response) {
  try {
    const userRole = req.headers["x-user-role"];
    if (userRole !== "ADMIN" && userRole !== "SHOP") {
      return res.status(401).json({ message: "Forbidden" });
    }

    const { menuItemId, variantId } = req.params;
    if (!menuItemId || Array.isArray(menuItemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    if (!variantId || Array.isArray(variantId)) {
      return res.status(400).json({ message: "Invalid variant ID" });
    }

    const { label, price } = req.body;

    const updatedVariant = await prisma.menuVariant.update({
      where: { id: variantId },
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

export async function deleteVariant(req: AuthenticatedRequest, res: Response) {
  try {
    const userRole = req.headers["x-user-role"];
    if (userRole !== "ADMIN" && userRole !== "SHOP") {
      return res.status(401).json({ message: "Forbidden" });
    }

    const { menuItemId, variantId } = req.params;
    if (!menuItemId || Array.isArray(menuItemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    if (!variantId || Array.isArray(variantId)) {
      return res.status(400).json({ message: "Invalid variant ID" });
    }

    await prisma.menuVariant.delete({
      where: { id: variantId },
    });

    return res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.log("DELETE_VARIANT_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
