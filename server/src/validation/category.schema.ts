import { z } from "zod";

export const CreateCategoryBody = z.object({
  name: z.string().trim().toLowerCase().min(3).max(10),
});

export type CreateCategoryBody = z.infer<typeof CreateCategoryBody>;

export const DeleteCategoryParams = z.object({
  id: z.uuidv4(),
});

export type DeleteCategoryParams = z.infer<typeof DeleteCategoryParams>;


export const UpdateCategoryParams = z.object({
  id: z.uuidv4(), 
});

export type UpdateCategoryParams = z.infer<typeof UpdateCategoryParams>;

export const UpdateCategoryBody = z.object({
  name: z.string().trim().min(3).max(15).optional(),
});

export type UpdateCategoryBody = z.infer<typeof UpdateCategoryBody>;