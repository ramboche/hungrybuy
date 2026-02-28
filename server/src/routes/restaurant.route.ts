import { Router } from "express";
import { requireRole } from "../middlewares/role.middleware";
import {
  createRestaurant,
  getRestaurants,
} from "../controllers/restaurant.controller";
import { validate } from "../middlewares/validate.middleware";
import { CreateRestaurantBody } from "../validation/auth.schema";

const router = Router();

router.get("/all", requireRole(["PLATFORM_ADMIN"]), getRestaurants);

router.post(
  "/create",
  requireRole(["PLATFORM_ADMIN"]),
  validate(CreateRestaurantBody),
  createRestaurant,
);

export default router;
