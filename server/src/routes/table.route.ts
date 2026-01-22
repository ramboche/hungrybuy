import { Router } from "express";
import { createTable } from "../controllers/table.controller";

const router = Router();

router.post("/create", createTable);

export default router;
