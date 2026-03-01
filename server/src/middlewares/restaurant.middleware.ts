import { NextFunction, Response } from "express";
import { TypedRequest } from "../types/request";
import { prisma } from "../lib/prisma";

export async function resolveTenant(
  req: TypedRequest,
  _: Response,
  next: NextFunction,
) {
  try {
    const { role } = req.user!;

    if (role === "CUSTOMER") {
      const host = req.headers.referer;
      const restaurant = await prisma.restaurant.findUnique({
        where: { slug: host },
      });

      if (restaurant) {
        req.restaurant = {
          id: restaurant.id,
          name: restaurant.name,
          isActive: restaurant.isActive,
        };
      }
    } else if (role === "RESTAURANT_OWNER") {
      const { restaurantId } = req.user!;
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
      });

      console.log(restaurant);

      if (restaurant) {
        req.restaurant = {
          id: restaurant.id,
          name: restaurant.name,
          isActive: restaurant.isActive,
        };
      }
    }
  } catch (error) {
    console.log("error: tenant", error);
  } finally {
    next();
  }
}
