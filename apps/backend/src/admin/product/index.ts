// Export all admin product functions and types
export * from "./functions";
import { Hono } from "hono";
import { createProduct, getProductList, getOneProduct, addProductImages, updateProductImageOrder, removeProductImages } from "./functions";
import { createProductSchema, getProductListQueryParamsSchema, getOneProductSchema } from "./validation";
import { fromZodError } from "zod-validation-error";
import { uploadProductImage } from "@/utils/supabase";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { productTable, productImages } from "@/db/schema";

const productRouter = new Hono();

productRouter.post("/", async (c) => {
    const result = createProductSchema.safeParse(await c.req.json());

    if (!result.success) {
        return c.json({ message: fromZodError(result.error as any).message }, 400);
    }

    const { name, price, categoryID, inventory, description, images, status, userID } = result.data;

    const product = await createProduct({
        name,
        description,
        images,
        price,
        categoryID,
        inventory,
        status,
        userID
    });

    return c.json({
        message: "Product created successfully!",
        product,
    });
});

productRouter.get("/", async (c) => {
    const result = getProductListQueryParamsSchema.safeParse(c.req.query());
    if (!result.success) {
        return c.json({ error: result.error.message }, 400);
    }
    const { _start, _end, sortBy, orderBy, categoryID, q } = result.data;

    const products = await getProductList({
        _start,
        _end,
        sortBy,
        orderBy,
        categoryID,
        q,
    });
    return c.json({
        list: products.list,
        total: products.total,
    });
});

// Get single product
productRouter.get("/:productID", async (c) => {
    const result = getOneProductSchema.safeParse({ productID: c.req.param("productID") });
    if (!result.success) {
        return c.json({ error: result.error.message }, 400);
    }

    const product = await getOneProduct(result.data);
    if (!product) {
        return c.json({ error: "Product not found" }, 404);
    }

    return c.json(product);
});

// Update product
productRouter.put("/:productId", async (c) => {
    const productId = c.req.param("productId");
    const result = createProductSchema.safeParse(await c.req.json());

    if (!result.success) {
        return c.json({ message: fromZodError(result.error as any).message }, 400);
    }

    const { name, price, categoryID, inventory, description, status } = result.data;

    try {
        const [updatedProduct] = await db
            .update(productTable)
            .set({
                name,
                description,
                price,
                status,
                updatedAt: new Date(),
            })
            .where(eq(productTable.id, productId))
            .returning();

        if (!updatedProduct) {
            return c.json({ error: "Product not found" }, 404);
        }

        return c.json({
            message: "Product updated successfully!",
            product: updatedProduct,
        });
    } catch (error) {
        return c.json({ 
            error: "Failed to update product",
            details: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
});

// Delete product
productRouter.delete("/:productId", async (c) => {
    const productId = c.req.param("productId");

    try {
        // Soft delete - set deletedAt timestamp
        const [deletedProduct] = await db
            .update(productTable)
            .set({
                deletedAt: new Date(),
                status: "ARCHIVED"
            })
            .where(eq(productTable.id, productId))
            .returning();

        if (!deletedProduct) {
            return c.json({ error: "Product not found" }, 404);
        }

        return c.json({
            message: "Product deleted successfully!",
            product: deletedProduct,
        });
    } catch (error) {
        return c.json({ 
            error: "Failed to delete product",
            details: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
});

// Image upload endpoint
productRouter.post("/:productId/images", async (c) => {
    const productId = c.req.param("productId");
    
    try {
        const formData = await c.req.formData();
        const files = formData.getAll("images") as File[];
        
        if (!files || files.length === 0) {
            return c.json({ error: "No images provided" }, 400);
        }
        
        const uploadedImages = [];
        
        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                return c.json({ error: `File ${file.name} is too large. Maximum size is 5MB.` }, 400);
            }
            
            const buffer = await file.arrayBuffer();
            const fileName = `${Date.now()}-${file.name}`;
            
            const imageUrl = await uploadProductImage(
                Buffer.from(buffer),
                fileName,
                productId
            );
            
            uploadedImages.push({
                fileName: file.name,
                imageUrl,
                size: file.size,
                type: file.type
            });
        }
        
        return c.json({
            message: "Images uploaded successfully",
            images: uploadedImages
        });
        
    } catch (error) {
        console.error("Error uploading images:", error);
        return c.json({ 
            error: "Failed to upload images",
            details: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
});

// Add more images to an existing product
productRouter.post("/:productId/images/add", async (c) => {
    const productId = c.req.param("productId");
    
    try {
        const { images } = await c.req.json();
        
        if (!images || !Array.isArray(images) || images.length === 0) {
            return c.json({ error: "Images array is required" }, 400);
        }
        
        const newImages = await addProductImages(productId, images);
        
        return c.json({
            message: "Images added successfully",
            images: newImages
        });
        
    } catch (error) {
        console.error("Error adding images:", error);
        return c.json({ 
            error: "Failed to add images",
            details: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
});

// Update image order and primary status
productRouter.put("/:productId/images/order", async (c) => {
    const productId = c.req.param("productId");
    
    try {
        const { imageUpdates } = await c.req.json();
        
        if (!imageUpdates || !Array.isArray(imageUpdates)) {
            return c.json({ error: "Image updates array is required" }, 400);
        }
        
        const updatedImages = await updateProductImageOrder(productId, imageUpdates);
        
        return c.json({
            message: "Image order updated successfully",
            images: updatedImages
        });
        
    } catch (error) {
        console.error("Error updating image order:", error);
        return c.json({ 
            error: "Failed to update image order",
            details: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
});

// Remove specific images from a product
productRouter.delete("/:productId/images", async (c) => {
    const productId = c.req.param("productId");
    
    try {
        const { imageIDs } = await c.req.json();
        
        if (!imageIDs || !Array.isArray(imageIDs) || imageIDs.length === 0) {
            return c.json({ error: "Image IDs array is required" }, 400);
        }
        
        const deletedImages = await removeProductImages(productId, imageIDs);
        
        return c.json({
            message: "Images removed successfully",
            deletedImages
        });
        
    } catch (error) {
        console.error("Error removing images:", error);
        return c.json({ 
            error: "Failed to remove images",
            details: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
});

export default productRouter;