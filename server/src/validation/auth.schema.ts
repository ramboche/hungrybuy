import { z } from "zod";

const emailSchema = z.email().trim().toLowerCase();

const passwordSchema = z.string().trim().min(8).max(32);

const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s\-()]/g, ""))
  .pipe(z.string().regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number"));

const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "OTP must be 6 digits");

const nameSchema = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .optional();

export const AdminLoginBody = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type AdminLoginBody = z.infer<typeof AdminLoginBody>;

export const CreateShopBody = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type CreateShopBody = z.infer<typeof CreateShopBody>;

export const LoginUserBody = z.object({
  phone: phoneSchema,
  otp: otpSchema,
});

export type LoginUserBody = z.infer<typeof LoginUserBody>;

export const SendOtpBody = z.object({
  phone: phoneSchema,
});

export type SendOtpBody = z.infer<typeof SendOtpBody>;

export const RefreshTokenBody = z.object({
  refreshToken: z.string().trim().min(10).max(500),
});

export type RefreshTokenBody = z.infer<typeof RefreshTokenBody>;
