import { Hono } from "hono";
import { fromZodError } from "zod-validation-error";
import { getReviews, getOneReview, deleteReview } from "./functions";
import { createReviewSchema, getReviewsQueryParameterSchema, getOneReviewSchema } from "./validation";
import { createReview } from "./functions";


const reviewRouter = new Hono();

reviewRouter.post("/", async (c) => {
    const result = createReviewSchema.safeParse(await c.req.json());
    if (!result.success) {
        return c.json({ message: fromZodError(result.error as any).message }, 400);
    }

    const { productID, userID, rating, comment } = result.data;

    const review = await createReview({ productID, userID, rating, comment });

    return c.json({
        message: "Review created successfully!",
        data: review
    }, 200);
});

reviewRouter.get("/", async (c) => {
    const result = getReviewsQueryParameterSchema.safeParse(c.req.query());
    if (!result.success) {
        return c.json({ message: fromZodError(result.error as any).message }, 400);
    }

    const { productID, userID, rating, from, to, _start, _end } = result.data;

    const reviews = await getReviews({ productID, userID, rating, from, to, _start, _end });

    return c.json({
        message: "Reviews fetched successfully!",
        data: {
            list: reviews.list,
            page: Math.floor(_start / (_end - _start)),
            pageSize: _end - _start,
            total: reviews.total,
        }
    }, 200);
});

reviewRouter.get("/:reviewID", async (c) => {
    const result = getOneReviewSchema.safeParse(c.req.param());
    if (!result.success) {
        return c.json({ message: fromZodError(result.error as any).message }, 400);
    }

    const review = await getOneReview(result.data);

    if (!review) {
        return c.json({ message: "Review not found!" }, 404);
    }

    return c.json({
        message: "Review fetched successfully!",
        data: review
    }, 200);
});

reviewRouter.delete("/:reviewID", async (c) => {
    const result = getOneReviewSchema.safeParse(c.req.param());
    if (!result.success) {
        return c.json({ message: fromZodError(result.error as any).message }, 400);
    }

    const review = await deleteReview(result.data);

    return c.json({
        message: "Review deleted successfully!",
        data: review
    }, 200);
});

export default reviewRouter;
