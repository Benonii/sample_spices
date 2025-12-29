import { db } from "@/db";
import { addressTable, userAddress, type CompleteAddress } from "./addressSchema.sql";
import { type NewAddress, type Address, type NewUserAddress, type UserAddress } from "./addressSchema.sql";
import type { GetAddressListQueryParameters, UpdateAddress } from "./validation";
import { and, eq, or } from "drizzle-orm";

export const createAddress = async (
  addressData: Omit<NewAddress, 'id' | 'createdAt' | 'updatedAt'>,
  userData: Omit<NewUserAddress, 'id' | 'addressID' | 'createdAt' | 'updatedAt'>
): Promise<{ address: CompleteAddress }> => {
  try {
    // Check if address already exists
    const existingAddress = await db.select().from(addressTable).where(
      and(
        eq(addressTable.addressLine1, addressData.addressLine1),
        eq(addressTable.city, addressData.city),
        eq(addressTable.state, addressData.state),
        eq(addressTable.postalCode, addressData.postalCode)
      )
    ).limit(1);

    let addressID: string | undefined;

    if (existingAddress.length > 0) {
      // Use existing address
      addressID = existingAddress[0]!.id;
    } else {
      // Create new address
      const newAddress = await db.insert(addressTable).values(addressData).returning();
      addressID = newAddress[0]!.id;
    }

    const newUserAddress = await db.insert(userAddress).values({
      ...userData,
      addressID,
    }).returning();

    // Return the complete address data structure
    const completeAddress = {
      id: addressID,
      userID: userData.userID,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      isDefault: userData.isDefault || false,
      addressLine1: addressData.addressLine1,
      addressLine2: addressData.addressLine2 || null,
      state: addressData.state,
      city: addressData.city,
      postalCode: addressData.postalCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      address: completeAddress,
    };
  } catch (error) {
    // Re-throw the error to be handled by the route
    throw error;
  }
};

export const getAddressList = async ({
  userID, state,
  city, postalCode
}: GetAddressListQueryParameters): Promise<CompleteAddress[]> => {
  const addressList = await db.select().from(userAddress)
    .innerJoin(addressTable, eq(userAddress.addressID, addressTable.id))
    .where(
      and(
        eq(userAddress.userID, userID),
        state ? eq(addressTable.state, state) : undefined,
        city ? eq(addressTable.city, city) : undefined,
        postalCode ? eq(addressTable.postalCode, postalCode) : undefined
      )
    );
  
  return addressList.map(row => ({
    id: row.address.id, // Use address ID as the main ID
    userID: row.user_address.userID,
    firstName: row.user_address.firstName,
    lastName: row.user_address.lastName,
    phone: row.user_address.phone,
    isDefault: row.user_address.isDefault,
    addressLine1: row.address.addressLine1,
    addressLine2: row.address.addressLine2 || null,
    state: row.address.state,
    city: row.address.city,
    postalCode: row.address.postalCode,
    createdAt: row.user_address.createdAt,
    updatedAt: row.user_address.updatedAt,
  }));
};


export const getAddressByID = async (addressID: string): Promise<CompleteAddress | undefined> => {
  const userAddressData = await db.select().from(userAddress)
    .innerJoin(addressTable, eq(userAddress.addressID, addressTable.id))
    .where(eq(userAddress.addressID, addressID))
    .limit(1);

  if (userAddressData.length === 0) return undefined;

  const row = userAddressData[0]!;
  return {
    id: row.address.id, // Use address ID as the main ID
    userID: row.user_address.userID,
    firstName: row.user_address.firstName,
    lastName: row.user_address.lastName,
    phone: row.user_address.phone,
    isDefault: row.user_address.isDefault,
    addressLine1: row.address.addressLine1,
    addressLine2: row.address.addressLine2 || null,
    state: row.address.state,
    city: row.address.city,
    postalCode: row.address.postalCode,
    createdAt: row.user_address.createdAt,
    updatedAt: row.user_address.updatedAt,
  };
}

export const updateAddress = async ({ addressID, ...addressData }: UpdateAddress): Promise<CompleteAddress> => {
  try {
    // Separate address data from user address data
    const addressUpdateData: any = {};
    const userAddressUpdateData: any = {};
    
    // Fields that belong to the address table
    if (addressData.addressLine1 !== undefined) addressUpdateData.addressLine1 = addressData.addressLine1;
    if (addressData.addressLine2 !== undefined) addressUpdateData.addressLine2 = addressData.addressLine2;
    if (addressData.city !== undefined) addressUpdateData.city = addressData.city;
    if (addressData.state !== undefined) addressUpdateData.state = addressData.state;
    if (addressData.postalCode !== undefined) addressUpdateData.postalCode = addressData.postalCode;
    
    // Fields that belong to the user_address table
    if (addressData.firstName !== undefined) userAddressUpdateData.firstName = addressData.firstName;
    if (addressData.lastName !== undefined) userAddressUpdateData.lastName = addressData.lastName;
    if (addressData.phone !== undefined) userAddressUpdateData.phone = addressData.phone;
    if (addressData.isDefault !== undefined) userAddressUpdateData.isDefault = addressData.isDefault;
    
    // Update address table if there are address fields to update
    if (Object.keys(addressUpdateData).length > 0) {
      addressUpdateData.updatedAt = new Date();
      await db.update(addressTable)
        .set(addressUpdateData)
        .where(eq(addressTable.id, addressID));
    }
    
    // Update user_address table if there are user address fields to update
    if (Object.keys(userAddressUpdateData).length > 0) {
      userAddressUpdateData.updatedAt = new Date();
      await db.update(userAddress)
        .set(userAddressUpdateData)
        .where(eq(userAddress.addressID, addressID));
    }

    // Fetch the complete updated address data
    const updatedAddressData = await getAddressByID(addressID);
    if (!updatedAddressData) {
      throw new Error("Failed to fetch updated address data");
    }
    return updatedAddressData;
  } catch (error) {
    // Re-throw the error to be handled by the route
    throw error;
  }
}

export const deleteAddress = async (addressID: string): Promise<CompleteAddress> => {
  try {
    // Get the complete address data before deletion
    const addressData = await getAddressByID(addressID);
    if (!addressData) {
      throw new Error("Address not found");
    }
    
    await db.transaction(async (tx) => {
      await tx.delete(userAddress).where(eq(userAddress.addressID, addressID));
      await tx.delete(addressTable).where(eq(addressTable.id, addressID));
    });
    
    return addressData;
  } catch (error) {
    throw error;
  }
}

export const checkUserAddressConflict = async (
  userID: string,
  addressData: Omit<NewAddress, 'id' | 'createdAt' | 'updatedAt'>
): Promise<boolean> => {
  const existingUserAddress = await db.select().from(userAddress)
    .innerJoin(addressTable, eq(userAddress.addressID, addressTable.id))
    .where(
      and(
        eq(userAddress.userID, userID),
        eq(addressTable.addressLine1, addressData.addressLine1),
        eq(addressTable.city, addressData.city),
        eq(addressTable.state, addressData.state),
        eq(addressTable.postalCode, addressData.postalCode)
      )
    )
    .limit(1);

  return existingUserAddress.length > 0;
};

export const checkUserDefaultAddressConflict = async (userID: string): Promise<boolean> => {
  const existingDefaultAddresses = await db.select().from(userAddress)
    .where(
      and(
        eq(userAddress.userID, userID),
        eq(userAddress.isDefault, true)
      )
    );

  return existingDefaultAddresses.length > 0;
};

export const checkUserDefaultAddressConflictOnUpdate = async (userID: string, addressID: string): Promise<boolean> => {
  const existingDefaultAddresses = await db.select().from(userAddress)
    .where(
      and(
        eq(userAddress.userID, userID),
        eq(userAddress.isDefault, true),
        // Exclude the current address being updated
        eq(userAddress.addressID, addressID)
      )
    );

  return existingDefaultAddresses.length > 0;
};

export const checkAddressConflictOnUpdate = async (
  userID: string,
  addressID: string,
  addressData: Omit<NewAddress, 'id' | 'createdAt' | 'updatedAt'>
): Promise<boolean> => {
  const existingUserAddress = await db.select().from(userAddress)
    .innerJoin(addressTable, eq(userAddress.addressID, addressTable.id))
    .where(
      and(
        eq(userAddress.userID, userID),
        eq(addressTable.addressLine1, addressData.addressLine1),
        eq(addressTable.city, addressData.city),
        eq(addressTable.state, addressData.state),
        eq(addressTable.postalCode, addressData.postalCode),
        // Exclude the current address being updated
        eq(userAddress.addressID, addressID)
      )
    )
    .limit(1);

  return existingUserAddress.length > 0;
};

export const setAddressAsDefault = async (userID: string, addressID: string): Promise<void> => {
  // First, unset any existing default addresses for this user
  await db.update(userAddress)
    .set({ isDefault: false })
    .where(
      and(
        eq(userAddress.userID, userID),
        eq(userAddress.isDefault, true)
      )
    );

  // Then set the new address as default
  await db.update(userAddress)
    .set({ isDefault: true })
    .where(eq(userAddress.addressID, addressID));
};