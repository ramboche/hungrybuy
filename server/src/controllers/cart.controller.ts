import { Response } from "express";
import { prisma } from "../lib/prisma";
import { TypedRequest } from "../types/request";
import {
  AddCartBody,
  DeleteCartParams,
  UpdateCartBody,
  UpdateCartParams,
} from "../validation/cart.schema";

export async function getCart(req: TypedRequest, res: Response) {
  try {
    const { id: tableId, restaurantId } = req.table!;

    const cart = await prisma.cartItem.findMany({
      where: {
        tableId,
        table: {
          restaurantId,
        },
      },
      select: {
        id: true,
        quantity: true,
        menuItem: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            description: true,
            foodType: true,
            isAvailable: true,
          },
        },
        variant: {
          select: {
            id: true,
            label: true,
            price: true,
          },
        },
      },
    });

    return res
      .status(200)
      .json({ message: "fetched cart successfully", data: { cart } });
  } catch (error) {
    console.log("GET_CART_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function addToCart(
  req: TypedRequest<{}, AddCartBody, {}>,
  res: Response,
) {
  try {
    const { id: tableId, restaurantId } = req.table!;
    const { menuItemId, variantId, quantity } = req.body;

    const menuItem = await prisma.menuItem.findUnique({
      where: {
        id: menuItemId,
        restaurantId,
      },
      select: {
        id: true,
        isAvailable: true,
      },
    });

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    const variantCount = await prisma.menuVariant.count({
      where: {
        menuItemId,
        menuItem: {
          restaurantId,
        },
      },
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
        select: { id: true },
      });

      if (!variant) {
        return res.status(404).json({ message: "Variant not found" });
      }
    }

    if (menuItem.isAvailable === false) {
      return res.status(400).json({ message: "Cannot add item to cart" });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        tableId,
        menuItemId,
        variantId: variantId ?? null,
        table: { restaurantId },
      },
      select: { id: true },
    });

    if (cartItem) {
      const updatedCart = await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity },
        select: {
          id: true,
          quantity: true,
          menuItem: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
              description: true,
              foodType: true,
              isAvailable: true,
            },
          },
          variant: {
            select: {
              id: true,
              label: true,
              price: true,
            },
          },
        },
      });

      return res
        .status(200)
        .json({ message: "Updated successfully", data: { item: updatedCart } });
    }

    const newItem = await prisma.cartItem.create({
      data: {
        tableId,
        menuItemId,
        variantId: variantId ?? null,
        quantity,
      },
      select: {
        id: true,
        quantity: true,
        menuItem: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            description: true,
            foodType: true,
            isAvailable: true,
          },
        },
        variant: {
          select: {
            id: true,
            label: true,
            price: true,
          },
        },
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

export async function updateCart(
  req: TypedRequest<UpdateCartParams, UpdateCartBody, {}>,
  res: Response,
) {
  try {
    const { id: tableId, restaurantId } = req.table!;
    const { cartId } = req.params;
    const { quantity } = req.body;

    const cart = await prisma.cartItem.findFirst({
      where: {
        id: cartId,
        tableId,
        table: {
          restaurantId,
        },
      },
      select: {
        tableId: true,
        menuItem: {
          select: {
            isAvailable: true,
          },
        },
      },
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (!cart.menuItem?.isAvailable) {
      return res.status(400).json({ message: "Item is no longer present" });
    }

    if (quantity === 0) {
      await prisma.cartItem.deleteMany({
        where: {
          id: cartId,
          tableId,
          table: {
            restaurantId,
          },
        },
      });

      return res.status(200).json({ message: "Deleted successfully" });
    }

    const updatedCart = await prisma.cartItem.updateMany({
      where: {
        id: cartId,
        tableId,
        table: {
          restaurantId,
        },
      },
      data: { quantity },
    });

    if (updatedCart.count === 0) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const finalCart = await prisma.cartItem.findUnique({
      where: { id: cartId },
      select: {
        id: true,
        quantity: true,
      },
    });

    return res
      .status(200)
      .json({ message: "Updated successfully", data: { cart: finalCart } });
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
    const { id: tableId, restaurantId } = req.table!;
    const { cartId } = req.params;

    const result = await prisma.cartItem.deleteMany({
      where: {
        id: cartId,
        tableId,
        table: {
          restaurantId,
        },
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Cart not found" });
    }

    return res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.log("DELETE_CART_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
