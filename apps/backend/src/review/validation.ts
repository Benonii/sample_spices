import { z } from "zod";
import type { reviewTable } from "./reviewTable.sql";

export const createReviewSchema = z.object({
    productID: z.string().min(1),
    userID: z.string().min(1),
    rating: z.coerce.number().min(1).max(5),
    comment: z.string().optional(),
});

export const getReviewsQueryParameterSchema = z.object({
    productID: z.string().optional(),
    userID: z.string().optional(),
    rating: z.coerce.number().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    _start: z.coerce.number().min(0).default(0),
    _end: z.coerce.number().min(0).default(10),
}).refine((data) => {
    if (!data.productID && !data.userID) {
        return false;
    }
    return true;
}, {
    message: "Either productId or userId must be provided"
});

export const getOneReviewSchema = z.object({
    reviewID: z.string().min(1),
});


export type CreateReview = z.infer<typeof createReviewSchema>;
export type GetReviewsQueryParameter = z.infer<typeof getReviewsQueryParameterSchema>;
export type GetOneReview = z.infer<typeof getOneReviewSchema>;