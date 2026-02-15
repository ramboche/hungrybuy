import { z } from "zod";

export const CreateTableBody = z.object({
  number: z.coerce.number().int().min(1).max(500),
});

export type CreateTableBody = z.infer<typeof CreateTableBody>;

export const ResolveQrParams = z.object({
  qrToken: z.string().trim().min(10).max(500),
});

export type ResolveQrParams = z.infer<typeof ResolveQrParams>;

export const DeleteTableParams = z.object({
  id: z.uuidv4(),
});

export type DeleteTableParams = z.infer<typeof DeleteTableParams>;

export const GenerateTableQrParams = z.object({
  id: z.uuidv4(),
});

export type GenerateTableQrParams = z.infer<typeof GenerateTableQrParams>;
