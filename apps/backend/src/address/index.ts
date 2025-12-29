import { Hono } from "hono";
import { fromZodError } from "zod-validation-error";
import { db } from "@/db";
import { createAddressSchema, getAddressListQueryParameSchema, getAddressByIdQueryParameSchema, updateAddressSchema } from "./validation";
import { 
  createAddress, 
  getAddressByID, 
  getAddressList, 
  updateAddress, 
  deleteAddress,
  checkUserAddressConflict,
  setAddressAsDefault
} from "./functions";
import { userAddress } from "./addressSchema.sql";
import { eq } from "drizzle-orm";

const addressRouter = new Hono();

addressRouter.post("/", async (c) => {
  const result = createAddressSchema.safeParse(await c.req.json());
  if (!result.success) {
    return c.json({ message: fromZodError(result.error as any).message }, 400);
  }

  const { userID, firstName, lastName, phone, isDefault, ...addressData } = result.data;
  
  // Check if user already has this exact address
  const hasAddressConflict = await checkUserAddressConflict(userID, addressData);
  if (hasAddressConflict) {
    return c.json({ 
      message: "User already has this address registered" 
    }, 409);
  }

  try {
    const address = await createAddress(addressData, { userID, firstName, lastName, phone, isDefault: false });

    // If this should be the default address, set it as default
    if (isDefault) {
      await setAddressAsDefault(userID, address.address.id);
      address.address.isDefault = true;
    }

    return c.json({
      message: "Address created successfully!",
      data: { address: address.address },
    }, 200);
  } catch (error) {
    console.error("Unexpected error in createAddress:", error);
    return c.json({ 
      message: "An unexpected error occurred while creating the address" 
    }, 500);
  }
});

addressRouter.get("/", async (c) => {
  const result = getAddressListQueryParameSchema.safeParse(c.req.query());
  if (!result.success) {
    return c.json({ message: fromZodError(result.error as any).message }, 400);
  }

  const { userID, state, city, postalCode } = result.data;
  const addressList = await getAddressList({ userID, state, city, postalCode });

  return c.json({
    message: "Address list fetched successfully!",
    data: addressList,
  }, 200)
});

addressRouter.get("/:addressID", async (c) => { 
  const result = getAddressByIdQueryParameSchema.safeParse(c.req.param());
  if (!result.success) {
    return c.json({ message: fromZodError(result.error as any).message }, 400);
  }

  const { addressID } = result.data;
  const address = await getAddressByID(addressID);

  if (!address) {
    return c.json({ error: "Address not found" }, 404);
  }

  return c.json({
    message: "Address fetched successfully!",
    data: address,
  }, 200)
});


addressRouter.put("/:addressID", async (c) => {
  const paramResult = getAddressByIdQueryParameSchema.safeParse(c.req.param());
  if (!paramResult.success) {
    return c.json({ error: fromZodError(paramResult.error as any).message }, 400);
  }

  const result = updateAddressSchema.safeParse(await c.req.json());
  if (!result.success) {
    return c.json({ error: fromZodError(result.error as any).message }, 400);
  }
  
  const { addressID } = paramResult.data;

  const userAddressData = await getAddressByID(addressID);
  if (!userAddressData) {
    return c.json({ error: "Address not found" }, 404);
  }

  const userID = userAddressData.userID;

  try {
    const updatedAddress = await updateAddress({ ...result.data, addressID });

    // If this should be the default address, set it as default
    if (result.data.isDefault) {
      await setAddressAsDefault(userID, addressID);
      // Refresh the data to get the updated default status
      updatedAddress.isDefault = true;
    }

    return c.json({
      message: "Address updated successfully!",
      data: { address: updatedAddress },
    }, 200);
  } catch (error) {
    console.error("Unexpected error in updateAddress:", error);
    return c.json({ 
      message: "An unexpected error occurred while updating the address" 
    }, 500);
  }
});

addressRouter.delete("/:addressID", async (c) => {
  const paramResult = getAddressByIdQueryParameSchema.safeParse(c.req.param());
  if (!paramResult.success) {
    return c.json({ error: fromZodError(paramResult.error as any).message }, 400);
  }
  
  const { addressID } = paramResult.data;
  const userAddressData = await getAddressByID(addressID);
  if (!userAddressData) {
    return c.json({ error: "Address not found" }, 404);
  }

  try {
    const deletedAddressData = await deleteAddress(addressID);

    return c.json({
      message: "Address deleted successfully!",
      data: { address: deletedAddressData },
    }, 200);
  } catch (error) {
    console.error("Unexpected error in deleteAddress:", error);
    return c.json({ 
      message: "An unexpected error occurred while deleting the address" 
    }, 500);
  }
});

export default addressRouter;