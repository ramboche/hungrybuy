import { z } from "zod";

export const CreateCategoryBody = z.object({
  name: z.string().trim().toLowerCase().min(3).max(10),
});

export type CreateCategoryBody = z.infer<typeof CreateCategoryBody>;

export const DeleteCategoryParams = z.object({
  id: z.uuidv4(),
});

export type DeleteCategoryParams = z.infer<typeof DeleteCategoryParams>;
