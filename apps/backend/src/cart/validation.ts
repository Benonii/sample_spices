import { z } from "zod";

// Schema for adding items to cart
export const addToCartSchema = z.object({
  productID: z.string().min(1, "Product ID is required"),
  userID: z.string().min(1, "User ID is required"),
  quantity: z.number().int().positive().min(1, "Quantity must be at least 1"),
});

// Schema for updating cart items
export const updateCartItemSchema = z.object({
  id: z.string().min(1, "Cart item ID is required"),
  quantity: z.number().int().positive().min(1, "Quantity must be at least 1"),
  userID: z.string().min(1, "User ID is required"),
});

// Schema for deleting cart items
export const deleteCartItemSchema = z.object({
  id: z.string().min(1, "Cart item ID is required"),
});

// Schema for querying cart items with pagination and filtering
export const getCartItemsSchema = z.object({
  page: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive().default(1)),
  limit: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive().min(1).max(100).default(20)),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  userID: z.string().min(1, "User ID is required"),
});

// Schema for cart item response
export const cartItemResponseSchema = z.object({
  id: z.string(),
  userID: z.string(),
  productID: z.string(),
  quantity: z.number(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  productName: z.string().optional(),
  productPrice: z.number().optional(),
  productStatus: z.string().optional(),
  productImage: z.string().optional(),
  productDescription: z.string().optional(),
});

// Schema for cart items list response
export const cartItemsListResponseSchema = z.object({
  items: z.array(cartItemResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// Schema for checkout
export const checkoutSchema = z.object({
  checkoutItems: z.object({
    productID: z.string().min(1, "Product ID is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  }).array(),
  addressID: z.string().min(1, "Address ID is required"),
  userID: z.string().min(1, "User ID is required"),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type DeleteCartItemInput = z.infer<typeof deleteCartItemSchema>;
export type GetCartItemsInput = z.infer<typeof getCartItemsSchema>;
export type CartItemResponse = z.infer<typeof cartItemResponseSchema>;
export type CartItemsListResponse = z.infer<typeof cartItemsListResponseSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
