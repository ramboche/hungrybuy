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
import { getCache, setCache } from "../utils/cache";

export async function getMenu(req: TypedRequest<{}, {}, {}>, res: Response) {
  try {
    const parsedQuery = GetMenuQuery.parse(req.query);

    const queryKey = JSON.stringify(parsedQuery);
    const cacheKey = `menu:${queryKey}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const {
      categoryId,
      foodType,
      search,
      cursor,
      limit,
      sortBy,
      sortOrder,
      minRating,
      includeUnavailable,
    } = parsedQuery;

    const isAdminOrShop: boolean =
      req.user?.role === "ADMIN" || req.user?.role === "SHOP";

    const searchText =
      typeof search === "string" && search.trim().length >= 2
        ? search.trim()
        : undefined;

    const whereClause = {
      ...(includeUnavailable && isAdminOrShop ? {} : { isAvailable: true }),
      ...(categoryId && { categoryId }),
      ...(foodType && { foodType }),
      ...(minRating !== undefined && { rating: { gte: minRating } }),
      ...(searchText && {
        name: { contains: searchText, mode: "insensitive" as const },
      }),
    };

    const orderBy: any = {
      [sortBy]: sortOrder,
    };

    const items = await prisma.menuItem.findMany({
      where: whereClause,
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: [orderBy, { id: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
        foodType: true,
        isAvailable: true,
        categoryId: true,
        category: {
          select: { id: true, name: true },
        },
        variants: {
          select: {
            id: true,
            label: true,
            price: true,
          },
        },
      },
    });

    let nextCursor: string | null = null;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem!.id;
    }

    const responsePayload = {
      message: "Fetched all menu items",
      data: {
        items,
        pagination: {
          nextCursor,
          hasNextPage: !!nextCursor,
        },
      },
    };

    if (!isAdminOrShop) {
      await setCache(cacheKey, responsePayload, 60);
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.log("MENU_GET_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function createMenuItem(
  req: TypedRequest<{}, CreateMenuBody, {}>,
  res: Response,
) {
  try {
    const { name, price, foodType, categoryId, description } = req.body;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    let image: string | null = null;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
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
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
        foodType: true,
        isAvailable: true,
        categoryId: true,
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
      select: { id: true, image: true },
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    let newImage: string | undefined = undefined;
    if (req.file) {
      deleteFileByUrl(item.image);

      newImage = `/uploads/${req.file.filename}`;
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(foodType !== undefined && { foodType }),
        ...(categoryId !== undefined && { categoryId }),
        ...(isAvailable !== undefined && { isAvailable: isAvailable }),
        ...(newImage !== undefined && { image: newImage }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
        foodType: true,
        isAvailable: true,
        categoryId: true,
      },
    });

    return res
      .status(200)
      .json({ message: "Updated successfully", data: { item: updatedItem } });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({ message: "Item already exists" });
    }

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
      select: { id: true, image: true },
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    deleteFileByUrl(item.image);

    await prisma.menuItem.delete({ where: { id } });
    return res.status(200).json({ message: "Deleted successfully" });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ message: "Item not found" });
    }

    console.log("DELETE_MENU_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getAllVariants(
  req: TypedRequest<GetVariantParams, {}, {}>,
  res: Response,
) {
  try {
    const { menuItemId } = req.params;

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      select: { id: true },
    });

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    const variants = await prisma.menuVariant.findMany({
      where: { menuItemId },
      orderBy: { price: "asc" },
      select: {
        id: true,
        label: true,
        price: true,
        menuItemId: true,
      },
    });

    return res
      .status(200)
      .json({ message: "Fetched all variants", data: { variants } });
  } catch (error) {
    console.log("GET_VARIANTS_ERROR", error);
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

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      select: { id: true },
    });

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    const newVariant = await prisma.menuVariant.create({
      data: {
        label,
        price: new Prisma.Decimal(price),
        menuItemId,
      },
      select: {
        id: true,
        label: true,
        price: true,
        menuItemId: true,
      },
    });

    return res.status(201).json({
      message: "Variant created successfully",
      data: { variant: newVariant },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({ message: "Variant already exists" });
    }

    console.log("CREATE_VARIANT_ERROR", error);
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

    const result = await prisma.menuVariant.updateMany({
      where: { id: variantId, menuItemId },
      data: {
        ...(label !== undefined && { label }),
        ...(price !== undefined && { price: Number(price) }),
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Variant not found" });
    }

    const updatedVariant = await prisma.menuVariant.findUnique({
      where: { id: variantId },
      select: {
        id: true,
        label: true,
        price: true,
        menuItemId: true,
      },
    });

    return res.status(200).json({
      message: "Updated successfully",
      data: { variant: updatedVariant },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({ message: "Variant already exists" });
    }

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

    const result = await prisma.menuVariant.deleteMany({
      where: { id: variantId, menuItemId },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Variant not found" });
    }

    return res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.log("DELETE_VARIANT_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
