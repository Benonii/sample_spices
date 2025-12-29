import { z } from "zod";

export const createAddressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  state: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  userID: z.string().min(1),
  isDefault: z.boolean().optional(),
});

export const getAddressListQueryParameSchema = z.object({
  userID: z.string().min(1),
  state: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
});
export type GetAddressListQueryParameters = z.infer<typeof getAddressListQueryParameSchema>;

export const getAddressByIdQueryParameSchema = z.object({
  addressID: z.string().uuid("Invalid address ID format"),
});

export type GetAddressByIdQueryParameters = z.infer<typeof getAddressByIdQueryParameSchema>;

export const updateAddressSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  addressLine1: z.string().min(1).optional(),
  addressLine2: z.string().optional(),
  state: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  postalCode: z.string().min(1).optional(),
  isDefault: z.boolean().optional(),
});


export type UpdateAddress = z.infer<typeof updateAddressSchema> & { addressID: string };