import { z } from "zod";

export const AdminLoginBody = z.object({
  email: z.email(),
  password: z.string().min(8).max(32),
});

export type AdminLoginBody = z.infer<typeof AdminLoginBody>;

export const CreateShopBody = z.object({
  name: z.string().optional(),
  email: z.email(),
  password: z.string().min(8).max(32),
});

export type CreateShopBody = z.infer<typeof CreateShopBody>;

export const LoginUserBody = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number"),
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export type LoginUserBody = z.infer<typeof LoginUserBody>;
