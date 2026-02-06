import { z } from "zod";

export const CreateMenuBody = z.object({
  name: z.string(),
  foodType: z.enum(["VEG", "NON_VEG"]),
  categoryId: z.string(),
  price: z.number().optional(),
  description: z.string().optional(),
});

export type CreateMenuBody = z.infer<typeof CreateMenuBody>;

export const GetMenuQuery = z.object({
  categoryId: z.string().optional(),
  foodType: z.enum(["VEG", "NON_VEG"]).optional(),
  search: z.string().optional(),
});

export type GetMenuQuery = z.infer<typeof GetMenuQuery>;

export const UpdateMenuItemParams = z.object({
  id: z.string(),
});

export type UpdateMenuItemParams = z.infer<typeof UpdateMenuItemParams>;

export const UpdateMenuItemsBody = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  foodType: z.enum(["VEG", "NON_VEG"]).optional(),
  categoryId: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

export type UpdateMenuItemsBody = z.infer<typeof UpdateMenuItemsBody>;

export const DeleteMenuItemParams = z.object({
  id: z.string(),
});

export type DeleteMenuItemParams = z.infer<typeof DeleteMenuItemParams>;

export const CreateVariantParams = z.object({
  menuItemId: z.string(),
});

export type CreateVariantParams = z.infer<typeof CreateVariantParams>;

export const CreateVariantBody = z.object({
  label: z.string(),
  price: z.number(),
});

export type CreateVariantBody = z.infer<typeof CreateVariantBody>;

export const UpdateVariantParams = z.object({
  menuItemId: z.string(),
  variantId: z.string(),
});

export const GetVariantParams = z.object({
  menuItemId: z.string(),
});

export type GetVariantParams = z.infer<typeof GetVariantParams>;

export type UpdateVariantParams = z.infer<typeof UpdateVariantParams>;

export const UpdateVariantBody = z.object({
  label: z.string().optional(),
  price: z.number().optional(),
});

export type UpdateVariantBody = z.infer<typeof UpdateVariantBody>;

export const DeleteVariantParams = z.object({
  menuItemId: z.string(),
  variantId: z.string(),
});

export type DeleteVariantParams = z.infer<typeof DeleteVariantParams>;
