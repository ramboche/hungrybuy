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

export async function getAllTables(req: AuthenticatedRequest, res: Response) {
  try {
    const userRole = req.headers["x-user-role"];
    if (userRole !== "ADMIN" && userRole !== "SHOP") {
      return res.status(401).json({ message: "Forbidden" });
    }

    const tables = await prisma.table.findMany({ orderBy: { number: "asc" } });
    return res
      .status(200)
      .json({ message: "Fetched all tables", data: { tables } });
  } catch (error) {
    console.log("TABLE_GET_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function resolveQr(req: AuthenticatedRequest, res: Response) {
  try {
    const { qrToken } = req.params;

    if (!qrToken || Array.isArray(qrToken)) {
      return res.status(400).json({ message: "Invalid QR token" });
    }

    const table = await prisma.table.findUnique({ where: { qrToken } });
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    return res
      .status(200)
      .json({ message: "Table resolved successfully", data: { table } });
  } catch (error) {
    console.log("TABLE_RESOLVE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteTable(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid table ID" });
    }

    const table = await prisma.table.findUnique({ where: { id } });
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    await prisma.table.delete({ where: { id } });
    return res.status(200).json({ message: "Table deleted successfully" });
  } catch (error) {
    console.log("TABLE_DELETE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
