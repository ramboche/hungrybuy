import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import { prisma } from "../lib/prisma";
import { generateQrToken } from "../utils/qr";

export async function createTable(req: AuthenticatedRequest, res: Response) {
  try {
    const userRole = req.headers["x-user-role"];
    if (userRole !== "ADMIN" && userRole !== "SHOP") {
      return res.status(401).json({ message: "Forbidden" });
    }

    const { number } = req.body;
    if (!number || number <= 0) {
      return res.status(400).json({ message: "Invalid table number" });
    }

    const table = await prisma.table.findUnique({ where: { number } });
    if (table) {
      return res.status(409).json({ message: "Table already exists" });
    }

    const newTable = await prisma.table.create({
      data: {
        number,
        qrToken: generateQrToken(),
      },
    });

    return res.status(201).json({
      message: "Table created successfully",
      data: {
        table: {
          id: newTable.id,
          number: newTable.number,
          qrToken: newTable.qrToken,
        },
      },
    });
  } catch (error) {
    console.log("TABLE_CREATE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
