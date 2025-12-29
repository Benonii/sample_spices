import { db } from "@/db";
import { orderTable } from "./orderSchema.sql";
import { productTable, productImages } from "@/product/productTable.sql";
import { addressTable, userAddress } from "@/address/addressSchema.sql";
import { user } from "@/db/schema";
import type { 
  GetOrderListQueryParameters, 
  UpdateOrder, 
  CancelOrder, 
  CreateOrder
} from "./validation";
import { and, eq, desc } from "drizzle-orm";

  // Type for complete order response with related data
export type CompleteOrder = {
  id: string;
  orderNumber: string;
  userID: string;
  addressID: string;
  productID: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  grandTotal: number;
  deliveryStatus: string;
  paymentStatus: string;
  orderStatus: string;
  paymentMethod: string | null;
  trackingNumber: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  refundAmount: number | null;
  // Product details
  productName: string;
  productDescription: string;
  productPrice: number;
  productMainImage: string | null;
  // Address details
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  // User contact info
  userEmail: string;
};

export const createOrder = async (orderData: CreateOrder): Promise<{ order: CompleteOrder }> => {
  try {
    // Validate product exists
    const product = await db.select({ price: productTable.price })
      .from(productTable)
      .where(eq(productTable.id, orderData.productID))
      .limit(1);

    if (product.length === 0) {
      const error = new Error("Product not found");
      (error as any).status = 404;
      throw error;
    }

    // Validate address exists
    const address = await db.select({ id: addressTable.id })
      .from(addressTable)
      .where(eq(addressTable.id, orderData.addressID))
      .limit(1);

    if (address.length === 0) {
      const error = new Error("Address not found");
      (error as any).status = 404;
      throw error;
    }

    const unitPrice = product[0]!.price;
    const subtotal = unitPrice * orderData.quantity;
    const totalPrice = subtotal;
    const grandTotal = subtotal + (orderData.taxAmount || 0) + (orderData.shippingCost || 0) - (orderData.discountAmount || 0);

    // Generate unique order ID
    const orderID = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    // Generate unique order number
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderNumber = `ORD-${timestamp}-${randomSuffix}`;

    const newOrder = await db.insert(orderTable).values({
      id: orderID,
      ...orderData,
      unitPrice,
      subtotal,
      totalPrice,
      grandTotal,
      orderNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // Get the complete order with related data
    const completeOrder = await getOrderByID(newOrder[0]!.id);
    if (!completeOrder) {
      throw new Error("Failed to retrieve created order");
    }

    return { order: completeOrder };
  } catch (error) {
    throw error;
  }
};

export const getOrderList = async (params: GetOrderListQueryParameters): Promise<CompleteOrder[]> => {
  const { userID, deliveryStatus, paymentStatus, orderStatus, _start, _end } = params;
  
  // Build conditions array
  const conditions = [];
  if (userID) conditions.push(eq(orderTable.userID, userID));
  if (deliveryStatus) conditions.push(eq(orderTable.deliveryStatus, deliveryStatus));
  if (paymentStatus) conditions.push(eq(orderTable.paymentStatus, paymentStatus));
  if (orderStatus) conditions.push(eq(orderTable.orderStatus, orderStatus));

  // Build query with all conditions at once
  let query = db.select({
    order: orderTable,
    product: productTable,
    productImage: productImages,
    address: addressTable,
    userAddress: userAddress,
    user: user,
  })
  .from(orderTable)
  .innerJoin(productTable, eq(orderTable.productID, productTable.id))
  .leftJoin(productImages, and(
    eq(productImages.productID, productTable.id),
    eq(productImages.isPrimary, true)
  ))
  .innerJoin(addressTable, eq(orderTable.addressID, addressTable.id))
  .innerJoin(userAddress, eq(orderTable.addressID, userAddress.addressID))
  .innerJoin(user, eq(orderTable.userID, user.id));

  // Apply all filters at once if any exist
  if (conditions.length > 0) {
    query = (query as any).where(and(...conditions));
  }

  // Apply pagination
  if (_start && _end) {
    const start = parseInt(_start);
    const end = parseInt(_end);
    query = (query as any).limit(end - start).offset(start);
  }

  // Order by creation date (newest first)
  query = (query as any).orderBy(desc(orderTable.createdAt));

  const orders = await query;

  return orders.map(row => ({
    id: row.order.id,
    orderNumber: row.order.orderNumber,
    userID: row.order.userID,
    addressID: row.order.addressID,
    productID: row.order.productID,
    quantity: row.order.quantity,
    unitPrice: row.order.unitPrice,
    totalPrice: row.order.totalPrice,
    subtotal: row.order.subtotal,
    taxAmount: row.order.taxAmount,
    shippingCost: row.order.shippingCost,
    discountAmount: row.order.discountAmount,
    grandTotal: row.order.grandTotal,
    deliveryStatus: row.order.deliveryStatus,
    paymentStatus: row.order.paymentStatus,
    orderStatus: row.order.orderStatus,
    paymentMethod: row.order.paymentMethod,
    trackingNumber: row.order.trackingNumber,
    notes: row.order.notes,
    createdAt: row.order.createdAt,
    updatedAt: row.order.updatedAt,
    cancelledAt: row.order.cancelledAt,
    cancellationReason: row.order.cancellationReason,
    refundAmount: row.order.refundAmount,
    // Product details
    productName: row.product.name,
    productDescription: row.product.description,
    productPrice: row.product.price,
    productMainImage: row.productImage?.imageUrl || null,
    // Address details
    addressLine1: row.address.addressLine1,
    addressLine2: row.address.addressLine2,
    city: row.address.city,
    state: row.address.state,
    postalCode: row.address.postalCode,
    firstName: row.userAddress.firstName,
    lastName: row.userAddress.lastName,
    phone: row.userAddress.phone,
    // User contact info
    userEmail: row.user.email,
  }));
};

export const getOrderByID = async (orderID: string): Promise<CompleteOrder | undefined> => {
  const order = await db.select({
    order: orderTable,
    product: productTable,
    productImage: productImages,
    address: addressTable,
    userAddress: userAddress,
    user: user,
  })
  .from(orderTable)
  .innerJoin(productTable, eq(orderTable.productID, productTable.id))
  .leftJoin(productImages, and(
    eq(productImages.productID, productTable.id),
    eq(productImages.isPrimary, true)
  ))
  .innerJoin(addressTable, eq(orderTable.addressID, addressTable.id))
  .innerJoin(userAddress, eq(orderTable.addressID, userAddress.addressID))
  .innerJoin(user, eq(orderTable.userID, user.id))
  .where(eq(orderTable.id, orderID))
  .limit(1);

  if (order.length === 0) return undefined;

  const row = order[0]!;
  return {
    id: row.order.id,
    orderNumber: row.order.orderNumber,
    userID: row.order.userID,
    addressID: row.order.addressID,
    productID: row.order.productID,
    quantity: row.order.quantity,
    unitPrice: row.order.unitPrice,
    totalPrice: row.order.totalPrice,
    subtotal: row.order.subtotal,
    taxAmount: row.order.taxAmount,
    shippingCost: row.order.shippingCost,
    discountAmount: row.order.discountAmount,
    grandTotal: row.order.grandTotal,
    deliveryStatus: row.order.deliveryStatus,
    paymentStatus: row.order.paymentStatus,
    orderStatus: row.order.orderStatus,
    paymentMethod: row.order.paymentMethod,
    trackingNumber: row.order.trackingNumber,
    notes: row.order.notes,
    createdAt: row.order.createdAt,
    updatedAt: row.order.updatedAt,
    cancelledAt: row.order.cancelledAt,
    cancellationReason: row.order.cancellationReason,
    refundAmount: row.order.refundAmount,
    // Product details
    productName: row.product.name,
    productDescription: row.product.description,
    productPrice: row.product.price,
    productMainImage: row.productImage?.imageUrl || null,
    // Address details
    addressLine1: row.address.addressLine1,
    addressLine2: row.address.addressLine2,
    city: row.address.city,
    state: row.address.state,
    postalCode: row.address.postalCode,
    firstName: row.userAddress.firstName,
    lastName: row.userAddress.lastName,
    phone: row.userAddress.phone,
    // User contact info
    userEmail: row.user.email,
  };
};

export const updateOrder = async ({ orderID, ...updateData }: UpdateOrder): Promise<CompleteOrder> => {
  try {
    // Check if order exists
    const existingOrder = await db.select().from(orderTable).where(eq(orderTable.id, orderID)).limit(1);
    if (existingOrder.length === 0) {
      throw new Error("Order not found");
    }

    // Prepare update data
    const updateFields: any = {
      ...updateData,
      updatedAt: new Date(),
    };

    // If order status is being set to CANCELLED, automatically set cancelledAt
    if (updateData.orderStatus === "CANCELLED") {
      updateFields.cancelledAt = new Date();
      // Also set delivery status to CANCELLED if not explicitly provided
      if (!updateData.deliveryStatus) {
        updateFields.deliveryStatus = "CANCELLED";
      }
    }

    // Update the order
    await db.update(orderTable)
      .set(updateFields)
      .where(eq(orderTable.id, orderID));

    // Get the updated order
    const updatedOrder = await getOrderByID(orderID);
    if (!updatedOrder) {
      throw new Error("Failed to retrieve updated order");
    }

    return updatedOrder;
  } catch (error) {
    throw error;
  }
};

export const cancelOrder = async ({ orderID, cancellationReason, refundAmount }: CancelOrder): Promise<CompleteOrder> => {
  try {
    // Check if order exists
    const existingOrder = await db.select().from(orderTable).where(eq(orderTable.id, orderID)).limit(1);
    if (existingOrder.length === 0) {
      throw new Error("Order not found");
    }

    // Update the order with cancellation details
    await db.update(orderTable)
      .set({
        orderStatus: "CANCELLED",
        deliveryStatus: "CANCELLED",
        cancelledAt: new Date(),
        cancellationReason,
        refundAmount: refundAmount || 0,
        updatedAt: new Date(),
      })
      .where(eq(orderTable.id, orderID));

    // Get the cancelled order
    const cancelledOrder = await getOrderByID(orderID);
    if (!cancelledOrder) {
      throw new Error("Failed to retrieve cancelled order");
    }

    return cancelledOrder;
  } catch (error) {
    throw error;
  }
};

export const deleteOrder = async (orderID: string): Promise<void> => {
  try {
    // Check if order exists
    const existingOrder = await db.select().from(orderTable).where(eq(orderTable.id, orderID)).limit(1);
    if (existingOrder.length === 0) {
      throw new Error("Order not found");
    }

    // Delete the order
    await db.delete(orderTable).where(eq(orderTable.id, orderID));
  } catch (error) {
    throw error;
  }
};
