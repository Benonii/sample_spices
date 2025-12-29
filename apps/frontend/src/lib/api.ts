import type { ProductQueryParams, ProductListResponse, ProductDetail, CheckoutItemData, Review, CreateReviewData, GetReviewsQueryParameter } from "./types"
import type { OrderQueryParams, OrderListResponse, CompleteOrder, CreateOrderData, UpdateOrderData, CancelOrderData } from "./types"
import type { CartListResponse, AddToCartData, UpdateCartItemData } from "./types"
import { apiUrl } from "./consts"

// Product API functions
export const getProducts = async (params: ProductQueryParams = {}): Promise<ProductListResponse> => {
  const searchParams = new URLSearchParams();
  
  if (params._start !== undefined) searchParams.append('_start', params._start.toString());
  if (params._end !== undefined) searchParams.append('_end', params._end.toString());
  if (params.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params.orderBy) searchParams.append('orderBy', params.orderBy);
  if (params.categoryID) searchParams.append('categoryID', params.categoryID);
  if (params.q) searchParams.append('q', params.q);

  const response = await fetch(`${apiUrl}/product?${searchParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch products");
  }

  return await response.json();
};

export const getProduct = async (productID: string): Promise<ProductDetail> => {
  const response = await fetch(`${apiUrl}/product/${productID}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch product");
  }

  return await response.json();
};

// Order API functions
export const getOrders = async (params: OrderQueryParams = {}): Promise<OrderListResponse> => {
  const searchParams = new URLSearchParams();
  
  if (params.userID) searchParams.append('userID', params.userID);
  if (params.deliveryStatus) searchParams.append('deliveryStatus', params.deliveryStatus);
  if (params.paymentStatus) searchParams.append('paymentStatus', params.paymentStatus);
  if (params.orderStatus) searchParams.append('orderStatus', params.orderStatus);
  if (params._start !== undefined) searchParams.append('_start', params._start.toString());
  if (params._end !== undefined) searchParams.append('_end', params._end.toString());

  const fullUrl = `${apiUrl}/order?${searchParams.toString()}`;
  console.log('🌐 Calling orders API:', fullUrl);
  console.log('📝 Search params:', searchParams.toString());

  const response = await fetch(fullUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch orders");
  }

  return await response.json();
};

export const getOrder = async (orderID: string): Promise<{ message: string; data: CompleteOrder }> => {
  const response = await fetch(`${apiUrl}/order/${orderID}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch order");
  }

  return await response.json();
};

export const createOrder = async (orderData: CreateOrderData): Promise<{ message: string; data: { order: CompleteOrder } }> => {
  const response = await fetch(`${apiUrl}/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create order");
  }

  return await response.json();
};

export const updateOrder = async (orderID: string, orderData: UpdateOrderData): Promise<{ message: string; data: CompleteOrder }> => {
  const response = await fetch(`${apiUrl}/order/${orderID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update order");
  }

  return await response.json();
};

export const cancelOrder = async (orderID: string, cancelData: CancelOrderData): Promise<{ message: string; data: CompleteOrder }> => {
  const response = await fetch(`${apiUrl}/order/${orderID}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cancelData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to cancel order");
  }

  return await response.json();
};

export const deleteOrder = async (orderID: string): Promise<{ message: string }> => {
  const response = await fetch(`${apiUrl}/order/${orderID}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete order");
  }

  return await response.json();
};

// Cart API functions
export const getCartItems = async (userID: string, params: { page?: number; limit?: number } = {}): Promise<CartListResponse> => {
  const searchParams = new URLSearchParams();
  searchParams.append('userID', userID);
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());

  const response = await fetch(`${apiUrl}/cart?${searchParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch cart items");
  }

  return await response.json();
};

export const addToCart = async (cartData: AddToCartData): Promise<{ message: string; data: any }> => {
  const response = await fetch(`${apiUrl}/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cartData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to add item to cart");
  }

  return await response.json();
};

export const updateCartItem = async (cartItemId: string, updateData: UpdateCartItemData): Promise<{ message: string; data: any }> => {
  const response = await fetch(`${apiUrl}/cart/${cartItemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update cart item");
  }

  return await response.json();
};

export const deleteCartItem = async (cartItemId: string, userID: string): Promise<{ message: string; data: any }> => {
  const response = await fetch(`${apiUrl}/cart/${cartItemId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userID }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to remove cart item");
  }

  return await response.json();
};

export const getCheckoutSession = async (checkoutItems: CheckoutItemData[], addressID: string, userID: string) => {
  const response = await fetch(`${apiUrl}/cart/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ checkoutItems, addressID, userID}),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to get checkout session");
  }

  return await response.json();
};

export const createReview = async (review: CreateReviewData) => {
  const response = await fetch(`${apiUrl}/review`, {
    method: "POST",
    body: JSON.stringify(review),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create review");
  }

  return await response.json();
}

export const getReviews = async (params: GetReviewsQueryParameter) => {
  const searchParams = new URLSearchParams();
  
  if (params.productID) searchParams.append('productID', params.productID);
  if (params.userID) searchParams.append('userID', params.userID);
  if (params.rating !== undefined) searchParams.append('rating', params.rating.toString());
  if (params.from) searchParams.append('from', params.from);
  if (params.to) searchParams.append('to', params.to);
  if (params._start !== undefined) searchParams.append('_start', params._start.toString());
  if (params._end !== undefined) searchParams.append('_end', params._end.toString());

  const response = await fetch(`${apiUrl}/review?${searchParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to get reviews");
  }

  return await response.json();
}

export const getReview = async (reviewID: string) => {
  const response = await fetch(`${apiUrl}/review/${reviewID}`, {
    method: "GET",
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to get review");
  }

  return await response.json();
}

export const deleteReview = async (reviewID: string) => {
  const response = await fetch(`${apiUrl}/review/${reviewID}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete review");
  }

  return await response.json();
}

// Address API functions
export const getAddresses = async (userID: string): Promise<{ message: string; data: any[] }> => {
  const response = await fetch(`${apiUrl}/address?userID=${userID}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch addresses");
  }

  return await response.json();
};

export const createAddress = async (addressData: any): Promise<{ message: string; data: { address: any } }> => {
  const response = await fetch(`${apiUrl}/address`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(addressData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create address");
  }

  return await response.json();
};

export const updateAddress = async (addressID: string, addressData: any): Promise<{ message: string; data: { address: any } }> => {
  const response = await fetch(`${apiUrl}/address/${addressID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(addressData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update address");
  }

  return await response.json();
};

export const deleteAddress = async (addressID: string): Promise<{ message: string; data: any }> => {
  const response = await fetch(`${apiUrl}/address/${addressID}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete address");
  }

  return await response.json();
};