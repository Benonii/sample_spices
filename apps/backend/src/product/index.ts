import { Hono } from "hono";
import { fromZodError } from "zod-validation-error";
import { getOneProductSchema, getProductListQueryParamsSchema } from "./validation";
import { getOneProduct, getProductList } from "./functions";

const productRouter = new Hono();

productRouter.get("/", async (c) => {
    const result = getProductListQueryParamsSchema.safeParse(c.req.query());
    if (!result.success) {
        return c.json({ message: fromZodError(result.error as any).message }, 400);
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
        page: Math.floor(_start / (_end - _start)),
        pageSize: _end - _start,
        total: products.total,
    });
});

productRouter.get("/:productID", async (c) => {
    const result = getOneProductSchema.safeParse(c.req.param());
    if (!result.success) {
        return c.json({ message: fromZodError(result.error as any).message }, 400);
    }

    const { productID } = result.data;
    const product = await getOneProduct({ productID });

    return c.json(product);
});

export default productRouter;