import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Plus, Edit, Trash2, Check, Loader2 } from 'lucide-react';
import type { Address } from '@/lib/types';

interface AddressSelectionProps {
  addresses: Address[];
  selectedAddressId?: string;
  onSelectAddress: (address: Address) => void;
  onAddNew: () => void;
  onEditAddress?: (address: Address) => void;
  onDeleteAddress?: (addressId: string) => void;
  loading?: boolean;
  showActions?: boolean;
}

export const AddressSelection: React.FC<AddressSelectionProps> = ({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNew,
  onEditAddress,
  onDeleteAddress,
  loading = false,
  showActions = true,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (addressId: string) => {
    if (!onDeleteAddress) return;
    
    setDeletingId(addressId);
    try {
      await onDeleteAddress(addressId);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 border-neutral-200 bg-white">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
          <span className="ml-3 text-neutral-700">Loading addresses...</span>
        </div>
      </Card>
    );
  }

  if (addresses.length === 0) {
    return (
      <Card className="p-6 border-neutral-200 bg-white">
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Addresses Found</h3>
          <p className="text-neutral-600 mb-6">
            You haven't added any addresses yet. Add your first address to continue.
          </p>
          <Button
            onClick={onAddNew}
            className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-md hover:shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900 flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>Select Shipping Address</span>
        </h3>
        {showActions && (
          <Button
            onClick={onAddNew}
            variant="outline"
            size="sm"
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {addresses.map((address) => (
          <Card
            key={address.id}
            className={`p-4 border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedAddressId === address.id
                ? 'border-green-500 bg-green-50'
                : 'border-neutral-200 bg-white hover:border-neutral-300'
            }`}
            onClick={() => onSelectAddress(address)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-neutral-900">
                    {address.firstName} {address.lastName}
                  </h4>
                  {address.isDefault && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Default
                    </span>
                  )}
                  {selectedAddressId === address.id && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </div>
                
                <div className="space-y-1 text-sm text-neutral-600">
                  <p>{address.addressLine1}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  <p>
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="font-medium">{address.phone}</p>
                </div>
              </div>

              {showActions && (
                <div className="flex items-center space-x-2 ml-4">
                  {onEditAddress && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditAddress(address);
                      }}
                      className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onDeleteAddress && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(address.id);
                      }}
                      disabled={deletingId === address.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingId === address.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
