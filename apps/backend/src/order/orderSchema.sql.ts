import { pgTable, text, integer, real, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "@/db/schema";
import { productTable } from "@/product/productTable.sql";
import { addressTable } from "@/address/addressSchema.sql";

export const orderTable = pgTable("order", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userID: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  addressID: uuid("address_id").notNull().references(() => addressTable.id, { onDelete: "restrict" }),
  productID: text("product_id").notNull().references(() => productTable.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  totalPrice: real("total_price").notNull(),
  subtotal: real("subtotal").notNull(),
  taxAmount: real("tax_amount").notNull().$defaultFn(() => 0),
  shippingCost: real("shipping_cost").notNull().$defaultFn(() => 0),
  discountAmount: real("discount_amount").notNull().$defaultFn(() => 0),
  grandTotal: real("grand_total").notNull(),
  deliveryStatus: text("delivery_status", { 
    enum: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] 
  }).notNull().$defaultFn(() => "PENDING"),
  paymentStatus: text("payment_status", { 
    enum: ["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"] 
  }).notNull().$defaultFn(() => "PENDING"),
  orderStatus: text("order_status", { 
    enum: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] 
  }).notNull().$defaultFn(() => "PENDING"),
  paymentMethod: text("payment_method"),
  trackingNumber: text("tracking_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"),
  refundAmount: real("refund_amount").$defaultFn(() => 0),
});
