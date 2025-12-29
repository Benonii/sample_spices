import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { user } from "@/db/schema";
import { productTable } from "@/product/productTable.sql";
import { sql } from "drizzle-orm";

export const cartTable = pgTable("cart", {
  id: text("id").primaryKey(),
  userID: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  productID: text("product_id")
    .notNull()
    .references(() => productTable.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().$defaultFn(() => 1),
  isActive: boolean("is_active").notNull().$defaultFn(() => true),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at").$defaultFn(() => sql`null`),
});

export type NewCartItem = typeof cartTable.$inferInsert;

// Index for better query performance
export const cartIndexes = {
  userProductIdx: "user_product_idx",
  userActiveIdx: "user_active_idx",
};
