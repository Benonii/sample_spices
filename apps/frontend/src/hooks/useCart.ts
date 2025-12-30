import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCartItems, addToCart, updateCartItem, deleteCartItem } from '@/lib/api';
import type { CartItem, AddToCartData } from '@/lib/types';

export const useCart = (userID: string | null) => {
  const queryClient = useQueryClient();
  const queryKey = ['cart', userID];

  // Fetch cart items
  const {
    data: cartItems = [],
    isLoading: loading,
    error,
    refetch: fetchCartItems
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!userID) return [];
      const response = await getCartItems(userID, { page: 1, limit: 100 });
      return response.items;
    },
    enabled: !!userID,
    staleTime: 1000 * 60, // 1 minute
  });

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async ({ productID, quantity }: { productID: string; quantity: number }) => {
      if (!userID) throw new Error('User not logged in');
      const cartData: AddToCartData = { productID, userID, quantity };
      return addToCart(cartData);
    },
    onMutate: async ({ productID, quantity }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousCart = queryClient.getQueryData<CartItem[]>(queryKey);

      // Optimistically update cache
      if (previousCart) {
        // Check if item exists
        const existingItemIndex = previousCart.findIndex(item => item.productID === productID);

        if (existingItemIndex >= 0) {
          // Update quantity if exists (though usually add is for new items)
          const newCart = [...previousCart];
          newCart[existingItemIndex] = {
            ...newCart[existingItemIndex],
            quantity: newCart[existingItemIndex].quantity + quantity
          };
          queryClient.setQueryData(queryKey, newCart);
        } else {
          // Add new mock item
          const newItem: CartItem = {
            id: `temp-${Date.now()}`,
            productID,
            userID: userID!,
            quantity,
            productName: 'Loading...',
            productPrice: 0,
            productImage: '',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          };
          queryClient.setQueryData(queryKey, [...previousCart, newItem]);
        }
      }
      return { previousCart };
    },
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(queryKey, context?.previousCart);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => {
      if (!userID) throw new Error('User not logged in');
      return updateCartItem(cartItemId, { id: cartItemId, quantity, userID });
    },
    onMutate: async ({ cartItemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousCart = queryClient.getQueryData<CartItem[]>(queryKey);

      if (previousCart) {
        const newCart = previousCart.map(item =>
          item.id === cartItemId ? { ...item, quantity } : item
        );
        queryClient.setQueryData(queryKey, newCart);
      }
      return { previousCart };
    },
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(queryKey, context?.previousCart);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (cartItemId: string) => {
      if (!userID) throw new Error('User not logged in');
      return deleteCartItem(cartItemId, userID);
    },
    onMutate: async (cartItemId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousCart = queryClient.getQueryData<CartItem[]>(queryKey);

      if (previousCart) {
        const newCart = previousCart.filter(item => item.id !== cartItemId);
        queryClient.setQueryData(queryKey, newCart);
      }
      return { previousCart };
    },
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(queryKey, context?.previousCart);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Wrappers to match existing interface
  const addItemToCart = async (productID: string, quantity: number = 1) => {
    return addItemMutation.mutateAsync({ productID, quantity });
  };

  const updateItemQuantity = async (cartItemId: string, quantity: number) => {
    return updateItemMutation.mutateAsync({ cartItemId, quantity });
  };

  const removeItemFromCart = async (cartItemId: string) => {
    return removeItemMutation.mutateAsync(cartItemId);
  };

  // Calculate cart totals
  const cartTotals = {
    itemCount: cartItems.length,
    subtotal: cartItems.reduce((sum, item) => sum + (item.productPrice || 0) * item.quantity, 0),
    shipping: cartItems.length > 0 ? 9.99 : 0,
    tax: cartItems.reduce((sum, item) => sum + (item.productPrice || 0) * item.quantity, 0) * 0.08,
    total: 0,
  };

  // Calculate total
  cartTotals.total = cartTotals.subtotal + cartTotals.shipping + cartTotals.tax;

  return {
    cartItems,
    loading: loading || addItemMutation.isPending || updateItemMutation.isPending || removeItemMutation.isPending,
    error: error ? (error as Error).message : null,
    cartTotals,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    fetchCartItems,
  };
};
