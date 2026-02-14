import { z } from "zod";

export const SendOtpBody = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number"),
});

export type SendOtpBody = z.infer<typeof SendOtpBody>;
