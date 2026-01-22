import { Router } from "express";
import { createTable, getAllTables, resolveQr } from "../controllers/table.controller";

const router = Router();

router.get("/", getAllTables);
router.post("/create", createTable);

router.get("/qr/:qrToken", resolveQr)

export default router;
