import { z } from "zod";

export const createOrderSchema = z.object({
  userID: z.string().min(1),
  addressID: z.string().min(1),
  productID: z.string().min(1),
  quantity: z.number().int().positive(),
  taxAmount: z.number().min(0).optional().default(0),
  shippingCost: z.number().min(0).optional().default(0),
  discountAmount: z.number().min(0).optional().default(0),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateOrder = z.infer<typeof createOrderSchema>;

export const getOrderListQueryParameterSchema = z.object({
  userID: z.string().min(1).optional(),
  deliveryStatus: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"]).optional(),
  orderStatus: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  _start: z.string().optional(),
  _end: z.string().optional(),
});

export type GetOrderListQueryParameters = z.infer<typeof getOrderListQueryParameterSchema>;

export const getOrderByIdQueryParameterSchema = z.object({
  orderID: z.string().min(1),
});

export type GetOrderByIdQueryParameters = z.infer<typeof getOrderByIdQueryParameterSchema>;

export const updateOrderSchema = z.object({
  deliveryStatus: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"]).optional(),
  orderStatus: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
  cancellationReason: z.string().optional(),
  refundAmount: z.number().min(0).optional(),
});

export type UpdateOrder = z.infer<typeof updateOrderSchema> & { orderID: string };

export const cancelOrderSchema = z.object({
  reason: z.string().min(1).optional(),
  refundAmount: z.number().min(0).optional(),
});

export type CancelOrder = z.infer<typeof cancelOrderSchema> & { orderID: string };
