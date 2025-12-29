import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getOrders, 
  getOrder, 
  createOrder, 
  updateOrder, 
  cancelOrder, 
  deleteOrder 
} from '../lib/api';
import type { 
  OrderQueryParams, 
  CreateOrderData, 
  UpdateOrderData, 
  CancelOrderData 
} from '../lib/types';

// Query keys for consistent cache management
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderQueryParams) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

// Hook for fetching orders with filters
export const useOrders = (params: OrderQueryParams = {}) => {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: async () => {
      console.log('🔍 Fetching orders with params:', params);
      const result = await getOrders(params);
      console.log('📦 Orders API response:', result);
      return result;
    },
    staleTime: 30 * 1000, // 30 seconds - shorter stale time for better refresh
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch when component mounts
  });
};

// Hook for fetching a single order
export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => getOrder(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for creating orders
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      // Invalidate orders list and add new order to cache
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.setQueryData(
        orderKeys.detail(data.data.order.order.id),
        data
      );
    },
    onError: (error) => {
      console.error('Failed to create order:', error);
    },
  });
};

// Hook for updating orders
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: UpdateOrderData }) =>
      updateOrder(orderId, data),
    onSuccess: (data, variables) => {
      // Update the specific order in cache
      queryClient.setQueryData(
        orderKeys.detail(variables.orderId),
        data
      );
      // Invalidate orders list to reflect changes
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to update order:', error);
    },
  });
};

// Hook for canceling orders
export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: CancelOrderData }) =>
      cancelOrder(orderId, data),
    onSuccess: (data, variables) => {
      // Update the specific order in cache
      queryClient.setQueryData(
        orderKeys.detail(variables.orderId),
        data
      );
      // Invalidate orders list to reflect changes
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to cancel order:', error);
    },
  });
};

// Hook for deleting orders
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: (_, orderId) => {
      // Remove the deleted order from cache
      queryClient.removeQueries({ queryKey: orderKeys.detail(orderId) });
      // Invalidate orders list to reflect changes
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to delete order:', error);
    },
  });
};

// Hook for refreshing orders data
export const useRefreshOrders = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
  };
};

// Hook for refreshing a specific order
export const useRefreshOrder = () => {
  const queryClient = useQueryClient();
  
  return (orderId: string) => {
    queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
  };
};
