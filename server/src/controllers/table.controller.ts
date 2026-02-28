import { Response } from "express";
import QRCode from "qrcode";
import { prisma } from "../lib/prisma";
import { generateQrToken } from "../utils/qr";
import { TypedRequest } from "../types/request";
import {
  CreateTableBody,
  DeleteTableParams,
  GenerateTableQrParams,
  ResolveQrParams,
} from "../validation/table.schema";
import { generateTableToken } from "../utils/jwt";

export async function getAllTables(req: TypedRequest, res: Response) {
  try {
    const { id: restaurantId } = req.restaurant!;

    const tables = await prisma.table.findMany({
      where: { restaurantId },
      orderBy: { number: "asc" },
      select: {
        id: true,
        number: true,
        qrToken: true,
      },
    });

    return res
      .status(200)
      .json({ message: "Fetched all tables", data: { tables } });
  } catch (error) {
    console.log("TABLE_GET_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function createTable(
  req: TypedRequest<{}, CreateTableBody, {}>,
  res: Response,
) {
  try {
    const { id: restaurantId } = req.restaurant!;
    const { number } = req.body;

    const newTable = await prisma.table.create({
      data: {
        number,
        restaurantId,
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
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({ message: "Table already exists" });
    }

    console.log("TABLE_CREATE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteTable(
  req: TypedRequest<DeleteTableParams, {}, {}>,
  res: Response,
) {
  try {
    const { id: restaurantId } = req.restaurant!;
    const { id } = req.params;

    const deleted = await prisma.table.deleteMany({
      where: { id, restaurantId },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: "Table not found" });
    }

    return res.status(200).json({ message: "Table deleted successfully" });
  } catch (error) {
    console.log("TABLE_DELETE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function generateTableQr(
  req: TypedRequest<GenerateTableQrParams, {}, {}>,
  res: Response,
) {
  try {
    const { id: restaurantId } = req.restaurant!;
    const { id } = req.params;

    const table = await prisma.table.findFirst({
      where: { id, restaurantId },
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    const qrUrl = `${process.env.FRONTEND_URL}/?table=${table.qrToken}`;

    const qrImage = await QRCode.toBuffer(qrUrl, {
      type: "png",
      errorCorrectionLevel: "H",
      margin: 2,
      width: 300,
    });

    res.setHeader("Content-Type", "image/png");
    res.send(qrImage);
  } catch (error) {
    console.log("TABLE_QR_GEN_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function resolveQr(
  req: TypedRequest<ResolveQrParams, {}, {}>,
  res: Response,
) {
  try {
    const { qrToken } = req.params;

    const table = await prisma.table.findUnique({
      where: { qrToken },
      select: { id: true, number: true, restaurantId: true },
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    const tableToken = generateTableToken({
      id: table.id,
      number: table.number,
      restaurantId: table.restaurantId,
    });

    return res.status(200).json({
      message: "Table resolved successfully",
      data: { tableNumber: table.number, tableToken },
    });
  } catch (error) {
    console.log("TABLE_RESOLVE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
