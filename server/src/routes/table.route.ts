import { Router } from "express";
import {
  createTable,
  deleteTable,
  getAllTables,
  resolveQr,
} from "../controllers/table.controller";

const router = Router();

router.get("/", getAllTables);
router.post("/create", createTable);
router.delete("/:id", deleteTable);

router.get("/qr/:qrToken", resolveQr);

export default router;
