import { pgTable, text, numeric, timestamp, decimal } from "drizzle-orm/pg-core";
import { user } from "@/db/schema";
import { productTable } from "@/product/productTable.sql";
import { sql } from "drizzle-orm";

export const reviewTable = pgTable("review", {
  id: text("id").primaryKey(),
  userID: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  productID: text("product_id")
    .notNull()
    .references(() => productTable.id, { onDelete: "cascade" }),
  rating: decimal("rating").notNull(), // 1-5 star rating
  comment: text("comment"), // Optional review text
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at").$defaultFn(() => sql`null`),
});


