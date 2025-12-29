import { pgTable, text, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { user } from "@/db/schema";
import { sql } from "drizzle-orm";

export const productTable = pgTable("product", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  userID: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  rating: real("rating").notNull().$defaultFn(() => 0), // Default to 0, will be calculated from reviews
  price: real("price").notNull(),
  status: text("status", { enum: ["ACTIVE", "INACTIVE", "ARCHIVED"] })
    .notNull()
    .$defaultFn(() => "ACTIVE"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at").$defaultFn(() => sql`null`),
});

// New table for product images
export const productImages = pgTable("product_images", {
  id: text("id").primaryKey(),
  productID: text("product_id")
    .notNull()
    .references(() => productTable.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  imagePath: text("image_path").notNull(), // Path in Supabase storage
  fileName: text("file_name").notNull(),
  isPrimary: boolean("is_primary").notNull().$defaultFn(() => false),
  orderIndex: integer("order_index").notNull().$defaultFn(() => 0),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Product review table for calculating ratings
export const productReview = pgTable("product_review", {
  id: text("id").primaryKey(),
  productID: text("product_id")
    .notNull()
    .references(() => productTable.id, { onDelete: "cascade" }),
  userID: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5 rating
  comment: text("comment"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Product category table for organizing products
export const productCategory = pgTable("product_category", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at")
    .notNull(),
  updatedAt: timestamp("updated_at")
    .notNull(),
});

// Product-category relationship table (many-to-many)
export const productCategoryRelation = pgTable("product_category_relation", {
  id: text("id").primaryKey(),
  productID: text("product_id")
    .notNull()
    .references(() => productTable.id, { onDelete: "cascade" }),
  categoryID: text("category_id")
    .notNull()
    .references(() => productCategory.id, { onDelete: "cascade" }),
  categoryName: text("category_name").notNull(),
  createdAt: timestamp("created_at")
    .notNull(),
});

// Product inventory table for tracking stock
export const productInventory = pgTable("product_inventory", {
  id: text("id").primaryKey(),
  productID: text("product_id")
    .notNull()
    .references(() => productTable.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().$defaultFn(() => 0),
  reservedQuantity: integer("reserved_quantity").notNull().$defaultFn(() => 0),
  lowStockThreshold: integer("low_stock_threshold").notNull().$defaultFn(() => 10),
  createdAt: timestamp("created_at")
    .notNull(),
  updatedAt: timestamp("updated_at")
    .notNull(),
});

// Export types for TypeScript
export type Product = typeof productTable.$inferSelect;
export type NewProduct = typeof productTable.$inferInsert;
export type ProductStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type ProductReview = typeof productReview.$inferSelect;
export type NewProductReview = typeof productReview.$inferInsert;

export type ProductCategory = typeof productCategory.$inferSelect;
export type NewProductCategory = typeof productCategory.$inferInsert;

export type ProductInventory = typeof productInventory.$inferSelect;
export type NewProductInventory = typeof productInventory.$inferInsert;

export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
