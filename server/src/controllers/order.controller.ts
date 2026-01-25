import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import { prisma } from "../lib/prisma";

export async function createOrder(req: AuthenticatedRequest, res: Response) {
  try {
    const { tableId } = req.params;
    if (!tableId || Array.isArray(tableId)) {
      return res.status(400).json({ message: "Invalid table ID" });
    }

    const table = await prisma.table.findUnique({ where: { id: tableId } });
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { tableId },
      include: {
        menuItem: true,
        variant: true,
      },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const order = await prisma.order.create({
      data: {
        tableId,
        items: {
          create: cartItems.map((item) => ({
            menuItem: {
              connect: { id: item.menuItemId },
            },
            ...(item.variantId && {
              variant: {
                connect: { id: item.variantId },
              },
            }),
            quantity: item.quantity,
            price: item.variant ? item.variant.price : item.menuItem.price!,
          })),
        },
      },
      include: { items: true },
    });

    await prisma.cartItem.deleteMany({ where: { tableId } });

    return res
      .status(201)
      .json({ message: "Order created successfully", data: { order } });
  } catch (error) {
    console.log("CREATE_ORDER_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
