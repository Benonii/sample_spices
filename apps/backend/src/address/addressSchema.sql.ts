import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  index,
  unique,
  PgTable,
} from "drizzle-orm/pg-core";
import { user } from "@/db/schema";

export const addressTable = pgTable("address", {
  id: uuid("id").primaryKey().defaultRandom(),
  addressLine1: text("address_line_1").notNull(),
  addressLine2: text("address_line_2"),
  state: text("state").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
}, (table) => ({
  locationIdx: index("address_location_idx").on(table.city, table.state),
  postalCodeIdx: index("address_postal_code_idx").on(table.postalCode),
}));

export const userAddress = pgTable("user_address", {
  id: uuid("id").primaryKey().defaultRandom(),
  userID: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  addressID: uuid("address_id")
    .notNull()
    .references(() => addressTable.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  isDefault: boolean("is_default")
    .$defaultFn(() => false)
    .notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
}, (table) => ({
  userIdIdx: index("user_address_user_id_idx").on(table.userID),
  addressIdIdx: index("user_address_address_id_idx").on(table.addressID),
  // Unique constraint to prevent duplicate user-address combinations
  uniqueUserAddress: unique("unique_user_address").on(
    table.userID,
    table.addressID
  ),
}));

export type NewAddress = typeof addressTable.$inferInsert;
export type Address = typeof addressTable.$inferSelect;
export type NewUserAddress = typeof userAddress.$inferInsert;
export type UserAddress = typeof userAddress.$inferSelect;

// New type for complete address response
export type CompleteAddress = {
  id: string;
  userID: string;
  firstName: string;
  lastName: string;
  phone: string;
  isDefault: boolean;
  addressLine1: string;
  addressLine2: string | null;
  state: string;
  city: string;
  postalCode: string;
  createdAt: Date;
  updatedAt: Date;
};
