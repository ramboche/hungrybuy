import { Response } from "express";
import { prisma } from "../lib/prisma";
import { TypedRequest } from "../types/request";
import {
  UpdateOrderParams,
  UpdateOrderStatusBody,
} from "../validation/order.schema";
import { Prisma } from "@prisma/client";

export async function getAllOrders(req: TypedRequest, res: Response) {
  try {
    const { id: restaurantId } = req.restaurant!;

    const orders = await prisma.order.findMany({
      where: { restaurantId },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        tableId: true,
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            menuItem: { select: { name: true } },
            variant: { select: { label: true } },
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
    const { id: tableId, restaurantId } = req.table!;

    const orders = await prisma.order.findMany({
      where: {
        tableId,
        isActive: true,
        restaurantId,
        table: {
          restaurantId,
        },
      },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            menuItem: { select: { name: true } },
            variant: { select: { label: true } },
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
    const { id: restaurantId } = req.restaurant!;

    const isActive = !(status === "PAID" || status === "CANCELLED");

    const result = await prisma.order.updateMany({
      where: {
        id: orderId,
        restaurantId,
      },
      data: {
        status,
        isActive,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const updatedOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
        restaurantId,
      },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        tableId: true,
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            menuItem: { select: { name: true } },
            variant: { select: { label: true } },
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

export async function createOrder(req: TypedRequest, res: Response) {
  try {
    const { id: tableId, restaurantId } = req.table!;

    const result = await prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: {
          tableId,
          table: {
            restaurantId,
          },
        },
        select: {
          id: true,
          quantity: true,
          menuItemId: true,
          variantId: true,
          menuItem: {
            select: {
              price: true,
              isAvailable: true,
              restaurantId: true,
            },
          },
          variant: {
            select: {
              price: true,
            },
          },
        },
      });

      if (cartItems.length === 0) {
        throw new Error("EMPTY_CART");
      }

      let totalAmount = new Prisma.Decimal(0);

      const orderItems = cartItems.map((item) => {
        if (item.menuItem.restaurantId !== restaurantId) {
          throw new Error("TENANT_MISMATCH");
        }

        if (item.menuItem.isAvailable === false) {
          throw new Error("ITEM_NOT_AVAILABLE");
        }

        const unitPrice = item.variant?.price ?? item.menuItem.price;

        if (!unitPrice) {
          throw new Error("INVALID_PRICE");
        }

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
          restaurantId,
          totalAmount,
          isActive: true,
          items: {
            create: orderItems,
          },
        },
        select: {
          id: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
            },
          },
        },
      });

      await tx.cartItem.deleteMany({
        where: {
          tableId,
          table: {
            restaurantId,
          },
        },
      });

      return newOrder;
    });

    return res
      .status(201)
      .json({ message: "Order created successfully", data: { result } });
  } catch (error: any) {
    if (error?.message === "TENANT_MISMATCH") {
      return res.status(403).json({ message: "Forbidden" });
    }

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
