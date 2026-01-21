import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.route";
import { attachUserMiddleware } from "./middlewares/auth.middleware";

dotenv.config();

export function startServer() {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use(attachUserMiddleware);

  app.use("/health", (_, res) => res.send("OK"));

  app.use("/auth", authRoutes);

  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}
