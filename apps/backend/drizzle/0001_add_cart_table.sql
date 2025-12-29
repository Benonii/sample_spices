-- Migration: Add cart table
-- This migration adds a cart table for managing user shopping carts

CREATE TABLE "cart" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" text NOT NULL,
	"quantity" integer NOT NULL DEFAULT 1,
	"is_active" boolean NOT NULL DEFAULT true,
	"created_at" timestamp NOT NULL DEFAULT now(),
	"updated_at" timestamp NOT NULL DEFAULT now(),
	"deleted_at" timestamp
);

-- Add foreign key constraints
ALTER TABLE "cart" ADD CONSTRAINT "cart_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
ALTER TABLE "cart" ADD CONSTRAINT "cart_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX "cart_user_id_idx" ON "cart"("user_id");
CREATE INDEX "cart_product_id_idx" ON "cart"("product_id");
CREATE INDEX "cart_user_active_idx" ON "cart"("user_id", "is_active") WHERE "is_active" = true;
CREATE INDEX "cart_created_at_idx" ON "cart"("created_at");

-- Add unique constraint to prevent duplicate active cart items for the same user and product
CREATE UNIQUE INDEX "cart_user_product_unique" ON "cart"("user_id", "product_id") WHERE "is_active" = true AND "deleted_at" IS NULL;



