import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { StateSelect } from '@/components/StateSelect';
import { Loader2, MapPin, User, Phone, Home } from 'lucide-react';
import type { AddressFormData } from '@/lib/types';

const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  isDefault: z.boolean().optional(),
});

interface AddressFormProps {
  onSubmit: (data: AddressFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<AddressFormData>;
  loading?: boolean;
  submitText?: string;
  title?: string;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  loading = false,
  submitText = 'Save Address',
  title = 'Add New Address',
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      phone: initialData?.phone || '',
      addressLine1: initialData?.addressLine1 || '',
      addressLine2: initialData?.addressLine2 || '',
      state: initialData?.state || '',
      city: initialData?.city || '',
      postalCode: initialData?.postalCode || '',
      isDefault: initialData?.isDefault || false,
    },
  });

  const handleFormSubmit = async (data: AddressFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <Card className="p-6 border-neutral-200 bg-white">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-green-600 rounded-lg">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
        </div>
        <p className="text-neutral-600 text-sm">
          Please provide your shipping address details.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-900 flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Personal Information</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-neutral-700">
                First Name *
              </Label>
              <Input
                id="firstName"
                {...register('firstName')}
                className={`${errors.firstName ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}`}
                placeholder="Enter your first name"
                disabled={loading || isSubmitting}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-neutral-700">
                Last Name *
              </Label>
              <Input
                id="lastName"
                {...register('lastName')}
                className={`${errors.lastName ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}`}
                placeholder="Enter your last name"
                disabled={loading || isSubmitting}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-neutral-700 flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>Phone Number *</span>
            </Label>
            <Input
              id="phone"
              {...register('phone')}
              className={`${errors.phone ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}`}
              placeholder="Enter your phone number"
              disabled={loading || isSubmitting}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-900 flex items-center space-x-2">
            <Home className="h-4 w-4" />
            <span>Address Information</span>
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="addressLine1" className="text-sm font-medium text-neutral-700">
              Address Line 1 *
            </Label>
            <Input
              id="addressLine1"
              {...register('addressLine1')}
              className={`${errors.addressLine1 ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}`}
              placeholder="Street address, P.O. box, company name, c/o"
              disabled={loading || isSubmitting}
            />
            {errors.addressLine1 && (
              <p className="text-sm text-red-600">{errors.addressLine1.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine2" className="text-sm font-medium text-neutral-700">
              Address Line 2
            </Label>
            <Input
              id="addressLine2"
              {...register('addressLine2')}
              className={`${errors.addressLine2 ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}`}
              placeholder="Apartment, suite, unit, building, floor, etc."
              disabled={loading || isSubmitting}
            />
            {errors.addressLine2 && (
              <p className="text-sm text-red-600">{errors.addressLine2.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium text-neutral-700">
                City *
              </Label>
              <Input
                id="city"
                {...register('city')}
                className={`${errors.city ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}`}
                placeholder="Enter city"
                disabled={loading || isSubmitting}
              />
              {errors.city && (
                <p className="text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium text-neutral-700">
                State *
              </Label>
              <StateSelect
                value={watch('state')}
                onValueChange={(value: string) => setValue('state', value)}
                placeholder="Select state"
                disabled={loading || isSubmitting}
                className={errors.state ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}
              />
              {errors.state && (
                <p className="text-sm text-red-600">{errors.state.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-sm font-medium text-neutral-700">
                Postal Code *
              </Label>
              <Input
                id="postalCode"
                {...register('postalCode')}
                className={`${errors.postalCode ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}`}
                placeholder="Enter postal code"
                disabled={loading || isSubmitting}
              />
              {errors.postalCode && (
                <p className="text-sm text-red-600">{errors.postalCode.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Default Address Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isDefault"
            {...register('isDefault')}
            disabled={loading || isSubmitting}
          />
          <Label htmlFor="isDefault" className="text-sm text-neutral-700 cursor-pointer">
            Set as default address
          </Label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading || isSubmitting}
              className="border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading || isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-md hover:shadow-lg"
          >
            {loading || isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              submitText
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};
