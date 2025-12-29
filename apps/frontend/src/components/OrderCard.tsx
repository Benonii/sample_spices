import React, { useState } from 'react';
import { Package, Clock, MapPin, Eye, EyeOff, Truck, CheckCircle, XCircle, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCancelOrder } from '@/hooks/useOrders';
import type { BackendOrder } from '@/lib/types';

interface OrderCardProps {
  order: BackendOrder;
  onCancelOrder?: (orderID: string, reason: string) => void;
}

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
        color: 'bg-purple-100 text-purple-800 border-purple-200',
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
        color: 'bg-neutral-100 text-neutral-800 border-neutral-200',
        icon: AlertCircle,
        text: 'Pending'
      };
  }
};

const getPaymentStatusConfig = (status: string) => {
  switch (status) {
    case 'PAID':
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        text: 'Paid'
      };
    case 'FAILED':
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        text: 'Failed'
      };
    case 'REFUNDED':
      return {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        text: 'Refunded'
      };
    default:
      return {
        color: 'bg-neutral-100 text-neutral-800 border-neutral-200',
        text: 'Pending'
      };
  }
};



export const OrderCard: React.FC<OrderCardProps> = ({ order, onCancelOrder }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  const cancelOrderMutation = useCancelOrder();

  const orderStatusConfig = getStatusConfig(order.orderStatus);
  const paymentStatusConfig = getPaymentStatusConfig(order.paymentStatus);
  const StatusIcon = orderStatusConfig.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) return;
    
    try {
      await cancelOrderMutation.mutateAsync({ 
        orderId: order.id, 
        data: { reason: cancelReason.trim() } 
      });
      
      if (onCancelOrder) {
        onCancelOrder(order.id, cancelReason.trim());
      }
      
      setShowCancelForm(false);
      setCancelReason('');
    } catch (err) {
      console.error('Failed to cancel order:', err);
    }
  };

  const canCancel = order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED';

  return (
    <Card className="group h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-neutral-200">
      <div className="p-6">
        {/* Order Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-neutral-900 font-inter">
                {order.orderNumber}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${orderStatusConfig.color}`}>
                <StatusIcon className="inline h-3 w-3 mr-1" />
                {orderStatusConfig.text}
              </span>
            </div>
            <p className="text-sm text-neutral-600">
              Ordered on {formatDate(order.createdAt)}
            </p>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-xs font-medium border ${paymentStatusConfig.color}`}>
                {paymentStatusConfig.text}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-bold text-neutral-900 font-inter">
              {formatCurrency(order.grandTotal)}
            </p>
            <p className="text-sm text-neutral-600">
              {order.quantity} item{order.quantity !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Product Information */}
        <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
                      <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center">
                {order.productMainImage ? (
                  <img 
                    src={order.productMainImage} 
                    alt={order.productName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Package className="h-8 w-8 text-neutral-600" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-neutral-900 font-inter">
                  {order.productName}
                </h4>
                <p className="text-sm text-neutral-600">
                  Quantity: {order.quantity} × {formatCurrency(order.unitPrice)}
                </p>
                <p className="text-sm text-neutral-600">
                  Subtotal: {formatCurrency(order.subtotal)}
                </p>
              </div>
            </div>
        </div>

        {/* Order Summary */}
        <div className="mb-6 space-y-2 text-sm">
          {order.taxAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-neutral-600">Tax:</span>
              <span className="font-medium text-neutral-900">{formatCurrency(order.taxAmount)}</span>
            </div>
          )}
          {order.shippingCost > 0 && (
            <div className="flex justify-between">
              <span className="text-neutral-600">Shipping:</span>
              <span className="font-medium text-neutral-900">{formatCurrency(order.shippingCost)}</span>
            </div>
          )}
          {order.discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-neutral-600">Discount:</span>
              <span className="font-medium text-neutral-900">-{formatCurrency(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-neutral-200">
            <span className="font-semibold text-neutral-900">Total:</span>
            <span className="font-bold text-neutral-900">{formatCurrency(order.grandTotal)}</span>
          </div>
        </div>

        {/* Order Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
          <div className="flex items-center space-x-4">
            {order.trackingNumber && (
              <div className="flex items-center space-x-2 text-sm text-neutral-600">
                <MapPin className="h-4 w-4" />
                <span>Tracking: {order.trackingNumber}</span>
              </div>
            )}
            {order.updatedAt && (
              <div className="flex items-center space-x-2 text-sm text-neutral-600">
                <Clock className="h-4 w-4" />
                <span>Updated: {formatDate(order.updatedAt)}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelForm(!showCancelForm)}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                Cancel Order
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2"
            >
              {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{isExpanded ? 'Hide' : 'View'} Details</span>
            </Button>
            <Button
              size="sm"
              onClick={() => navigate({ to: `/orders/${order.id}` })}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700"
            >
              <span>Full Details</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Cancel Order Form */}
        {showCancelForm && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h5 className="font-medium text-red-900 mb-3">Cancel Order</h5>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason for cancellation..."
              className="w-full p-3 border border-red-300 rounded-lg text-sm resize-none"
              rows={3}
            />
            <div className="flex items-center space-x-2 mt-3">
              <Button
                size="sm"
                onClick={handleCancelOrder}
                disabled={!cancelReason.trim() || cancelOrderMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {cancelOrderMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelForm(false)}
                className="border-red-300 text-red-600 hover:bg-red-100"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-neutral-200 space-y-4">
            <h4 className="font-semibold text-neutral-900 font-inter">Order Details</h4>
            
            {/* Shipping Address */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Shipping Address</h5>
              <div className="text-sm text-blue-700">
                <p>{order.addressLine1}</p>
                <p>{order.city}, {order.state} {order.postalCode}</p>
                <p>United States</p>
              </div>
            </div>

            {/* Payment Information */}
            {order.paymentMethod && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h5 className="font-medium text-green-900 mb-2">Payment Method</h5>
                <p className="text-sm text-green-700">{order.paymentMethod}</p>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="p-4 bg-neutral-50 rounded-lg">
                <h5 className="font-medium text-neutral-900 mb-2">Order Notes</h5>
                <p className="text-sm text-neutral-700">{order.notes}</p>
              </div>
            )}

            {/* Cancellation Info */}
            {order.cancelledAt && (
              <div className="p-4 bg-red-50 rounded-lg">
                <h5 className="font-medium text-red-900 mb-2">Cancellation Details</h5>
                <div className="text-sm text-red-700 space-y-1">
                  <p>Cancelled on: {formatDate(order.cancelledAt)}</p>
                  {order.cancellationReason && (
                    <p>Reason: {order.cancellationReason}</p>
                  )}
                  {order.refundAmount > 0 && (
                    <p>Refund Amount: {formatCurrency(order.refundAmount)}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
