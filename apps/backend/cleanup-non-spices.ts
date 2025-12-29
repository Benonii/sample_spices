/**
 * Cleanup script to remove products that don't fit the spice theme
 * Run with: bun run apps/backend/cleanup-non-spices.ts
 * 
 * This script will:
 * 1. Find products not in the "Ethiopian Spices" category
 * 2. Soft delete them (set deletedAt and status to ARCHIVED)
 * 3. Optionally hard delete if DRY_RUN=false
 */

import { db } from "./src/db";
import { productTable, productCategoryRelation, productCategory } from "./src/db/schema";
import { eq, isNull, notInArray } from "drizzle-orm";
import { sql } from "drizzle-orm";

async function cleanupNonSpices() {
  const dryRun = process.env.DRY_RUN !== "false"; // Default to dry run for safety

  try {
    console.log("🧹 Starting cleanup of non-spice products...");
    if (dryRun) {
      console.log("⚠️  DRY RUN MODE - No changes will be made");
    }

    // Get Ethiopian Spices category ID
    const [spiceCategory] = await db.select()
      .from(productCategory)
      .where(eq(productCategory.name, "Ethiopian Spices"))
      .limit(1)
      .execute();

    if (!spiceCategory) {
      console.log("⚠️  'Ethiopian Spices' category not found. Skipping cleanup.");
      return;
    }

    // Get all product IDs in the Ethiopian Spices category
    const spiceProducts = await db.select({ productID: productCategoryRelation.productID })
      .from(productCategoryRelation)
      .where(eq(productCategoryRelation.categoryID, spiceCategory.id))
      .execute();

    const spiceProductIds = spiceProducts.map(p => p.productID);

    if (spiceProductIds.length === 0) {
      console.log("⚠️  No spice products found. Skipping cleanup.");
      return;
    }

    // Find products NOT in the spice category and not already deleted
    const nonSpiceProducts = await db.select()
      .from(productTable)
      .where(
        sql`${productTable.id} NOT IN (${sql.join(spiceProductIds.map(id => sql`${id}`), sql`, `)}) AND ${isNull(productTable.deletedAt)}`
      )
      .execute();

    console.log(`\n📊 Found ${nonSpiceProducts.length} non-spice products to clean up:`);
    nonSpiceProducts.forEach(p => {
      console.log(`   - ${p.name} (ID: ${p.id})`);
    });

    if (nonSpiceProducts.length === 0) {
      console.log("\n✅ No products to clean up. All products are spices!");
      return;
    }

    if (dryRun) {
      console.log("\n⚠️  DRY RUN - Would soft delete the above products");
      console.log("   Set DRY_RUN=false to actually perform the cleanup");
      return;
    }

    // Soft delete non-spice products
    const productIds = nonSpiceProducts.map(p => p.id);
    
    await db.update(productTable)
      .set({
        deletedAt: new Date(),
        status: "ARCHIVED",
        updatedAt: new Date(),
      })
      .where(
        sql`${productTable.id} IN (${sql.join(productIds.map(id => sql`${id}`), sql`, `)})`
      )
      .execute();

    console.log(`\n✅ Successfully soft-deleted ${nonSpiceProducts.length} non-spice products`);
    console.log("   Products are archived and will not appear in listings");

  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupNonSpices()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

