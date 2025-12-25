import { Hono } from "hono";

const router = new Hono();

router.get("/", (c) => {
	return c.json({
		message: "Starter template API",
	}, 200);
});

export default router;
