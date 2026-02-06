import { Response } from "express";
import { prisma } from "../lib/prisma";
import { TypedRequest } from "../types/request";
import {
  AddCartBody,
  AddCartParams,
  DeleteCartParams,
  GetCartParams,
  UpdateCartBody,
  UpdateCartParams,
} from "../validation/cart.schema";

export async function addToCart(
  req: TypedRequest<AddCartParams, AddCartBody, {}>,
  res: Response,
) {
  try {
    const { tableId } = req.params;

    const table = await prisma.table.findUnique({ where: { id: tableId } });
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    const { menuItemId, variantId, quantity } = req.body;

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    const variantCount = await prisma.menuVariant.count({
      where: { menuItemId },
    });

    if (variantCount > 0 && !variantId) {
      return res.status(400).json({ message: "Variant is required" });
    }

    if (variantCount === 0 && variantId) {
      return res.status(400).json({ message: "Invalid variant" });
    }

    if (variantId) {
      const variant = await prisma.menuVariant.findFirst({
        where: { id: variantId, menuItemId },
      });

      if (!variant) {
        return res.status(404).json({ message: "Variant not found" });
      }
    }

    if (menuItem.isAvailable === false) {
      return res.status(400).json({ message: "Cannot add item to cart" });
    }

    const cart = await prisma.cartItem.findFirst({
      where: {
        tableId,
        menuItemId,
        variantId: variantId ?? null,
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

export async function getCart(
  req: TypedRequest<GetCartParams, {}, {}>,
  res: Response,
) {
  try {
    const { tableId } = req.params;

    const table = await prisma.table.findUnique({ where: { id: tableId } });
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    const cart = await prisma.cartItem.findMany({
      where: { tableId },
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

export async function updateCart(
  req: TypedRequest<UpdateCartParams, UpdateCartBody, {}>,
  res: Response,
) {
  try {
    const { cartId } = req.params;
    const { quantity } = req.body;

    const cart = await prisma.cartItem.findUnique({
      where: { id: cartId },
      include: { menuItem: true },
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (!cart.menuItem.isAvailable) {
      return res.status(400).json({ message: "Item is no longer present" });
    }

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: cartId } });
      return res.status(200).json({ message: "Deleted successfully" });
    }

    const updatedCart = await prisma.cartItem.update({
      where: { id: cartId },
      data: { quantity },
    });

    return res
      .status(200)
      .json({ message: "Updated successfully", data: { cart: updatedCart } });
  } catch (error) {
    console.log("UPDATE_CART_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteCartItem(
  req: TypedRequest<DeleteCartParams, {}, {}>,
  res: Response,
) {
  try {
    const { cartId } = req.params;

    const cart = await prisma.cartItem.findUnique({
      where: { id: cartId },
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    await prisma.cartItem.delete({
      where: { id: cartId },
    });

    return res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.log("DELETE_CART_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
