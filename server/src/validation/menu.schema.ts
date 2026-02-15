import { z } from "zod";

export const CreateMenuBody = z.object({
  name: z.string().trim(),
  description: z.string().trim().optional(),
  foodType: z.enum(["VEG", "NON_VEG"]),
  categoryId: z.uuidv4(),
  price: z.coerce.number().optional(),
});

export type CreateMenuBody = z.infer<typeof CreateMenuBody>;

export const GetMenuQuery = z.object({
  categoryId: z.uuidv4().optional(),
  foodType: z.enum(["VEG", "NON_VEG"]).optional(),
  search: z.string().min(2, "Search must be atleast two charecters").optional(),
});

export type GetMenuQuery = z.infer<typeof GetMenuQuery>;

export const UpdateMenuItemParams = z.object({
  id: z.uuidv4(),
});

export type UpdateMenuItemParams = z.infer<typeof UpdateMenuItemParams>;

export const UpdateMenuItemsBody = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().optional(),
  foodType: z.enum(["VEG", "NON_VEG"]).optional(),
  categoryId: z.uuidv4().optional(),
  isAvailable: z.coerce.boolean().optional(),
});

export type UpdateMenuItemsBody = z.infer<typeof UpdateMenuItemsBody>;

export const DeleteMenuItemParams = z.object({
  id: z.uuidv4(),
});

export type DeleteMenuItemParams = z.infer<typeof DeleteMenuItemParams>;

export const CreateVariantParams = z.object({
  menuItemId: z.uuidv4(),
});

export type CreateVariantParams = z.infer<typeof CreateVariantParams>;

export const CreateVariantBody = z.object({
  label: z.string().trim(),
  price: z.coerce.number(),
});

export type CreateVariantBody = z.infer<typeof CreateVariantBody>;

export const UpdateVariantParams = z.object({
  menuItemId: z.uuidv4(),
  variantId: z.uuidv4(),
});

export const GetVariantParams = z.object({
  menuItemId: z.uuidv4(),
});

export type GetVariantParams = z.infer<typeof GetVariantParams>;

export type UpdateVariantParams = z.infer<typeof UpdateVariantParams>;

export const UpdateVariantBody = z.object({
  label: z.string().optional(),
  price: z.coerce.number().optional(),
});

export type UpdateVariantBody = z.infer<typeof UpdateVariantBody>;

export const DeleteVariantParams = z.object({
  menuItemId: z.uuidv4(),
  variantId: z.uuidv4(),
});

export type DeleteVariantParams = z.infer<typeof DeleteVariantParams>;
