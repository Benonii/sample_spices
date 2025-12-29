import { Hono } from "hono";
import { fromZodError } from "zod-validation-error";
import { 
  createOrderSchema, 
  getOrderListQueryParameterSchema, 
  getOrderByIdQueryParameterSchema, 
  updateOrderSchema,
  cancelOrderSchema
} from "./validation";
import { 
  createOrder, 
  getOrderByID, 
  getOrderList, 
  updateOrder, 
  deleteOrder,
  cancelOrder
} from "./functions";

const orderRouter = new Hono();

// Create a new order
orderRouter.post("/", async (c) => {
  const result = createOrderSchema.safeParse(await c.req.json());
  if (!result.success) {
    return c.json({ message: fromZodError(result.error as any).message }, 400);
  }

  try {
    const order = await createOrder(result.data);
    return c.json({
      message: "Order created successfully!",
      data: { order: order.order },
    }, 201);
  } catch (error) {
    console.error("Error creating order:", error);
    
    // Check if it's a 404 error (product not found or address not found)
    if (error instanceof Error && (error as any).status === 404) {
      return c.json({ 
        error: error.message 
      }, 404);
    }
    
    return c.json({ 
      message: error instanceof Error ? error.message : "An unexpected error occurred while creating the order" 
    }, 500);
  }
});

// Get list of orders with optional filtering
orderRouter.get("/", async (c) => {
  const result = getOrderListQueryParameterSchema.safeParse(c.req.query());
  if (!result.success) {
    return c.json({ message: fromZodError(result.error as any).message }, 400);
  }

  try {
    const orders = await getOrderList(result.data);
    return c.json({
      message: "Orders fetched successfully!",
      data: orders,
    }, 200);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return c.json({ 
      message: error instanceof Error ? error.message : "An unexpected error occurred while fetching orders" 
    }, 500);
  }
});

// Get a specific order by ID
orderRouter.get("/:orderID", async (c) => {
  const result = getOrderByIdQueryParameterSchema.safeParse(c.req.param());
  if (!result.success) {
    return c.json({ message: fromZodError(result.error as any).message }, 400);
  }

  const { orderID } = result.data;
  
  try {
    const order = await getOrderByID(orderID);
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    return c.json({
      message: "Order fetched successfully!",
      data: order,
    }, 200);
  } catch (error) {
    console.error("Error fetching order:", error);
    return c.json({ 
      message: error instanceof Error ? error.message : "An unexpected error occurred while fetching the order" 
    }, 500);
  }
});

// Update order (only status-related fields)
orderRouter.put("/:orderID", async (c) => {
  const paramResult = getOrderByIdQueryParameterSchema.safeParse(c.req.param());
  if (!paramResult.success) {
    return c.json({ error: fromZodError(paramResult.error as any).message }, 400);
  }

  const result = updateOrderSchema.safeParse(await c.req.json());
  if (!result.success) {
    return c.json({ error: fromZodError(result.error as any).message }, 400);
  }

  const { orderID } = paramResult.data;
  
  try {
    const updatedOrder = await updateOrder({ orderID, ...result.data });
    return c.json({
      message: "Order updated successfully!",
      data: updatedOrder,
    }, 200);
  } catch (error) {
    console.error("Error updating order:", error);
    return c.json({ 
      message: error instanceof Error ? error.message : "An unexpected error occurred while updating the order" 
    }, 500);
  }
});

// Cancel order (special endpoint for cancellation)
orderRouter.post("/:orderID/cancel", async (c) => {
  const paramResult = getOrderByIdQueryParameterSchema.safeParse(c.req.param());
  if (!paramResult.success) {
    return c.json({ error: fromZodError(paramResult.error as any).message }, 400);
  }

  const result = cancelOrderSchema.safeParse(await c.req.json());
  if (!result.success) {
    return c.json({ error: fromZodError(result.error as any).message }, 400);
  }

  const { orderID } = paramResult.data;
  
  try {
    const cancelledOrder = await cancelOrder({ orderID, ...result.data });
    return c.json({
      message: "Order cancelled successfully!",
      data: cancelledOrder,
    }, 200);
  } catch (error) {
    console.error("Error cancelling order:", error);
    return c.json({ 
      message: error instanceof Error ? error.message : "An unexpected error occurred while cancelling the order" 
    }, 500);
  }
});

// Delete order
orderRouter.delete("/:orderID", async (c) => {
  const result = getOrderByIdQueryParameterSchema.safeParse(c.req.param());
  if (!result.success) {
    return c.json({ message: fromZodError(result.error as any).message }, 400);
  }

  const { orderID } = result.data;
  
  try {
    await deleteOrder(orderID);
    return c.json({
      message: "Order deleted successfully!",
    }, 200);
  } catch (error) {
    console.error("Error deleting order:", error);
    return c.json({ 
      message: error instanceof Error ? error.message : "An unexpected error occurred while deleting the order" 
    }, 500);
  }
});

export default orderRouter;
