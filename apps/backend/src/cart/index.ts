import { Hono } from "hono";
import { fromZodError } from "zod-validation-error";
import { addToCart, getCartItems, updateCartItem, deleteCartItem } from "./functions";
import { addToCartSchema, getCartItemsSchema, updateCartItemSchema, checkoutSchema } from "./validation";
import { createCheckoutSession } from "@/utils/stripe";
import { getOneProduct } from "@/product/functions";


const cartRouter = new Hono();

cartRouter.post("/", async (c) => {
    const result = addToCartSchema.safeParse(await c.req.json());

    if (!result.success) {
        return c.json({ error: fromZodError(result.error as any) }, 400);
    }

    const { userID, productID, quantity } = result.data;

    const cartItem = await addToCart({ productID, quantity, userID });

    return c.json({
        message: "Cart item added successfully",
        data: cartItem
    });
});

cartRouter.get("/", async (c) => {
    const result = getCartItemsSchema.safeParse(await c.req.query());

    if (!result.success) {
        return c.json({ error: fromZodError(result.error as any) }, 400);
    }

    const { page, limit, isActive, from, to, userID } = result.data;

    try {
        const cartItems = await getCartItems({ page, limit, isActive, from, to, userID });
        return c.json(cartItems);
    } catch (error) {
        console.error("💥 Error getting cart items:", error);
        return c.json({ error: error instanceof Error ? error.message : "Failed to get cart items" }, 500);
    }
});

cartRouter.put("/:id", async (c) => {
    const cartItemId = c.req.param("id");
    const result = updateCartItemSchema.safeParse(await c.req.json());

    if (!result.success) {
        return c.json({ error: fromZodError(result.error as any) }, 400);
    }

    const { quantity, userID } = result.data;

    if (!userID) {
        return c.json({ error: "User ID is required" }, 401);
    }

    try {
        const updatedItem = await updateCartItem(userID, { id: cartItemId, quantity, userID });
        return c.json({
            message: "Cart item updated successfully",
            data: updatedItem
        });
    } catch (error) {
        return c.json({ error: error instanceof Error ? error.message : "Failed to update cart item" }, 400);
    }
});

cartRouter.delete("/:id", async (c) => {
    const cartItemId = c.req.param("id");
    const body = await c.req.json();
    const { userID } = body;

    if (!userID) {
        return c.json({ error: "User ID is required" }, 401);
    }

    try {
        const deletedItem = await deleteCartItem(userID, { id: cartItemId });
        return c.json({
            message: "Cart item removed successfully",
            data: deletedItem
        });
    } catch (error) {
        return c.json({ error: error instanceof Error ? error.message : "Failed to remove cart item" }, 400);
    }
});

cartRouter.post("/checkout", async (c) => {
    const result = checkoutSchema.safeParse(await c.req.json());
    if (!result.success) {
        return c.json({ error: fromZodError(result.error as any) }, 400);
    }

    const { checkoutItems, addressID, userID } = result.data;

    const products = await Promise.all(checkoutItems.map(async (item) => {
        const product = await getOneProduct({ productID: item.productID });
        if (!product) {
            return null
        }
        return { id: product.id, name: product.name, price: product.price, quantity: item.quantity };
    }));


    try {
    const session = await createCheckoutSession({ products: products.filter(product => product !== null), addressID, userID});
    return c.json({
        message: "Checkout session created successfully!",
        data: {
            url: session?.url
        }
    });
    } catch (error) {
        console.error("💥 Error creating checkout session:", error);
        return c.json({ error: error instanceof Error ? error.message : "Failed to create checkout session" }, 500);
    }
});


export default cartRouter;