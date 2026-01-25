import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { attachUserMiddleware } from "./middlewares/auth.middleware";
import authRoutes from "./routes/auth.route";
import adminRoutes from "./routes/admin.route";
import tableRoutes from "./routes/table.route";
import categoryRoutes from "./routes/category.route";
import menuRoutes from "./routes/menu.route";
import cartRoutes from "./routes/cart.route";

dotenv.config();

export function startServer() {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use(attachUserMiddleware);

  app.use("/health", (_, res) => res.send("OK"));

  app.use("/auth", authRoutes);
  app.use("/admin", adminRoutes);
  app.use("/table", tableRoutes);
  app.use("/categories", categoryRoutes);
  app.use("/menu", menuRoutes);
  app.use("/cart", cartRoutes)

  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}
