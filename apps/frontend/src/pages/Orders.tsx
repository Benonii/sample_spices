import React, { useState, useMemo } from 'react';
import { Search, Filter, Package, RefreshCw } from 'lucide-react';
import { authClient } from '../lib/authClient';
import { OrderCard } from '../components/OrderCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { useOrders, useRefreshOrders } from '../hooks/useOrders';
import type { OrderQueryParams, BackendOrder } from '../lib/types';

const Orders: React.FC = () => {
  const { data: sessionData } = authClient.useSession();
  const user = sessionData?.user;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState('active');
  
  // Build query parameters
  const queryParams: OrderQueryParams = useMemo(() => {
    const params: OrderQueryParams = {};
    
    // Always include userID for authenticated user
    if (user?.id) {
      params.userID = user.id;
    }
    
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    if (statusFilter !== 'ALL') {
      params.status = statusFilter as any;
    }

    return params;
  }, [user?.id, searchTerm, statusFilter]);

  // Use TanStack Query for data fetching
  const { 
    data: ordersData, 
    isLoading, 
    error, 
    refetch,
    isRefetching
  } = useOrders(queryParams);

  // Get the refresh function from the hook
  const refreshOrders = useRefreshOrders();

  const handleRefresh = async () => {
    console.log('🔄 Refreshing orders...');
    try {
      // Use the dedicated refresh function for better cache management
      refreshOrders();
      // Also trigger immediate refetch for better UX
      await refetch();
      console.log('✅ Orders refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh orders:', error);
    }
  };

  const handleCancelOrder = async (orderID: string, reason: string) => {
    try {
      // TODO: Implement cancel order API call
      console.log('Canceling order:', orderID, 'Reason:', reason);
      // TanStack Query will automatically refetch and update the cache
      refetch();
    } catch (err) {
      console.error('Failed to cancel order:', err);
    }
  };

  const orders: BackendOrder[] = ordersData?.data || [];
  
  // Deduplicate orders by ID (backend seems to return duplicates)
  const uniqueOrders = useMemo(() => {
    const seen = new Set<string>();
    return orders.filter(order => {
      if (seen.has(order.id)) {
        return false;
      }
      seen.add(order.id);
      return true;
    });
  }, [orders]);
  
  // Filter orders based on search and status (backend returns flat objects)
  const filteredOrders = useMemo(() => {
    return uniqueOrders.filter(order => {
      const matchesSearch = !searchTerm || 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.productName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || order.orderStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [uniqueOrders, searchTerm, statusFilter]);

  // Separate orders into active and completed
  const { activeOrders, completedOrders } = useMemo(() => {
    const active = filteredOrders.filter(order => 
      !['DELIVERED', 'CANCELLED'].includes(order.orderStatus)
    );
    const completed = filteredOrders.filter(order => 
      ['DELIVERED', 'CANCELLED'].includes(order.orderStatus)
    );
    return { activeOrders: active, completedOrders: completed };
  }, [filteredOrders]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <Package className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Sign in required
          </h2>
          <p className="text-gray-600 text-center">
            Please sign in to view your orders.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
              <div className="animate-spin h-12 w-12 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 text-center font-medium">Loading your orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
              <div className="bg-red-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Package className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                Failed to load orders
              </h2>
              <p className="text-red-600 text-center mb-4">
                {error instanceof Error ? error.message : 'An unknown error occurred'}
              </p>
              <Button 
                onClick={handleRefresh}
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
              <p className="text-gray-600">Track and manage your spice orders</p>
            </div>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              disabled={isRefetching}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              {isRefetching ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {/* Order Summary Stats - Moved to top */}
          {uniqueOrders.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{uniqueOrders.length}</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {uniqueOrders.filter(o => o.orderStatus === 'DELIVERED').length}
                  </div>
                  <div className="text-sm text-gray-600">Delivered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {uniqueOrders.filter(o => ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.orderStatus)).length}
                  </div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    ${uniqueOrders.reduce((total, order) => total + (order.unitPrice * order.quantity), 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by order number or product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {/* Status Filter */}
              <div className="lg:w-48">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                  >
                    <option value="ALL">All Orders</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Active Orders ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Completed ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeOrders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="bg-gray-100 rounded-full p-6 w-fit mx-auto mb-6">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {searchTerm || statusFilter !== 'ALL' ? 'No active orders found' : 'No active orders'}
                </h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm || statusFilter !== 'ALL' 
                    ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                    : 'You don\'t have any pending spice orders at the moment.'
                  }
                </p>
                {(!searchTerm && statusFilter === 'ALL') && (
                  <Button 
                    onClick={() => window.location.href = '/products'}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    Browse Spices
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {activeOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onCancelOrder={handleCancelOrder}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedOrders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="bg-gray-100 rounded-full p-6 w-fit mx-auto mb-6">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {searchTerm || statusFilter !== 'ALL' ? 'No completed orders found' : 'No completed orders'}
                </h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm || statusFilter !== 'ALL' 
                    ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                    : 'You don\'t have any completed spice orders yet.'
                  }
                </p>
                {(!searchTerm && statusFilter === 'ALL') && (
                  <Button 
                    onClick={() => window.location.href = '/products'}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    Browse Spices
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {completedOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onCancelOrder={handleCancelOrder}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Orders;