import { Router } from "express";
import { createTable, getAllTables } from "../controllers/table.controller";

const router = Router();

router.get("/", getAllTables);
router.post("/create", createTable);

export default router;
