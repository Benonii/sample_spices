import { Hono } from "hono";

const router = new Hono();

router.get("/", (c) => {
    return c.json({
        message: "Bita shop API",
    }, 200);
});

export default router;