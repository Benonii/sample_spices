import z from "zod";

export const getProductListQueryParamsSchema = z.object({
    categoryID: z.string().optional(),
    _start: z.coerce.number().min(0).default(0),
    _end: z.coerce.number().min(0).default(10),
    sortBy: z.enum(["name", "price", "createdAt"]).default("createdAt"),
    orderBy: z.enum(["ASC", "DESC"]).default("ASC"),
    status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
    q: z.string().optional()
});

export type GetProductListQueryParams = z.infer<typeof getProductListQueryParamsSchema>;

export const getOneProductSchema = z.object({
    productID: z.string().min(1, "Product ID is required")
});

export type GetOneProductSchema = z.infer<typeof getOneProductSchema>;

// Schema for uploaded image metadata (what frontend sends after upload)
export const uploadedImageSchema = z.object({
    storageKey: z.string(), // The key returned from presigned URL
    fileName: z.string(), // Original filename
    imageUrl: z.string().url(), // The public/signed URL from Supabase
    imagePath: z.string(), // Storage path
    isPrimary: z.boolean().optional().default(false),
    orderIndex: z.number().optional().default(0),
});

export const createProductSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().positive("Price must be positive"),
    images: z.array(uploadedImageSchema).optional().default([]),
    status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional().default("ACTIVE"),
    categoryID: z.string().optional(), // Optional category assignment
    inventory: z.coerce.number().min(0, "Inventory cannot be negative").optional().default(1),
    userID: z.string().min(1, "User ID is required"),
});

export type CreateProductSchema = z.infer<typeof createProductSchema>;

// Schema for updating product images
export const updateProductImagesSchema = z.object({
    productID: z.string(),
    images: z.array(uploadedImageSchema),
});uploadedImageSchema

export type UpdateProductImagesSchema = z.infer<typeof updateProductImagesSchema>;