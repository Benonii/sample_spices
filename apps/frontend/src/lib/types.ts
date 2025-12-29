import z from "zod";

export const loginSchema = z.object({
	email: z
	  .string()
	  .min(1, "Email is required")
	  .email("Please enter a valid email address"),
	password: z
	  .string()
	  .min(1, "Password is required")
	  .min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const newPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

export const signupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const checkoutSchema = z.object({  
  checkoutItems: z.object({
    productID: z.string().min(1, "Product ID is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  }).array(),
});

export const createReviewSchema = z.object({
  productID: z.string().min(1, "Product ID is required"),
  userID: z.string().min(1, "User ID is required"),
  rating: z.number().min(0.5, "Rating must be at least 0.5").max(5, "Rating cannot exceed 5"),
  comment: z.string().optional(),
});

export const getReviewsQueryParameterSchema = z.object({
  productID: z.string().optional(),
  userID: z.string().optional(),
  rating: z.coerce.number().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  _start: z.coerce.number().min(0).default(0),
  _end: z.coerce.number().min(0).default(10),
}).refine((data) => {
  if (!data.productID && !data.userID) {
    return false;
  }
  return true;
}, {
  message: "Either productID or userID must be provided",
});

export type GetReviewsQueryParameter = z.infer<typeof getReviewsQueryParameterSchema>;

export type SignupFormData = z.infer<typeof signupSchema>;

// Product Types
export type ProductStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  category?: string;
  inventory?: number;
  imageUrl?: string;
  reviews?: {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
    };
  }[];
};

export type ProductListResponse = {
  list: Product[];
  page: number;
  pageSize: number;
  total: number;
};

export type ProductQueryParams = {
  _start?: number;
  _end?: number;
  sortBy?: "name" | "price" | "createdAt";
  orderBy?: "ASC" | "DESC";
  categoryID?: string;
  q?: string;
};

export type ProductDetail = {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    description?: string;
  }[];
  inventory?: {
    id: string;
    quantity: number;
    reservedQuantity: number;
    lowStockThreshold: number;
  }[];
  reviews?: {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
    };
  }[];
  images?: {
    id: string;
    imageUrl: string;
    isPrimary: boolean;
    orderIndex: number;
  }[];
};

export type Transaction = {
    id: string;
    productName: string;
    invoiceID: string;
    amount: string;
    status: "PAID" | "OPEN" | "FAILED";
    subscriptionID: string;
    billingReason: "subscription_create" | "subscription_cancel";
    customerID: string;
    createdAt: string;
    updatedAt: string;
}

export type TransactionData = {
    list: Transaction[];
    pendingBalance: number | string;
    availableBalance: number | string;
    page: number;
    pageSize: number;
    total: number
}

export type AccountInformation = {
    data: {
        id: string;
        createdAt: string;
        updatedAt: string;
        name: string;
        email: string;
        country: string;
    }
}

export type LoginResponse = {
    redirect: boolean,
    token: string,
    user: {
      id: string
      email: string,
      name: string,
      image: string,
      emailVerified: true,
      createdAt: string | Date,
      updatedAt: string | Date
    }
}

// Order Types
export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
export type DeliveryStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export type Order = {
  id: string;
  orderNumber: string;
  userID: string;
  addressID: string;
  productID: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  grandTotal: number;
  deliveryStatus: DeliveryStatus;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentMethod?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
  refundAmount: number;
};

export type CompleteOrder = {
  order: Order;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    rating: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  productImage?: {
    id: string;
    imageUrl: string;
    isPrimary: boolean;
    orderIndex: number;
  };
  address: {
    id: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  userAddress: {
    id: string;
    userID: string;
    addressID: string;
    addressType: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type OrderListResponse = {
  message: string;
  data: BackendOrder[];
};

export type OrderQueryParams = {
  userID?: string;
  search?: string;
  status?: OrderStatus;
  deliveryStatus?: DeliveryStatus;
  paymentStatus?: PaymentStatus;
  orderStatus?: OrderStatus;
  _start?: number;
  _end?: number;
};

export type CreateOrderData = {
  userID: string;
  addressID: string;
  productID: string;
  quantity: number;
  taxAmount?: number;
  shippingCost?: number;
  discountAmount?: number;
  paymentMethod?: string;
  notes?: string;
};

export type UpdateOrderData = {
  deliveryStatus?: DeliveryStatus;
  paymentStatus?: PaymentStatus;
  orderStatus?: OrderStatus;
  trackingNumber?: string;
  notes?: string;
};

export type CancelOrderData = {
  reason: string;
};

// Backend order response structure (what the API actually returns)
export type BackendOrder = {
  id: string;
  orderNumber: string;
  userID: string;
  addressID: string;
  productID: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  grandTotal: number;
  deliveryStatus: DeliveryStatus;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentMethod?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
  refundAmount: number;
  productName: string;
  productDescription: string;
  productPrice: number;
  productMainImage: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  userEmail: string;
};

// Cart Types
export type CartItem = {
  id: string;
  userID: string;
  productID: string;
  quantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  productName?: string;
  productPrice?: number;
  productStatus?: string;
  productImage?: string;
  productDescription?: string;
};

export type CartListResponse = {
  items: CartItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type AddToCartData = {
  productID: string;
  userID: string;
  quantity: number;
};

export type UpdateCartItemData = {
  id: string;
  quantity: number;
  userID: string;
};

export type DeleteCartItemData = {
  id: string;
};

export type CheckoutItemData = {
  productID: string;
  quantity: number;
};

// Review Types
export type Review = {
  id: string;
  userID: string;
  productID: string;
  rating: number | string; // Can be string from API or number
  comment?: string;
  createdAt: string;
  updatedAt: string;
  reviewerName: string;
};

export type CreateReviewData = {
  productID: string;
  userID: string;
  rating: number;
  comment?: string;
};

export type ReviewFormData = {
  rating: number; // Supports decimal values like 3.5 for half stars
  comment: string;
};

// Address Types
export type Address = {
  id: string;
  userID: string;
  firstName: string;
  lastName: string;
  phone: string;
  isDefault: boolean;
  addressLine1: string;
  addressLine2: string | null;
  state: string;
  city: string;
  postalCode: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateAddressData = {
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  state: string;
  city: string;
  postalCode: string;
  userID: string;
  isDefault?: boolean;
};

export type UpdateAddressData = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  isDefault?: boolean;
};

export type AddressFormData = {
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  state: string;
  city: string;
  postalCode: string;
  isDefault?: boolean;
};