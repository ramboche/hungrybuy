import { z } from "zod";

export const GetCartParams = z.object({
  tableId: z.uuidv4(),
});

export type GetCartParams = z.infer<typeof GetCartParams>;

export const AddCartParams = z.object({
  tableId: z.uuidv4(),
});

export type AddCartParams = z.infer<typeof AddCartParams>;

export const AddCartBody = z.object({
  menuItemId: z.uuidv4(),
  variantId: z.uuidv4().optional(),
  quantity: z.coerce.number().int().min(0),
});

export type AddCartBody = z.infer<typeof AddCartBody>;

export const UpdateCartParams = z.object({
  cartId: z.uuidv4(),
});

export type UpdateCartParams = z.infer<typeof UpdateCartParams>;

export const UpdateCartBody = z.object({
  quantity: z.coerce.number().int().min(0),
});

export type UpdateCartBody = z.infer<typeof UpdateCartBody>;

export const DeleteCartParams = z.object({
  cartId: z.uuidv4(),
});

export type DeleteCartParams = z.infer<typeof DeleteCartParams>;
