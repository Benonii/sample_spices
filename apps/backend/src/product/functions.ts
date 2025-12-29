import type { GetOneProductSchema, GetProductListQueryParams } from "./validation";
import { db } from "@/db";
import { and, eq, inArray, asc, desc, isNull, sql } from "drizzle-orm";
import { productCategoryRelation, productInventory, productReview, productTable, productImages } from "@/db/schema";

export const getProductList = async ({
    _start,
    _end,
    sortBy,
    orderBy,
    categoryID,
    q,
}: GetProductListQueryParams) => {
    // First get the total count of unique products
    const totalCount = await db
        .select({ count: sql<number>`count(DISTINCT ${productTable.id})` })
        .from(productTable)
        .leftJoin(productCategoryRelation, eq(productTable.id, productCategoryRelation.productID))
        .where(
            and(
                q ? sql`${productTable.name} ILIKE ${`%${q}%`}` : undefined,
                eq(productTable.status, "ACTIVE"),
                categoryID ? inArray(productCategoryRelation.categoryID, [categoryID]) : undefined,
                isNull(productTable.deletedAt)
            )
        )
        .execute();

    const total = totalCount[0]?.count || 0;

    // Get unique products with pagination using DISTINCT
    const products = await db.select({
        id: productTable.id,
        name: productTable.name,
        description: productTable.description,
        price: productTable.price,
        createdAt: productTable.createdAt,
        status: productTable.status,
        rating: productTable.rating,
    })
        .from(productTable)
        .leftJoin(productCategoryRelation, eq(productTable.id, productCategoryRelation.productID))
        .where(
            and(
                q ? sql`${productTable.name} ILIKE ${`%${q}%`}` : undefined,
                eq(productTable.status, "ACTIVE"),
                categoryID ? inArray(productCategoryRelation.categoryID, [categoryID]) : undefined,
                isNull(productTable.deletedAt)
            )
        )
        .groupBy(productTable.id, productTable.name, productTable.description, productTable.price, productTable.createdAt, productTable.status, productTable.rating)
        .limit(_end - _start)
        .offset(_start)
        .orderBy(sortBy && orderBy ? 
            sortBy === 'name' ? (orderBy === "ASC" ? asc(productTable.name) : desc(productTable.name)) : 
            sortBy === 'price' ? (orderBy === "ASC" ? asc(productTable.price) : desc(productTable.price)) : 
            sortBy === 'createdAt' ? (orderBy === "ASC" ? asc(productTable.createdAt) : desc(productTable.createdAt)) : 
            asc(productTable.name) : asc(productTable.name))
        .execute();

    // Now get additional data for each product separately to avoid duplicates
    const productsWithDetails = await Promise.all(
        products.map(async (product) => {
            // Get category for this product
            const categoryResult = await db.select({
                categoryName: productCategoryRelation.categoryName,
            })
                .from(productCategoryRelation)
                .where(eq(productCategoryRelation.productID, product.id))
                .limit(1)
                .execute();

            // Get inventory for this product
            const inventoryResult = await db.select({
                quantity: productInventory.quantity,
            })
                .from(productInventory)
                .where(eq(productInventory.productID, product.id))
                .limit(1)
                .execute();

            // Get primary image for this product
            const imageResult = await db.select({
                imageUrl: productImages.imageUrl,
            })
                .from(productImages)
                .where(
                    and(
                        eq(productImages.productID, product.id),
                        eq(productImages.isPrimary, true)
                    )
                )
                .limit(1)
                .execute();

            return {
                ...product,
                category: categoryResult[0]?.categoryName || null,
                inventory: inventoryResult[0]?.quantity || 0,
                imageUrl: imageResult[0]?.imageUrl || null,
            };
        })
    );

    return {
        list: productsWithDetails,
        total,
        page: Math.floor(_start / (_end - _start)) + 1,
        pageSize: _end - _start,
    }
};

export const getOneProduct = async ({
    productID,
}: GetOneProductSchema) => {
    // Get product with manual joins instead of relational queries
    const product = await db.select({
        id: productTable.id,
        name: productTable.name,
        description: productTable.description,
        userID: productTable.userID,
        rating: productTable.rating,
        price: productTable.price,
        status: productTable.status,
        createdAt: productTable.createdAt,
        updatedAt: productTable.updatedAt,
        deletedAt: productTable.deletedAt,
        // Category info
        categoryName: productCategoryRelation.categoryName,
        categoryID: productCategoryRelation.categoryID,
        categoryDescription: productCategoryRelation.categoryName, // Using name as description for now
        // Inventory info
        quantity: productInventory.quantity,
        reservedQuantity: productInventory.reservedQuantity,
        lowStockThreshold: productInventory.lowStockThreshold,
        inventoryID: productInventory.id,
        // Primary image
        imageUrl: productImages.imageUrl,
        imagePath: productImages.imagePath,
        fileName: productImages.fileName,
    })
        .from(productTable)
        .leftJoin(productCategoryRelation, eq(productTable.id, productCategoryRelation.productID))
        .leftJoin(productInventory, eq(productTable.id, productInventory.productID))
        .leftJoin(productImages, and(
            eq(productTable.id, productImages.productID),
            eq(productImages.isPrimary, true)
        ))
        .where(
            and(
                eq(productTable.id, productID),
                eq(productTable.status, "ACTIVE"),
                isNull(productTable.deletedAt)
            )
        )
        .execute();

    if (!product || product.length === 0) {
        return null;
    }

    // Get reviews separately
    const reviews = await db.select({
        id: productReview.id,
        userID: productReview.userID,
        rating: productReview.rating,
        comment: productReview.comment,
        createdAt: productReview.createdAt,
        updatedAt: productReview.updatedAt,
    })
        .from(productReview)
        .where(eq(productReview.productID, productID))
        .execute();

    // Get all images for the product
    const images = await db.select({
        id: productImages.id,
        imageUrl: productImages.imageUrl,
        imagePath: productImages.imagePath,
        fileName: productImages.fileName,
        isPrimary: productImages.isPrimary,
        orderIndex: productImages.orderIndex,
        createdAt: productImages.createdAt,
    })
        .from(productImages)
        .where(eq(productImages.productID, productID))
        .orderBy(productImages.orderIndex)
        .execute();

    // Combine all data
    const productData = product[0];
    
    if (!productData) {
        return null;
    }
    
    // Transform data to match frontend expectations
    const category = productData!.categoryName ? [{
        id: productData!.categoryID || 'unknown',
        name: productData!.categoryName,
        description: productData!.categoryDescription
    }] : [];

    const inventory = productData!.quantity !== null ? [{
        id: productData!.inventoryID || 'unknown',
        quantity: productData!.quantity,
        reservedQuantity: productData!.reservedQuantity || 0,
        lowStockThreshold: productData!.lowStockThreshold || 10
    }] : [];

    return {
        id: productData!.id,
        name: productData!.name,
        description: productData!.description,
        price: productData!.price,
        rating: productData!.rating,
        status: productData!.status,
        createdAt: productData!.createdAt,
        updatedAt: productData!.updatedAt,
        category,
        inventory,
        reviews,
        images,
    };
};
