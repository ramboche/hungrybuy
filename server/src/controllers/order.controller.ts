import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import { prisma } from "../lib/prisma";
import { TypedRequest } from "../types/request";
import {
  ActiveOrdersParams,
  CreateOrderParams,
  UpdateOrderParams,
  UpdateOrderStatusBody,
} from "../validation/order.schema";

export async function createOrder(
  req: TypedRequest<CreateOrderParams, {}, {}>,
  res: Response,
) {
  try {
    const { tableId } = req.params;

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

export async function getActiveOrders(
  req: TypedRequest<ActiveOrdersParams, {}, {}>,
  res: Response,
) {
  try {
    const { tableId } = req.params;

    const table = await prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    const orders = await prisma.order.findMany({
      where: {
        tableId,
        isActive: true,
      },
      include: {
        items: {
          include: {
            menuItem: true,
            variant: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return res
      .status(200)
      .json({ message: "Fetched all active orders", data: { orders } });
  } catch (error) {
    console.log("GET_ACTIVE_ORDERS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getAllOrders(_: TypedRequest, res: Response) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            menuItem: true,
            variant: true,
          },
        },
      },
    });

    return res
      .status(200)
      .json({ message: "Fetched all orders", data: { orders } });
  } catch (error) {
    console.log("GET_ORDERS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateOrderStatus(
  req: TypedRequest<UpdateOrderParams, UpdateOrderStatusBody, {}>,
  res: Response,
) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    let isActive = true;
    if (status === "PAID") {
      isActive = false;
    } else {
      isActive = true;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        isActive,
      },
      include: {
        items: {
          include: {
            menuItem: true,
            variant: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Status updated successfully",
      data: { order: updatedOrder },
    });
  } catch (error) {
    console.log("UPDATE_ORDER_STATUS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
