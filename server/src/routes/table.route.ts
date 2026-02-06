import { Router } from "express";
import {
  createTable,
  deleteTable,
  getAllTables,
  generateTableQr,
  resolveQr,
} from "../controllers/table.controller";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  CreateTableBody,
  DeleteTableParams,
  GenerateTableQrParams,
  ResolveQrParams,
} from "../validation/table.schema";

const router = Router();

router.get("/", requireRole(["ADMIN", "SHOP"]), getAllTables);

router.post(
  "/create",
  requireRole(["ADMIN", "SHOP"]),
  validate(CreateTableBody),
  createTable,
);

router.delete(
  "/:id",
  requireRole(["ADMIN", "SHOP"]),
  validate(DeleteTableParams, "params"),
  deleteTable,
);

router.get(
  "/:id/qr",
  requireRole(["ADMIN", "SHOP"]),
  validate(GenerateTableQrParams, "params"),
  generateTableQr,
);

router.get(
  "/qr/:qrToken",
  requireRole(["ADMIN", "SHOP", "USER"]),
  validate(ResolveQrParams, "params"),
  resolveQr,
);

export default router;
