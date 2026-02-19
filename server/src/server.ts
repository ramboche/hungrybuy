import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { httpLogger } from "./lib/httpLogger";
import { attachUserMiddleware } from "./middlewares/user.middleware";
import authRoutes from "./routes/auth.route";
import adminRoutes from "./routes/admin.route";
import tableRoutes from "./routes/table.route";
import categoryRoutes from "./routes/category.route";
import menuRoutes from "./routes/menu.route";
import cartRoutes from "./routes/cart.route";
import createOrder from "./routes/order.route";
import { logger } from "./lib/logger";

dotenv.config();

export function startServer() {
  const app = express();

  app.use(express.json({ limit: "10kb" }));
  app.use(cors({ origin: process.env.FRONTEND_URL!, credentials: true }));
  app.use(httpLogger);

  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.use(attachUserMiddleware);

  app.use("/health", (_, res) => res.send("OK"));

  app.use("/auth", authRoutes);
  app.use("/admin", adminRoutes);
  app.use("/table", tableRoutes);
  app.use("/categories", categoryRoutes);
  app.use("/menu", menuRoutes);
  app.use("/cart", cartRoutes);
  app.use("/order", createOrder);

  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}
