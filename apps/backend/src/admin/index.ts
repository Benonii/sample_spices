import { Hono } from "hono";
import productRouter from "./product/index";
import categoryRouter from "./category/index";
import orderRouter from "./order/index";
import { createCategory, getAvailableCategories } from "./product/functions";

const adminRouter = new Hono();

adminRouter.get('/',  (c) => {
    return c.json({
        message: "Admin API is running!",
    });
});

adminRouter.route("/product", productRouter);
adminRouter.route("/category", categoryRouter);
adminRouter.route("/order", orderRouter);

export default adminRouter;
