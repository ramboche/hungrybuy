import { z } from "zod";

export const CreateCategoryBody = z.object({
  name: z.string().min(3).max(10),
});

export type CreateCategoryBody = z.infer<typeof CreateCategoryBody>;

export const DeleteCategoryParams = z.object({
  id: z.string(),
});

export type DeleteCategoryParams = z.infer<typeof DeleteCategoryParams>;
