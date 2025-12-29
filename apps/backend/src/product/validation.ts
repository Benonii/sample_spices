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
    productID: z.string()
});

export type GetOneProductSchema = z.infer<typeof getOneProductSchema>;