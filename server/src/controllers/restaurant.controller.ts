import { Response } from "express";
import { prisma } from "../lib/prisma";
import { TypedRequest } from "../types/request";
import { CreateRestaurantBody } from "../validation/auth.schema";
import { hashPassword } from "../utils/hash";

export async function getRestaurants(_: TypedRequest, res: Response) {
  try {
    const shops = await prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        logo: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      message: "Shops fetched successfully",
      data: { shops },
    });
  } catch (error) {
    console.log("GET_SHOP_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function createRestaurant(
  req: TypedRequest<{}, CreateRestaurantBody, {}>,
  res: Response,
) {
  try {
    const { name, email, password } = req.body;

    const shop = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (shop) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
      const newRestaurantUser = await tx.user.create({
        data: {
          name: name ?? "Shop",
          email,
          password: hashedPassword,
          role: "RESTAURANT_OWNER",
        },
      });

      const newRestaurant = await tx.restaurant.create({
        data: {
          name: newRestaurantUser.name,
          ownerId: newRestaurantUser.id,
          isActive: true,
        },
      });

      return { newRestaurantUser, newRestaurant };
    });

    return res.status(201).json({
      message: "Shop created successfully",
      data: {
        user: {
          name: result.newRestaurantUser.name,
          email: result.newRestaurantUser.email,
        },
        restaurant: result.newRestaurant,
      },
    });
  } catch (error) {
    console.log("SHOP_REGISTER_ERROR:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
