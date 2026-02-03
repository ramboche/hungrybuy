import { z } from "zod";

export const AdminLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(32),
});

export const CreateShopSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(3).max(32),
});
