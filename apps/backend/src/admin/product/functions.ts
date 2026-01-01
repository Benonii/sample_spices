import type { GetOneProductSchema, GetProductListQueryParams, CreateProductSchema } from "./validation";
import { db } from "@/db";
import { and, eq, inArray, asc, desc, isNull, sql } from "drizzle-orm";
import { productCategoryRelation, productInventory, productReview, productTable, productCategory, productImages } from "@/db/schema";
import { v4 as createId } from "uuid";

export const getProductList = async ({
    _start,
    _end,
    sortBy,
    orderBy,
    categoryID,
    q,
}: GetProductListQueryParams) => {
    const products = await db.select({
        id: productTable.id,
        name: productTable.name,
        price: productTable.price,
        createdAt: productTable.createdAt,
        category: productCategoryRelation.categoryName,
        inventory: productInventory.quantity,
        rating: productReview.rating,
        status: productTable.status,
        images: sql<{ id: string; imageUrl: string; imagePath: string | null; fileName: string; isPrimary: boolean; orderIndex: number }[]>`
            COALESCE(
                (
                    SELECT JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id', pi.id,
                            'imageUrl', pi.image_url,
                            'imagePath', pi.image_path,
                            'fileName', pi.file_name,
                            'isPrimary', pi.is_primary,
                            'orderIndex', pi.order_index
                        ) ORDER BY pi.order_index ASC
                    )
                    FROM product_images pi
                    WHERE pi.product_id = product.id
                ),
                '[]'::json
            )
        `.as('images'),
    })
        .from(productTable)
        .leftJoin(productCategoryRelation, eq(productTable.id, productCategoryRelation.productID))
        .leftJoin(productInventory, eq(productTable.id, productInventory.productID))
        .leftJoin(productReview, eq(productTable.id, productReview.productID))
        .where(
            and(
                q ? eq(productTable.name, q) : undefined,
                eq(productTable.status, "ACTIVE"),
                categoryID ? inArray(productCategoryRelation.categoryID, [categoryID]) : undefined,
                isNull(productTable.deletedAt)
            )
        )
        .limit(_end - _start)
        .offset(_start)
        .orderBy(sortBy && orderBy ? 
            sortBy === 'name' ? (orderBy === "ASC" ? asc(productTable.name) : desc(productTable.name)) : 
            sortBy === 'price' ? (orderBy === "ASC" ? asc(productTable.price) : desc(productTable.price)) : 
            sortBy === 'createdAt' ? (orderBy === "ASC" ? asc(productTable.createdAt) : desc(productTable.createdAt)) : 
            asc(productTable.name) : asc(productTable.name))
        .execute();

    return {
        list: products,
        total: products.length,
    }
};

export const getOneProduct = async ({
    productID,
}: GetOneProductSchema) => {
    const product = await db.select({
        id: productTable.id,
        name: productTable.name,
        description: productTable.description,
        price: productTable.price,
        rating: productTable.rating,
        status: productTable.status,
        createdAt: productTable.createdAt,
        updatedAt: productTable.updatedAt,
        category: productCategoryRelation.categoryName,
        inventory: productInventory.quantity,
        images: sql<{ id: string; imageUrl: string; imagePath: string | null; fileName: string; isPrimary: boolean; orderIndex: number }[]>`
            COALESCE(
                (
                    SELECT JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id', pi.id,
                            'imageUrl', pi.image_url,
                            'imagePath', pi.image_path,
                            'fileName', pi.file_name,
                            'isPrimary', pi.is_primary,
                            'orderIndex', pi.order_index
                        ) ORDER BY pi.order_index ASC
                    )
                    FROM product_images pi
                    WHERE pi.product_id = product.id
                ),
                '[]'::json
            )
        `.as('images'),
    })
        .from(productTable)
        .leftJoin(productCategoryRelation, eq(productTable.id, productCategoryRelation.productID))
        .leftJoin(productInventory, eq(productTable.id, productInventory.productID))
        .where(
            and(
                eq(productTable.id, productID),
                eq(productTable.status, "ACTIVE"),
                isNull(productTable.deletedAt)
            )
        )
        .limit(1)
        .execute();

    // Get product images separately
    const images = await db.select({
        id: productImages.id,
        imageUrl: productImages.imageUrl,
        isPrimary: productImages.isPrimary,
        orderIndex: productImages.orderIndex,
    })
        .from(productImages)
        .where(eq(productImages.productID, productID))
        .orderBy(asc(productImages.orderIndex))
        .execute();

    const productData = product[0];
    if (!productData) return null;

    return {
        ...productData,
        images,
    };
};

export const getAvailableCategories = async () => {
    const categories = await db.select({
        id: productCategory.id,
        name: productCategory.name,
        description: productCategory.description,
    })
        .from(productCategory)
        .orderBy(asc(productCategory.name))
        .execute();

    return categories;
};

export const createCategory = async (name: string, description?: string) => {
    try {
        const [category] = await db.insert(productCategory).values({
            id: createId(),
            createdAt: new Date(),
            updatedAt: new Date(),
            name,
            description: description || null,
        }).returning();

        return category;
    } catch (error) {
        throw new Error(`Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const createProduct = async ({
    name,
    description,
    price,
    images,
    status = "ACTIVE",
    categoryID,
    inventory = 1,
    userID,
}: CreateProductSchema) => {
    const productID = createId();
    
    try {
        return await db.transaction(async (tx) => {
            // Create the main product
            const [product] = await tx.insert(productTable).values({
                id: productID,
                name,
                description,
                price,
                status,
                userID,

            }).returning();

            // Create inventory record
             const inventoryResponse = await tx.insert(productInventory).values({
                id: createId(),
                productID: productID,
                quantity: inventory,
                reservedQuantity: 0,
                lowStockThreshold: 10,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            console.log("==========Product inventory response==========\n", inventoryResponse);

            // Assign category if provided
            if (categoryID) {
                // Verify category exists
                const [category] = await tx.select()
                    .from(productCategory)
                    .where(eq(productCategory.id, categoryID))
                    .limit(1)
                    .execute();
                
                if (category) {
                    const categoryResponse = await tx.insert(productCategoryRelation).values({
                        id: createId(),
                        productID: productID,
                        categoryID: categoryID,
                        categoryName: category.name,
                        createdAt: new Date(),
                    });

                    console.log("==========Product category response==========\n", categoryResponse);
                }
            }

            // Handle multiple image uploads if provided
            if (images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    const imageData = images[i];
                    if (!imageData) continue; // Skip undefined images
                    
                    // Store the uploaded image metadata
                    const imageResponse = await tx.insert(productImages).values({
                        id: createId(),
                        productID: productID,
                        imageUrl: imageData.imageUrl, // The actual uploaded URL from frontend
                        imagePath: imageData.imagePath, // The actual storage path from frontend
                        fileName: imageData.fileName,
                        isPrimary: imageData.isPrimary || i === 0, // Use provided or default to first
                        orderIndex: imageData.orderIndex || i,
                    });

                    console.log("==========Product image response==========\n", imageResponse);
                }
            }

            return product;
        });
    } catch (error) {
        throw new Error(`Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

// Add more images to an existing product
export const addProductImages = async (productID: string, images: any[]) => {
    try {
        // Get current image count to set proper order index
        const existingImages = await db.select({ orderIndex: productImages.orderIndex })
            .from(productImages)
            .where(eq(productImages.productID, productID))
            .orderBy(desc(productImages.orderIndex))
            .limit(1)
            .execute();
        
        const startOrderIndex = existingImages.length > 0 ? (existingImages[0]?.orderIndex || 0) + 1 : 0;
        
        const newImages = [];
        for (let i = 0; i < images.length; i++) {
            const imageData = images[i];
            if (!imageData) continue;
            
            const [newImage] = await db.insert(productImages).values({
                id: createId(),
                productID: productID,
                imageUrl: imageData.imageUrl,
                imagePath: imageData.imagePath,
                fileName: imageData.fileName,
                isPrimary: imageData.isPrimary || false,
                orderIndex: imageData.orderIndex || (startOrderIndex + i),
            }).returning();
            
            newImages.push(newImage);
        }
        
        return newImages;
    } catch (error) {
        throw new Error(`Failed to add images to product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

// Update image order and primary status
export const updateProductImageOrder = async (productID: string, imageUpdates: Array<{
    id: string;
    orderIndex: number;
    isPrimary: boolean;
}>) => {
    try {
        return await db.transaction(async (tx) => {
            // If setting a new primary image, unset all others first
            const newPrimaryImage = imageUpdates.find(img => img.isPrimary);
            if (newPrimaryImage) {
                await tx.update(productImages)
                    .set({ isPrimary: false })
                    .where(eq(productImages.productID, productID));
            }
            
            // Update each image
            const updatedImages = [];
            for (const update of imageUpdates) {
                const [updatedImage] = await tx.update(productImages)
                    .set({
                        orderIndex: update.orderIndex,
                        isPrimary: update.isPrimary,
                    })
                    .where(eq(productImages.id, update.id))
                    .returning();
                
                if (updatedImage) {
                    updatedImages.push(updatedImage);
                }
            }
            
            return updatedImages;
        });
    } catch (error) {
        throw new Error(`Failed to update image order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

// Remove specific images from a product
export const removeProductImages = async (productID: string, imageIDs: string[]) => {
    try {
        const deletedImages = await db.delete(productImages)
            .where(
                and(
                    eq(productImages.productID, productID),
                    inArray(productImages.id, imageIDs)
                )
            )
            .returning();
        
        return deletedImages;
    } catch (error) {
        throw new Error(`Failed to remove images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};