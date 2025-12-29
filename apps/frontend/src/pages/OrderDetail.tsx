import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { authClient } from '../lib/authClient';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  MapPin, 
  Calendar, 
  CreditCard, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  RefreshCw,
  Download,
  MessageSquare
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useOrder, useCancelOrder, useRefreshOrder } from '../hooks/useOrders';
import type { CompleteOrder } from '../lib/types';

const OrderDetail: React.FC = () => {
  const { orderId } = useParams({ from: '/orders/$orderId' });
  const navigate = useNavigate();
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);

  // Use TanStack Query for data fetching
  const { 
    data: orderResponse, 
    isLoading, 
    error 
  } = useOrder(orderId);

  const cancelOrderMutation = useCancelOrder();
  const refreshOrder = useRefreshOrder();

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) return;
    
    try {
      await cancelOrderMutation.mutateAsync({ 
        orderId, 
        data: { reason: cancelReason } 
      });
      setShowCancelForm(false);
      setCancelReason('');
      // TanStack Query will automatically update the cache
    } catch (err) {
      console.error('Failed to cancel order:', err);
    }
  };

  // Extract order data from response
  const order = orderResponse?.data;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          text: 'Delivered'
        };
      case 'SHIPPED':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Truck,
          text: 'Shipped'
        };
      case 'PROCESSING':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          text: 'Processing'
        };
      case 'CONFIRMED':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: CheckCircle,
          text: 'Confirmed'
        };
      case 'CANCELLED':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          text: 'Cancelled'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
          text: 'Pending'
        };
    }
  };

  const getPaymentStatusConfig = (status: string) => {
    switch (status) {
      case 'PAID':
        return { color: 'text-green-600', text: 'Paid' };
      case 'PENDING':
        return { color: 'text-yellow-600', text: 'Pending' };
      case 'FAILED':
        return { color: 'text-red-600', text: 'Failed' };
      case 'REFUNDED':
        return { color: 'text-blue-600', text: 'Refunded' };
      default:
        return { color: 'text-gray-600', text: 'Unknown' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
              <div className="animate-spin h-12 w-12 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 text-center font-medium">Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
              <div className="bg-red-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Package className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                Order not found
              </h2>
              <p className="text-red-600 text-center mb-4">
                {error instanceof Error ? error.message : 'An unknown error occurred'}
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate({ to: '/orders' })}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Orders
                </Button>
                <Button 
                  onClick={fetchOrder}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.order.orderStatus);
  const paymentConfig = getPaymentStatusConfig(order.order.paymentStatus);
  const StatusIcon = statusConfig.icon;

  const canCancelOrder = ['PENDING', 'CONFIRMED'].includes(order.order.orderStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate({ to: '/orders' })}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order #{order.order.orderNumber}
              </h1>
              <p className="text-gray-600">
                Placed on {new Date(order.order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-medium border ${statusConfig.color} flex items-center gap-2`}>
                <StatusIcon className="h-4 w-4" />
                {statusConfig.text}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Details */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Details
              </h2>
              
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {order.product.name}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {order.product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600">
                        Quantity: <span className="font-medium">{order.order.quantity}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Unit Price: <span className="font-medium">${order.order.unitPrice}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${(order.order.unitPrice * order.order.quantity).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Delivery Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Information
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Delivery Address</h3>
                    <div className="text-gray-600 space-y-1">
                      <div>{order.address.name}</div>
                      <div>{order.address.address}</div>
                      <div>{order.address.city}, {order.address.state} {order.address.postal}</div>
                      <div>{order.address.country}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Contact Information</h3>
                    <div className="text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {order.address.phoneNumber}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {order.user.email}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Delivery Status</h3>
                      <div className={`text-sm ${statusConfig.color.replace('bg-', 'text-').replace('border-', '').replace('100', '600')}`}>
                        {statusConfig.text}
                      </div>
                    </div>
                    
                    {order.order.trackingNumber && (
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Tracking Number</div>
                        <div className="font-mono font-medium text-gray-900">
                          {order.order.trackingNumber}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Order Timeline */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Order Timeline
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Order Placed</div>
                    <div className="text-sm text-gray-600">
                      {new Date(order.order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                
                {order.order.orderStatus !== 'PENDING' && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Order Confirmed</div>
                      <div className="text-sm text-gray-600">Order has been confirmed and is being prepared</div>
                    </div>
                  </div>
                )}
                
                {['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.order.orderStatus) && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Processing</div>
                      <div className="text-sm text-gray-600">Your order is being prepared for shipment</div>
                    </div>
                  </div>
                )}
                
                {['SHIPPED', 'DELIVERED'].includes(order.order.orderStatus) && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Truck className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Shipped</div>
                      <div className="text-sm text-gray-600">
                        {order.order.trackingNumber && (
                          <>Tracking: {order.order.trackingNumber}</>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {order.order.orderStatus === 'DELIVERED' && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Delivered</div>
                      <div className="text-sm text-gray-600">Your order has been delivered successfully</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${(order.order.unitPrice * order.order.quantity).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${(order.order.unitPrice * order.order.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Information */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${paymentConfig.color}`}>
                    {paymentConfig.text}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method</span>
                  <span className="font-medium">Credit Card</span>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
                
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                
                {canCancelOrder && !showCancelForm && (
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setShowCancelForm(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
              </div>
              
              {/* Cancel Order Form */}
              {showCancelForm && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="font-medium text-red-900 mb-2">Cancel Order</h3>
                  <p className="text-sm text-red-700 mb-3">
                    Please provide a reason for cancellation:
                  </p>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Reason for cancellation..."
                    className="w-full h-20 p-2 border border-red-200 rounded text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={handleCancelOrder}
                      disabled={!cancelReason.trim() || cancelOrderMutation.isPending}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      size="sm"
                    >
                      {cancelOrderMutation.isPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        'Confirm Cancel'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCancelForm(false);
                        setCancelReason('');
                      }}
                      className="flex-1"
                      size="sm"
                    >
                      Keep Order
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
