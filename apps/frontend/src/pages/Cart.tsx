import React, { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, Loader2, AlertCircle, MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/useCart';
import { useAddresses } from '@/hooks/useAddresses';
import { AddressForm, AddressSelection } from '@/components';
import { authClient } from '@/lib/authClient';
import { useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { getCheckoutSession } from '@/lib/api';
import { toast } from 'sonner';
import type { Address, AddressFormData } from '@/lib/types';

const CartItem: React.FC<{ 
  item: any; 
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  loading: boolean;
}> = ({ item, onUpdateQuantity, onRemove, loading }) => {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [inputError, setInputError] = useState<string | null>(null);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setLocalQuantity(newQuantity);
      setInputError(null);
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const handleQuantityBlur = () => {
    if (localQuantity !== item.quantity) {
      if (localQuantity >= 1 && localQuantity <= 99) {
        setInputError(null);
        onUpdateQuantity(item.id, localQuantity);
      } else {
        setInputError('Quantity must be between 1 and 99');
        setLocalQuantity(item.quantity); // Reset to original value
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = Number(value);
    
    if (value === '' || (numValue >= 1 && numValue <= 99)) {
      setLocalQuantity(value === '' ? 0 : numValue);
      setInputError(null);
    } else if (numValue > 99) {
      setInputError('Maximum quantity is 99');
    } else if (numValue < 1 && value !== '') {
      setInputError('Minimum quantity is 1');
    }
  };

  return (
    <Card className="p-6 border-neutral-200 bg-white hover:shadow-lg transition-all duration-200">
      <div className="flex items-start space-x-4">
        {/* Product Image */}
        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200">
          {item.productImage ? (
            <img
              src={item.productImage}
              alt={item.productName || 'Product'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-50">
              <Package className="h-8 w-8 text-neutral-400" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="font-semibold text-neutral-900 text-lg leading-tight">
                {item.productName || 'Product Name'}
              </h3>
              {item.productDescription && (
                <p className="text-sm text-neutral-600 line-clamp-2">
                  {item.productDescription}
                </p>
              )}
              <p className="text-xl font-bold text-green-600">
                ${(item.productPrice || 0).toFixed(2)}
              </p>
            </div>
            
            {/* Quantity Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0 border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 disabled:opacity-50"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1 || loading}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <div className="flex flex-col">
                <Input
                  type="number"
                  min="1"
                  max="99"
                  value={localQuantity || ''}
                  onChange={handleInputChange}
                  onBlur={handleQuantityBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleQuantityBlur();
                    }
                  }}
                  className={`w-16 h-9 text-center font-medium text-neutral-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    inputError ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''
                  }`}
                  disabled={loading}
                />
                {inputError && (
                  <span className="text-xs text-red-500 mt-1 text-center">{inputError}</span>
                )}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0 border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 disabled:opacity-50"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={item.quantity >= 99 || loading}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Item Total */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200">
            <span className="text-lg font-semibold text-neutral-900">
              Item Total: <span className="text-green-600">${((item.productPrice || 0) * item.quantity).toFixed(2)}</span>
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item.id)}
              disabled={loading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const Cart: React.FC = () => {
  const { data: sessionData } = authClient.useSession();
  const user = sessionData?.user;
  const navigate = useNavigate();
  
  const {
    cartItems,
    loading,
    error,
    cartTotals,
    updateItemQuantity,
    removeItemFromCart,
  } = useCart(user?.id || null);

  const {
    addresses,
    loading: addressesLoading,
    createNewAddress,
    updateExistingAddress,
    deleteExistingAddress,
    getDefaultAddress,
  } = useAddresses(user?.id || null);

  // Address selection state
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressStep, setAddressStep] = useState<'select' | 'form'>('select');

  const handleContinueShopping = () => {
    navigate({ to: '/products' });
  };

  // Address handling functions
  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setAddressStep('form');
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressStep('form');
  };

  const handleAddressFormSubmit = async (data: AddressFormData) => {
    try {
      if (editingAddress) {
        await updateExistingAddress(editingAddress.id, data);
        toast.success('Address updated successfully');
      } else {
        await createNewAddress({ ...data, userID: user?.id || '' });
        toast.success('Address created successfully');
      }
      setAddressStep('select');
      setEditingAddress(null);
    } catch (error) {
      toast.error('Failed to save address');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await deleteExistingAddress(addressId);
      if (selectedAddress?.id === addressId) {
        setSelectedAddress(null);
      }
      toast.success('Address deleted successfully');
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const handleAddressFormCancel = () => {
    setAddressStep('select');
    setEditingAddress(null);
  };

  // Set default address when addresses are loaded
  React.useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddress = getDefaultAddress();
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    }
  }, [addresses, selectedAddress, getDefaultAddress]);

  const getCheckoutSessionMutation = useMutation({
    mutationFn: () => getCheckoutSession(cartItems.map((item) => ({ productID: item.productID, quantity: item.quantity })), selectedAddress?.id || '', user?.id as string),  
    onSuccess: (data: { message: string, data: { url: string } }) => {
      window.location.href = data?.data.url;
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || 'Failed to create checkout session');
    },
  });

  const handleCheckout = () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }
    getCheckoutSessionMutation.mutate();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center border-neutral-200">
            <ShoppingCart className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">Please Login</h1>
            <p className="text-neutral-600 mb-6">
              You need to be logged in to view your cart.
            </p>
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-md hover:shadow-lg"
              onClick={() => navigate({ to: '/login' })}
            >
              Login to Continue
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-700 text-lg">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center border-red-200">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-800 mb-2">Error Loading Cart</h1>
            <p className="text-red-600 mb-6">
              {error}
            </p>
            <Button 
              size="lg" 
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center border-neutral-200">
            <ShoppingCart className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">Your Cart is Empty</h1>
            <p className="text-neutral-600 mb-6">
              Looks like you haven't added any spices to your cart yet.
            </p>
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-md hover:shadow-lg"
              onClick={handleContinueShopping}
            >
              <Package className="h-4 w-4 mr-2" />
              Browse Spices
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-green-600 rounded-xl shadow-lg">
              <ShoppingCart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900">Spice Cart</h1>
          </div>
          <p className="text-lg text-neutral-600">
            Review your spices and proceed to checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateItemQuantity}
                  onRemove={removeItemFromCart}
                  loading={loading}
                />
              ))}
            </div>

            {/* Address Selection Section */}
            <div className="mt-8">
              <Card className="p-6 border-neutral-200 bg-white">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-neutral-900 flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Shipping Address</span>
                  </h2>
                  {selectedAddress && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Address Selected</span>
                    </div>
                  )}
                </div>

                {addressStep === 'select' ? (
                  <AddressSelection
                    addresses={addresses}
                    selectedAddressId={selectedAddress?.id}
                    onSelectAddress={handleSelectAddress}
                    onAddNew={handleAddNewAddress}
                    onEditAddress={handleEditAddress}
                    onDeleteAddress={handleDeleteAddress}
                    loading={addressesLoading}
                    showActions={true}
                  />
                ) : (
                  <AddressForm
                    onSubmit={handleAddressFormSubmit}
                    onCancel={handleAddressFormCancel}
                    initialData={editingAddress ? {
                      ...editingAddress,
                      addressLine2: editingAddress.addressLine2 || undefined
                    } : undefined}
                    loading={addressesLoading}
                    submitText={editingAddress ? 'Update Address' : 'Add Address'}
                    title={editingAddress ? 'Edit Address' : 'Add New Address'}
                  />
                )}
              </Card>
            </div>

            {/* Continue Shopping */}
            <div className="mt-8">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400"
                onClick={handleContinueShopping}
              >
                <Package className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 border-neutral-200 bg-white">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                {/* Summary Items */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-700">Subtotal ({cartTotals.itemCount} items)</span>
                    <span className="font-medium text-neutral-900">${cartTotals.subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-700">Shipping</span>
                    <span className="font-medium text-neutral-900">
                      {cartTotals.shipping > 0 ? `$${cartTotals.shipping.toFixed(2)}` : 'Free'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-700">Tax</span>
                    <span className="font-medium text-neutral-900">${cartTotals.tax.toFixed(2)}</span>
                  </div>
                </div>

                {/* Selected Address Summary */}
                {selectedAddress && (
                  <div className="border-t border-neutral-200 pt-4">
                    <div className="text-sm text-neutral-600 mb-2">Shipping to:</div>
                    <div className="text-sm text-neutral-900">
                      <div className="font-medium">{selectedAddress.firstName} {selectedAddress.lastName}</div>
                      <div>{selectedAddress.addressLine1}</div>
                      {selectedAddress.addressLine2 && <div>{selectedAddress.addressLine2}</div>}
                      <div>{selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}</div>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-neutral-300 pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-neutral-900">Total</span>
                    <span className="text-neutral-900">${cartTotals.total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1">
                    Including shipping and tax
                  </p>
                </div>

                {/* Checkout Button */}
                <Button 
                  size="lg" 
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                  disabled={cartItems.length === 0 || loading || !selectedAddress}
                  onClick={handleCheckout}
                >
                  {getCheckoutSessionMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>

                {!selectedAddress && (
                  <p className="text-sm text-amber-600 text-center mt-2">
                    Please select a shipping address to continue
                  </p>
                )}

                {/* Additional Info */}
                <div className="text-xs text-neutral-600 text-center space-y-1">
                  <p>Secure checkout powered by Stripe</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
