import { z } from "zod";

export const CreateTableBody = z.object({
  number: z.number().int().min(1),
});

export type CreateTableBody = z.infer<typeof CreateTableBody>;

export const ResolveQrParams = z.object({
  qrToken: z.string(),
});

export type ResolveQrParams = z.infer<typeof ResolveQrParams>;

export const DeleteTableParams = z.object({
  id: z.string(),
});

export type DeleteTableParams = z.infer<typeof DeleteTableParams>;

export const GenerateTableQrParams = z.object({
  id: z.string(),
});

export type GenerateTableQrParams = z.infer<typeof GenerateTableQrParams>;
