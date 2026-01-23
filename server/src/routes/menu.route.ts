import { Router } from "express";
import {
  createMenuItem,
  createVariant,
  deleteMenuItem,
  getAllVariants,
  getMenu,
  updateMenuItem,
  updateVariant,
} from "../controllers/menu.controller";

const router = Router();

router.get("/", getMenu);
router.post("/create", createMenuItem);
router.patch("/:id", updateMenuItem);
router.delete("/:id", deleteMenuItem);

router.get("/:menuItemId/variants", getAllVariants);
router.post("/:menuItemId/variants", createVariant);
router.patch("/:menuItemId/variants/:variantId", updateVariant);

export default router;
