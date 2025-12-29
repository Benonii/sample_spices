import { db } from "@/db";
import { reviewTable } from "./reviewTable.sql";
import { type CreateReview, type GetOneReview, type GetReviewsQueryParameter } from "./validation";
import { eq, gte, lte, and, isNull } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { user } from "@/db/auth-schema";


export const createReview = async ({    
    productID,
    userID,
    rating,
    comment,
}: CreateReview ) => {
    const review = await db.insert(reviewTable).values({
        id: createId(),
        productID,
        userID,
        rating: rating.toString(),
        comment,
    }).returning();
    
    return review[0]!;
};

export const getReviews = async ({
    productID,
    userID,
    rating,
    from,
    to,
    _start,
    _end,
}: GetReviewsQueryParameter ) => {
    const reviews = await db.select({
        id: reviewTable.id,
        productID: reviewTable.productID,
        userID: reviewTable.userID,
        rating: reviewTable.rating,
        comment: reviewTable.comment,
        createdAt: reviewTable.createdAt,
        reviewerName: user.name,
    }).from(reviewTable)
        .leftJoin(user, eq(reviewTable.userID, user.id))
        .where(
            and(
                productID ? eq(reviewTable.productID, productID) : undefined,
                userID ? eq(reviewTable.userID, userID) : undefined,
                rating ? eq(reviewTable.rating, rating.toString()) : undefined,
                from ? gte(reviewTable.createdAt, new Date(from)) : undefined,
                to ? lte(reviewTable.createdAt, new Date(to)) : undefined
            )
        )
        .limit(_end - _start)
        .offset(_start)
        .execute()
    ;

    return {
        list: reviews,
        total: reviews.length,
    };
};

export const getOneReview = async ({
    reviewID,
}: GetOneReview ) => {
    const review = await db.select({
        id: reviewTable.id,
        productID: reviewTable.productID,
        userID: reviewTable.userID,
        rating: reviewTable.rating,
        comment: reviewTable.comment,
        createdAt: reviewTable.createdAt,
        reviewerName: user.name,
    }).from(reviewTable)
        .leftJoin(user, eq(reviewTable.userID, user.id))
        .where(
            and(
                eq(reviewTable.id, reviewID),
                isNull(reviewTable.deletedAt)
            )
        )
    .execute();

    return review;
};

export const deleteReview = async ({
    reviewID,
}: GetOneReview ) => {
    await db.delete(reviewTable).where(eq(reviewTable.id, reviewID)).execute();
};