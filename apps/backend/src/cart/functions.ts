import { eq, and, gte, lte, desc, count, sql, isNull } from "drizzle-orm";
import { db } from "@/db";
import { cartTable, type NewCartItem } from "./cartTable.sql";
import { productTable, productImages } from "@/product/productTable.sql";
import type {
  UpdateCartItemInput,
  DeleteCartItemInput,
  GetCartItemsInput,
  CartItemResponse,
  CartItemsListResponse,
} from "./validation";
import { createId } from "@paralleldrive/cuid2";

/**
 * Get cart items for a user with pagination and filtering
 */
export async function getCartItems({
    page, limit, from,
    to, isActive, userID }: GetCartItemsInput
): Promise<CartItemsListResponse> {
  const offset = (page - 1) * limit;

  const totalResult = await db
    .select({ count: count() })
    .from(cartTable)
    .where(and(
      eq(cartTable.userID, userID),
      eq(cartTable.isActive, true),
      from ? gte(cartTable.createdAt, new Date(from)) : undefined,
      to ? lte(cartTable.createdAt, new Date(to)) : undefined
    ));
  
  const total = totalResult[0]?.count || 0;
  const totalPages = Math.ceil(total / limit);

  const cartItems = await db
    .select({
      id: cartTable.id,
      userID: cartTable.userID,
      productID: cartTable.productID,
      quantity: cartTable.quantity,
      isActive: cartTable.isActive,
      createdAt: cartTable.createdAt,
      updatedAt: cartTable.updatedAt,
      deletedAt: cartTable.deletedAt,
      productName: productTable.name,
      productPrice: productTable.price,
      productStatus: productTable.status,
      productDescription: productTable.description,
      productImage: productImages.imageUrl,
    })
    .from(cartTable)
    .leftJoin(productTable, eq(cartTable.productID, productTable.id))
    .leftJoin(productImages, and(
      eq(productImages.productID, productTable.id),
      eq(productImages.isPrimary, true)
    ))
    .where(and(
      eq(cartTable.userID, userID),
      eq(cartTable.isActive, true),
      from ? gte(cartTable.createdAt, new Date(from)) : undefined,
      to ? lte(cartTable.createdAt, new Date(to)) : undefined
    ))
    .orderBy(desc(cartTable.createdAt))
    .limit(limit)
    .offset(offset);

  // Transform to response format
  const items: CartItemResponse[] = cartItems.map((item) => ({
    id: item.id,
    userID: item.userID,
    productID: item.productID,
    quantity: item.quantity,
    isActive: item.isActive,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    deletedAt: item.deletedAt,
    productName: item.productName ?? undefined,
    productPrice: item.productPrice ?? undefined,
    productStatus: item.productStatus ?? undefined,
    productDescription: item.productDescription ?? undefined,
    productImage: item.productImage ?? undefined,
  }));

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Add item to cart
 */
export async function addToCart({
    userID, quantity, productID }: Omit<NewCartItem, "id">
): Promise<CartItemResponse> {

    const product = await db
    .select()
    .from(productTable)
    .where(
      and(
        eq(productTable.id, productID),
        eq(productTable.status, "ACTIVE"),
        isNull(productTable.deletedAt)
      )
    )
    .limit(1);

  if (!product.length) {
    throw new Error("Product not found or not available");
  }

  // Check if item already exists in cart for this user
  const existingItem = await db
    .select()
    .from(cartTable)
    .where(
      and(
        eq(cartTable.userID, userID),
        eq(cartTable.productID, productID),
        eq(cartTable.isActive, true),
        isNull(cartTable.deletedAt)
      )
    )
    .limit(1);

  if (existingItem.length > 0) {
    // Update quantity if item already exists
    const updatedItem = await db
      .update(cartTable)
      .set({
        quantity: (existingItem[0]!.quantity || 0) + (quantity || 1),
        updatedAt: new Date(),
      })
      .where(eq(cartTable.id, existingItem[0]!.id))
      .returning();

    return updatedItem[0]!;
  }

  // Create new cart item
  const newCartItem = await db
    .insert(cartTable)
    .values({
      id: createId(),
      userID,
      productID: productID,
      quantity: quantity,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })
    .returning();

  return newCartItem[0]!;
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  userID: string,
  data: UpdateCartItemInput
): Promise<CartItemResponse> {

  const cartItem = await db
    .select()
    .from(cartTable)
    .where(
      and(
        eq(cartTable.id, data.id),
        eq(cartTable.userID, userID),
        eq(cartTable.isActive, true),
        isNull(cartTable.deletedAt)
      )
    )

  if (!cartItem.length) {
    throw new Error("Cart item not found or not accessible");
  }

  const updatedItem = await db
    .update(cartTable)
    .set({
      quantity: data.quantity,
      updatedAt: new Date(),
    })
    .where(eq(cartTable.id, data.id))
    .returning();

  return updatedItem[0]!;
}

/**
 * Soft delete cart item
 */
export async function deleteCartItem(
  userID: string,
  data: DeleteCartItemInput
): Promise<CartItemResponse> {
  // Verify the cart item belongs to the user
  const cartItem = await db
    .select()
    .from(cartTable)
    .where(
      and(
        eq(cartTable.id, data.id),
        eq(cartTable.userID, userID),
        eq(cartTable.isActive, true),
        isNull(cartTable.deletedAt)
      )
    )
    .limit(1);

  if (!cartItem.length) {
    throw new Error("Cart item not found or not accessible");
  }

  // Soft delete the cart item
  const deletedItem = await db
    .update(cartTable)
    .set({
      isActive: false,
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(cartTable.id, data.id))
    .returning();

  return deletedItem[0]!;
}

/**
 * Get cart summary (total items, total value)
 */
export async function getCartSummary(userID: string) {
  const cartItems = await db
    .select({
      quantity: cartTable.quantity,
      productPrice: productTable.price,
    })
    .from(cartTable)
    .leftJoin(productTable, eq(cartTable.productID, productTable.id))
    .where(
      and(
        eq(cartTable.userID, userID),
        eq(cartTable.isActive, true),
        isNull(cartTable.deletedAt)
      )
    );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = cartItems.reduce(
    (sum, item) => sum + item.quantity * (item.productPrice || 0),
    0
  );

  return {
    totalItems,
    totalValue,
    itemCount: cartItems.length,
  };
}

/**
 * Clear all cart items for a user (soft delete)
 */
export async function clearCart(userID: string): Promise<void> {
  await db
    .update(cartTable)
    .set({
      isActive: false,
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(cartTable.userID, userID),
        eq(cartTable.isActive, true),
        isNull(cartTable.deletedAt)
      )
    );
}

/**
 * Deactivate all active cart items for a user (for checkout completion)
 * This is more efficient than fetching cart items first
 */
export async function deactivateUserCartItems(userID: string): Promise<{ deactivatedCount: number }> {
  const result = await db
    .update(cartTable)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(cartTable.userID, userID),
        eq(cartTable.isActive, true),
        isNull(cartTable.deletedAt)
      )
    )
    .returning({ id: cartTable.id });

  return { deactivatedCount: result.length };
}

/**
 * Bulk update all active cart items for a user (most efficient for status updates)
 * Use this when you want to update all cart items for a user at once
 */
export async function updateAllUserCartItems(
  userID: string,
  updates: { isActive?: boolean; quantity?: number }
): Promise<{ updatedCount: number }> {
  const result = await db
    .update(cartTable)
    .set({
      isActive: updates.isActive !== undefined ? updates.isActive : cartTable.isActive,
      quantity: updates.quantity !== undefined ? updates.quantity : cartTable.quantity,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(cartTable.userID, userID),
        eq(cartTable.isActive, true),
        isNull(cartTable.deletedAt)
      )
    )
    .returning({ id: cartTable.id });

  return { updatedCount: result.length };
}
