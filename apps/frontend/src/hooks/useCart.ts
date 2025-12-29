import { useState, useEffect, useCallback } from 'react';
import { getCartItems, addToCart, updateCartItem, deleteCartItem } from '@/lib/api';
import type { CartItem, AddToCartData } from '@/lib/types';

export const useCart = (userID: string | null) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart items
  const fetchCartItems = useCallback(async () => {
    if (!userID) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getCartItems(userID, { page: 1, limit: 100 });
      setCartItems(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cart items');
    } finally {
      setLoading(false);
    }
  }, [userID]);

  // Add item to cart
  const addItemToCart = useCallback(async (productID: string, quantity: number = 1) => {
    if (!userID) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const cartData: AddToCartData = { productID, userID, quantity };
      await addToCart(cartData);
      await fetchCartItems(); // Refresh cart
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
      // Refresh cart on error to ensure consistency
      await fetchCartItems();
    } finally {
      setLoading(false);
    }
  }, [userID, fetchCartItems]);

  // Update cart item quantity
  const updateItemQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    if (!userID) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await updateCartItem(cartItemId, { id: cartItemId, quantity, userID });
      await fetchCartItems(); // Refresh cart
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cart item');
      // Refresh cart on error to ensure consistency
      await fetchCartItems();
    } finally {
      setLoading(false);
    }
  }, [userID, fetchCartItems]);

  // Remove item from cart
  const removeItemFromCart = useCallback(async (cartItemId: string) => {
    if (!userID) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await deleteCartItem(cartItemId, userID);
      await fetchCartItems(); // Refresh cart
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove cart item');
      // Refresh cart on error to ensure consistency
      await fetchCartItems();
    } finally {
      setLoading(false);
    }
  }, [userID, fetchCartItems]);

  // Calculate cart totals
  const cartTotals = {
    itemCount: cartItems.length,
    subtotal: cartItems.reduce((sum, item) => sum + (item.productPrice || 0) * item.quantity, 0),
    shipping: cartItems.length > 0 ? 9.99 : 0,
    tax: cartItems.reduce((sum, item) => sum + (item.productPrice || 0) * item.quantity, 0) * 0.08,
    total: 0, // Initialize total
  };

  // Debug logging
  console.log('Cart items:', cartItems);
  console.log('Cart item count:', cartTotals.itemCount);

  // Calculate total after all other properties are set
  cartTotals.total = cartTotals.subtotal + cartTotals.shipping + cartTotals.tax;

  // Fetch cart items on mount and when userID changes
  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  return {
    cartItems,
    loading,
    error,
    cartTotals,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    fetchCartItems,
  };
};
