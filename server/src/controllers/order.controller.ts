import { Response } from "express";
import { prisma } from "../lib/prisma";
import { TypedRequest } from "../types/request";
import {
  UpdateOrderParams,
  UpdateOrderStatusBody,
} from "../validation/order.schema";
import { Prisma } from "@prisma/client";

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
      orderBy: { createdAt: "desc" },
    });

    return res
      .status(200)
      .json({ message: "Fetched all orders", data: { orders } });
  } catch (error) {
    console.log("GET_ORDERS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getActiveOrders(req: TypedRequest, res: Response) {
  try {
    const { id: tableId } = req.table!;

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

export async function updateOrderStatus(
  req: TypedRequest<UpdateOrderParams, UpdateOrderStatusBody, {}>,
  res: Response,
) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const isActive = !(status === "PAID" || status === "CANCELLED");

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
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("UPDATE_ORDER_STATUS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function createOrder(req: TypedRequest, res: Response) {
  try {
    const { id: tableId } = req.table!;

    const result = await prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { tableId },
        include: {
          menuItem: true,
          variant: true,
        },
      });

      if (cartItems.length === 0) {
        throw new Error("EMPTY_CART");
      }

      let totalAmount = new Prisma.Decimal(0);

      const orderItems = cartItems.map((item) => {
        if (item.menuItem.isAvailable === false) {
          throw new Error("ITEM_NOT_AVAILABLE");
        }

        const unitPrice = item.variant?.price ?? item.menuItem.price!;

        const lineTotal = unitPrice.mul(item.quantity);
        totalAmount = totalAmount.add(lineTotal);

        return {
          quantity: item.quantity,
          price: unitPrice,
          menuItem: {
            connect: { id: item.menuItemId },
          },
          ...(item.variantId && {
            variant: {
              connect: { id: item.variantId },
            },
          }),
        };
      });

      const newOrder = await tx.order.create({
        data: {
          tableId,
          totalAmount,
          isActive: true,
          items: {
            create: orderItems,
          },
        },
      });

      await tx.cartItem.deleteMany({ where: { tableId } });

      return newOrder;
    });

    return res
      .status(201)
      .json({ message: "Order created successfully", data: { result } });
  } catch (error: any) {
    if (error?.message === "EMPTY_CART") {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (error?.message === "ITEM_NOT_AVAILABLE") {
      return res.status(400).json({ message: "Item is not available" });
    }

    console.log("CREATE_ORDER_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
