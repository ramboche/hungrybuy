import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import { prisma } from "../lib/prisma";

export async function addToCart(req: AuthenticatedRequest, res: Response) {
  try {
    const { tableId } = req.params;
    if (!tableId || Array.isArray(tableId)) {
      return res.status(400).json({ message: "Invalid table ID" });
    }

    const { menuItemId, variantId, quantity } = req.body;
    if (!menuItemId || !variantId || !quantity || quantity < 0) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const cart = await prisma.cartItem.findUnique({
      where: {
        tableId_menuItemId_variantId: {
          tableId,
          menuItemId,
          variantId: variantId ?? null,
        },
      },
    });

    if (cart) {
      const updatedCart = await prisma.cartItem.update({
        where: { id: cart.id },
        data: { quantity },
      });

      return res
        .status(200)
        .json({ message: "Updated successfully", data: { cart: updatedCart } });
    }

    const newItem = await prisma.cartItem.create({
      data: {
        tableId,
        menuItemId,
        variantId: variantId ?? null,
        quantity,
      },
    });

    return res
      .status(201)
      .json({ message: "Added to cart successfully", data: { item: newItem } });
  } catch (error) {
    console.log("ADD_TO_CART_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getCart(req: AuthenticatedRequest, res: Response) {
  try {
    const { tableId } = req.params;
    if (!tableId || Array.isArray(tableId)) {
      return res.status(400).json({ message: "Invalid table ID" });
    }

    const cart = await prisma.cartItem.findMany({
      where: {
        tableId,
      },
      include: {
        menuItem: true,
        variant: true,
      },
    });

    return res
      .status(200)
      .json({ messaage: "fetched cart successfully", data: { cart } });
  } catch (error) {
    console.log("GET_CART_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
