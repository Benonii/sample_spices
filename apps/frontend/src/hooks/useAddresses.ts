import { useState, useEffect, useCallback } from 'react';
import { getAddresses, createAddress, updateAddress, deleteAddress } from '@/lib/api';
import type { Address, CreateAddressData, UpdateAddressData } from '@/lib/types';

export const useAddresses = (userID: string | null) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    if (!userID) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAddresses(userID);
      setAddresses(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  }, [userID]);

  // Create new address
  const createNewAddress = useCallback(async (addressData: CreateAddressData) => {
    if (!userID) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await createAddress(addressData);
      setAddresses(prev => [...prev, response.data.address]);
      return response.data.address;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create address');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userID]);

  // Update existing address
  const updateExistingAddress = useCallback(async (addressID: string, addressData: UpdateAddressData) => {
    if (!userID) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await updateAddress(addressID, addressData);
      setAddresses(prev => 
        prev.map(addr => 
          addr.id === addressID ? response.data.address : addr
        )
      );
      return response.data.address;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update address');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userID]);

  // Delete address
  const deleteExistingAddress = useCallback(async (addressID: string) => {
    if (!userID) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await deleteAddress(addressID);
      setAddresses(prev => prev.filter(addr => addr.id !== addressID));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete address');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userID]);

  // Get default address
  const getDefaultAddress = useCallback(() => {
    return addresses.find(addr => addr.isDefault) || addresses[0] || null;
  }, [addresses]);

  // Fetch addresses on mount and when userID changes
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    createNewAddress,
    updateExistingAddress,
    deleteExistingAddress,
    getDefaultAddress,
  };
};
